<?php
declare(strict_types=1);

/**
 * Εγκατάσταση βάσης: δημιουργεί DB + πίνακες, φορτώνει τα data/*.json (αν οι πίνακες είναι άδειοι)
 * και τον πρώτο διαχειριστή από το .env. Ασφαλές να ξανατρέξει.
 *
 *   npm run db:setup
 *   php backend/db/setup.php --demo-user    (προσθέτει και χρήστη προβολής user@aegean.gr / user12345)
 */

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require __DIR__ . '/../lib/bootstrap.php';
require __DIR__ . '/../lib/records.php';
restore_exception_handler();

$out = fn (string $s) => fwrite(STDOUT, $s . PHP_EOL);

// 1. Database
$name = env('DB_NAME', 'aegean_signage');
if (!preg_match('/^[A-Za-z0-9_]+$/', $name)) {
    fwrite(STDERR, "Μη έγκυρο DB_NAME\n");
    exit(1);
}
try {
    $server = new PDO(
        sprintf('mysql:host=%s;port=%s;charset=utf8mb4', env('DB_HOST', 'localhost'), env('DB_PORT', '3306')),
        env('DB_USER', 'root'),
        env('DB_PASS'),
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    fwrite(STDERR, "Δεν βρέθηκε MySQL. Ξεκίνα το MySQL από το XAMPP Control Panel.\n" . $e->getMessage() . "\n");
    exit(1);
}
$server->exec("CREATE DATABASE IF NOT EXISTS `$name` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
$out("✓ Βάση `$name`");

// 2. Schema
$pdo = db();
$sql = file_get_contents(__DIR__ . '/schema.sql');
$sql = preg_replace('/^\s*--.*$/m', '', $sql);
foreach (array_filter(array_map('trim', explode(';', $sql))) as $stmt) {
    $pdo->exec($stmt);
}
$out('✓ Πίνακες');

// 3. Seed
$dataDir = realpath(__DIR__ . '/../../data');
$count = fn (string $t) => (int) $pdo->query("SELECT COUNT(*) FROM `$t`")->fetchColumn();

if ($count('buildings') === 0 && is_file("$dataDir/buildings.json")) {
    $rows = json_decode(file_get_contents("$dataDir/buildings.json"), true) ?: [];
    $st = $pdo->prepare(
        'INSERT INTO buildings (id, code, published, phone, email, website, lat, lng,
            name_el, name_en, island_el, island_en, school_el, school_en, address_el, address_en,
            notes_el, notes_en, departments_el, departments_en)
         VALUES (?,?,?,?,?,?,?,?, ?,?,?,?,?,?,?,?, ?,?,?,?)'
    );
    foreach ($rows as $b) {
        $st->execute([
            $b['id'], ($b['buildingCode'] ?? '') ?: null, !empty($b['published']) ? 1 : 0,
            ($b['phone'] ?? '') ?: null, ($b['email'] ?? '') ?: null, ($b['website'] ?? '') ?: null,
            $b['lat'] ?? null, $b['lng'] ?? null,
            $b['el']['name'] ?? '', $b['en']['name'] ?? '',
            $b['el']['island'] ?? '', $b['en']['island'] ?? '',
            $b['el']['school'] ?? '', $b['en']['school'] ?? '',
            $b['el']['address'] ?? '', $b['en']['address'] ?? '',
            $b['el']['notes'] ?? '', $b['en']['notes'] ?? '',
            json_encode($b['el']['departments'] ?? [], JSON_UNESCAPED_UNICODE),
            json_encode($b['en']['departments'] ?? [], JSON_UNESCAPED_UNICODE),
        ]);
    }
    $out('✓ Κτίρια: ' . count($rows));
}

if ($count('offices') === 0 && is_file("$dataDir/offices.json")) {
    $rows = json_decode(file_get_contents("$dataDir/offices.json"), true) ?: [];
    $st = $pdo->prepare(
        'INSERT INTO offices (id, code, building_id, kind, published, phone, email,
            label_el, label_en, occupant_el, occupant_en, title_el, title_en,
            department_el, department_en, notes_el, notes_en)
         VALUES (?,?,?,?,?,?,?, ?,?,?,?,?,?, ?,?,?,?)'
    );
    foreach ($rows as $o) {
        $email = trim($o['email'] ?? '');
        $st->execute([
            $o['id'], trim($o['code'] ?? '') ?: null, ($o['buildingId'] ?? '') ?: null,
            in_array($o['kind'] ?? '', OFFICE_KINDS, true) ? $o['kind'] : 'office',
            !empty($o['published']) ? 1 : 0,
            trim($o['phone'] ?? '') ?: null,
            filter_var($email, FILTER_VALIDATE_EMAIL) ? $email : null,
            $o['el']['label'] ?? '', $o['en']['label'] ?? '',
            $o['el']['occupant'] ?? '', $o['en']['occupant'] ?? '',
            $o['el']['title'] ?? '', $o['en']['title'] ?? '',
            $o['el']['department'] ?? '', $o['en']['department'] ?? '',
            $o['el']['notes'] ?? '', $o['en']['notes'] ?? '',
        ]);
    }
    $out('✓ Χώροι: ' . count($rows));
}

// 4. Πρώτος διαχειριστής
$hasAdmin = (int) $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'admin'")->fetchColumn() > 0;
if (!$hasAdmin) {
    $email = env('ADMIN_EMAIL', 'admin@aegean.gr');
    $pass  = env('ADMIN_PASSWORD');
    if (strlen($pass) < 8) {
        fwrite(STDERR, "Βάλε ADMIN_PASSWORD (≥ 8 χαρακτήρες) στο backend/.env και ξανατρέξε.\n");
        exit(1);
    }
    $pdo->prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')")
        ->execute([env('ADMIN_NAME', 'Διαχειριστής'), strtolower($email), password_hash($pass, PASSWORD_DEFAULT)]);
    $out("✓ Διαχειριστής: $email");
}

if (in_array('--demo-user', $argv, true)) {
    $pdo->prepare(
        "INSERT IGNORE INTO users (name, email, password_hash, role) VALUES ('Χρήστης προβολής', 'user@aegean.gr', ?, 'user')"
    )->execute([password_hash('user12345', PASSWORD_DEFAULT)]);
    $out('✓ Χρήστης προβολής: user@aegean.gr / user12345');
}

$out('Έτοιμο.');

