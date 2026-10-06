<?php
declare(strict_types=1);
require __DIR__ . '/../../lib/bootstrap.php';
require __DIR__ . '/../../lib/records.php';

/** Δημόσιος κατάλογος: μόνο δημοσιευμένα κτίρια και χώροι. */
allow('GET');

$buildings = db()->query(BUILDING_SELECT . ' WHERE b.published = 1 ORDER BY b.code, b.name_el')->fetchAll();
$offices = sort_by_code(db()->query(
    OFFICE_SELECT . ' WHERE o.published = 1'
)->fetchAll());

$strip = function (array $o): array {
    unset($o['updatedBy']);
    return $o;
};

json_out([
    'buildings' => array_map(fn ($b) => $strip(building_out($b)), $buildings),
    'offices'   => array_map(fn ($o) => $strip(office_out($o)), $offices),
]);
