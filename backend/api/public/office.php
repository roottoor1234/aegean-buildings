<?php
declare(strict_types=1);
require __DIR__ . '/../../lib/bootstrap.php';
require __DIR__ . '/../../lib/records.php';

/** Σελίδα πόρτας: /o/{code|id}. Επιστρέφει τον χώρο και το κτίριό του. */
allow('GET');

$slug = trim((string) ($_GET['slug'] ?? ''));
if ($slug === '') fail('Λείπει ο κωδικός χώρου.', 400);

$st = db()->prepare(OFFICE_SELECT . ' WHERE o.published = 1 AND (o.code = ? OR o.id = ?) ORDER BY o.code = ? DESC LIMIT 1');
$st->execute([$slug, $slug, $slug]);
$row = $st->fetch();
if (!$row) fail('Ο χώρος δεν βρέθηκε.', 404);

$office = office_out($row);
unset($office['updatedBy']);

$building = null;
if ($row['building_id']) {
    $st = db()->prepare(BUILDING_SELECT . ' WHERE b.id = ? AND b.published = 1');
    $st->execute([$row['building_id']]);
    if ($b = $st->fetch()) {
        $building = building_out($b);
        unset($building['updatedBy']);
    }
}

json_out(['office' => $office, 'building' => $building]);
