<?php
declare(strict_types=1);

/**
 * Μετατροπή γραμμών MySQL ↔ JSON σχήματος του frontend, και validation εισόδου.
 */

const OFFICE_KINDS = ['office', 'lab', 'room'];
const OFFICE_TEXT  = ['label', 'occupant', 'title', 'department', 'notes'];
const BUILDING_TEXT = ['name', 'island', 'school', 'address', 'notes'];

// ─── Offices ────────────────────────────────────────────────────────────────

function office_out(array $r): array
{
    $loc = fn (string $lang) => [
        'label'      => $r["label_$lang"],
        'occupant'   => $r["occupant_$lang"],
        'title'      => $r["title_$lang"],
        'department' => $r["department_$lang"],
        'notes'      => (string) ($r["notes_$lang"] ?? ''),
    ];
    return [
        'id'         => $r['id'],
        'code'       => (string) ($r['code'] ?? ''),
        'buildingId' => $r['building_id'],
        'kind'       => $r['kind'],
        'published'  => (bool) (int) $r['published'],
        'phone'      => (string) ($r['phone'] ?? ''),
        'email'      => (string) ($r['email'] ?? ''),
        'el'         => $loc('el'),
        'en'         => $loc('en'),
        'updatedAt'  => $r['updated_at'] ?? null,
        'updatedBy'  => $r['updated_by_name'] ?? null,
    ];
}

/** Επιστρέφει [στήλη => τιμή] έτοιμο για INSERT/UPDATE· κάνει fail() σε άκυρα δεδομένα. */
function office_in(array $in): array
{
    $code = str_in($in, 'code', 32);
    if ($code !== '' && !preg_match('/^[\p{L}\p{N}._-]+$/u', $code)) {
        fail('Η αρίθμηση επιτρέπει μόνο γράμματα, αριθμούς, τελεία, παύλα (π.χ. 1.1.1).', 422, ['field' => 'code']);
    }
    $kind = str_in($in, 'kind', 10) ?: 'office';
    if (!in_array($kind, OFFICE_KINDS, true)) fail('Άκυρο είδος χώρου.', 422, ['field' => 'kind']);

    $email = str_in($in, 'email', 190);
    if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        fail('Το email δεν είναι έγκυρο.', 422, ['field' => 'email']);
    }

    $buildingId = str_in($in, 'buildingId', 16);
    if ($buildingId !== '') {
        $st = db()->prepare('SELECT 1 FROM buildings WHERE id = ?');
        $st->execute([$buildingId]);
        if (!$st->fetchColumn()) fail('Το κτίριο δεν υπάρχει.', 422, ['field' => 'buildingId']);
    }

    $row = [
        'code'        => nullable($code),
        'building_id' => nullable($buildingId),
        'kind'        => $kind,
        'published'   => !empty($in['published']) ? 1 : 0,
        'phone'       => nullable(str_in($in, 'phone', 64)),
        'email'       => nullable($email),
    ];
    foreach (['el', 'en'] as $lang) {
        $loc = is_array($in[$lang] ?? null) ? $in[$lang] : [];
        foreach (OFFICE_TEXT as $f) {
            $row["{$f}_$lang"] = str_in($loc, $f, $f === 'notes' ? 4000 : 255);
        }
    }
    if ($row['label_el'] === '' && $row['occupant_el'] === '') {
        fail('Συμπληρώστε τουλάχιστον ετικέτα ή όνομα (ελληνικά).', 422, ['field' => 'el.label']);
    }
    return $row;
}

const OFFICE_SELECT = 'SELECT o.*, u.name AS updated_by_name FROM offices o LEFT JOIN users u ON u.id = o.updated_by';

// ─── Buildings ──────────────────────────────────────────────────────────────

function building_out(array $r): array
{
    $loc = function (string $lang) use ($r): array {
        $deps = json_decode((string) ($r["departments_$lang"] ?? '[]'), true);
        return [
            'name'        => $r["name_$lang"],
            'island'      => $r["island_$lang"],
            'school'      => $r["school_$lang"],
            'address'     => $r["address_$lang"],
            'notes'       => (string) ($r["notes_$lang"] ?? ''),
            'departments' => is_array($deps) ? array_values($deps) : [],
        ];
    };
    return [
        'id'        => $r['id'],
        'code'      => (string) ($r['code'] ?? ''),
        'published' => (bool) (int) $r['published'],
        'phone'     => (string) ($r['phone'] ?? ''),
        'email'     => (string) ($r['email'] ?? ''),
        'website'   => (string) ($r['website'] ?? ''),
        'lat'       => $r['lat'] !== null ? (float) $r['lat'] : null,
        'lng'       => $r['lng'] !== null ? (float) $r['lng'] : null,
        'el'        => $loc('el'),
        'en'        => $loc('en'),
        'updatedAt' => $r['updated_at'] ?? null,
        'updatedBy' => $r['updated_by_name'] ?? null,
    ];
}

function building_in(array $in): array
{
    $code = str_in($in, 'code', 32);
    if ($code !== '' && !preg_match('/^[\p{L}\p{N}._-]+$/u', $code)) {
        fail('Ο κωδικός κτιρίου επιτρέπει μόνο γράμματα, αριθμούς, τελεία, παύλα.', 422, ['field' => 'code']);
    }
    $email = str_in($in, 'email', 190);
    if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        fail('Το email δεν είναι έγκυρο.', 422, ['field' => 'email']);
    }
    $website = str_in($in, 'website', 500);
    if ($website !== '' && !preg_match('#^https?://#i', $website)) {
        fail('Η ιστοσελίδα πρέπει να ξεκινά με https://', 422, ['field' => 'website']);
    }
    $coord = function (string $key, float $limit): ?float {
        $v = body()[$key] ?? null;
        if ($v === null || $v === '') return null;
        if (!is_numeric($v) || abs((float) $v) > $limit) {
            fail('Μη έγκυρες συντεταγμένες.', 422, ['field' => $key]);
        }
        return round((float) $v, 6);
    };

    $row = [
        'code'      => nullable($code),
        'published' => !empty($in['published']) ? 1 : 0,
        'phone'     => nullable(str_in($in, 'phone', 64)),
        'email'     => nullable($email),
        'website'   => nullable($website),
        'lat'       => $coord('lat', 90),
        'lng'       => $coord('lng', 180),
    ];
    foreach (['el', 'en'] as $lang) {
        $loc = is_array($in[$lang] ?? null) ? $in[$lang] : [];
        foreach (BUILDING_TEXT as $f) {
            $row["{$f}_$lang"] = str_in($loc, $f, $f === 'notes' ? 4000 : 255);
        }
        $deps = is_array($loc['departments'] ?? null) ? $loc['departments'] : [];
        $deps = array_values(array_filter(array_map(
            fn ($d) => is_scalar($d) ? mb_substr(trim((string) $d), 0, 255) : '',
            $deps
        ), fn ($d) => $d !== ''));
        $row["departments_$lang"] = json_encode($deps, JSON_UNESCAPED_UNICODE);
    }
    if ($row['name_el'] === '') fail('Το όνομα κτιρίου (ελληνικά) είναι υποχρεωτικό.', 422, ['field' => 'el.name']);
    return $row;
}

const BUILDING_SELECT = 'SELECT b.*, u.name AS updated_by_name FROM buildings b LEFT JOIN users u ON u.id = b.updated_by';

// ─── Generic SQL helpers ────────────────────────────────────────────────────

function sql_insert(string $table, array $row): void
{
    $cols = array_keys($row);
    $sql = sprintf(
        'INSERT INTO `%s` (%s) VALUES (%s)',
        $table,
        implode(', ', array_map(fn ($c) => "`$c`", $cols)),
        implode(', ', array_fill(0, count($cols), '?'))
    );
    db()->prepare($sql)->execute(array_values($row));
}

function sql_update(string $table, string $id, array $row): void
{
    $sets = implode(', ', array_map(fn ($c) => "`$c` = ?", array_keys($row)));
    db()->prepare("UPDATE `$table` SET $sets WHERE id = ?")->execute([...array_values($row), $id]);
}

/** Φυσική ταξινόμηση κωδικών (1.1.2 < 1.1.10 < 2.2.1), χωρίς κωδικό στο τέλος. */
function sort_by_code(array $rows): array
{
    usort($rows, function (array $a, array $b): int {
        $ca = (string) ($a['code'] ?? '');
        $cb = (string) ($b['code'] ?? '');
        if ($ca === '' || $cb === '') return ($ca === '') <=> ($cb === '');
        return strnatcmp($ca, $cb);
    });
    return $rows;
}
