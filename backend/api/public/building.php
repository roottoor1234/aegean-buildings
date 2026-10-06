<?php
declare(strict_types=1);
require __DIR__ . '/../../lib/bootstrap.php';
require __DIR__ . '/../../lib/records.php';

/** Σελίδα κτιρίου: /b/{code|id} με τους δημοσιευμένους χώρους του. */
allow('GET');

$slug = trim((string) ($_GET['slug'] ?? ''));
if ($slug === '') fail('Λείπει ο κωδικός κτιρίου.', 400);

$st = db()->prepare(BUILDING_SELECT . ' WHERE b.published = 1 AND (b.code = ? OR b.id = ?) ORDER BY b.code = ? DESC LIMIT 1');
$st->execute([$slug, $slug, $slug]);
$row = $st->fetch();
if (!$row) fail('Το κτίριο δεν βρέθηκε.', 404);

$st = db()->prepare(OFFICE_SELECT . ' WHERE o.published = 1 AND o.building_id = ?');
$st->execute([$row['id']]);

$building = building_out($row);
unset($building['updatedBy']);

json_out([
    'building' => $building,
    'offices'  => array_map(function ($o) {
        $o = office_out($o);
        unset($o['updatedBy']);
        return $o;
    }, sort_by_code($st->fetchAll())),
]);
