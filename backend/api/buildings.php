<?php
declare(strict_types=1);
require __DIR__ . '/../lib/bootstrap.php';
require __DIR__ . '/../lib/records.php';

/**
 * GET    /api/buildings.php          όλα τα κτίρια                       · admin, user
 * POST   /api/buildings.php          νέο κτίριο                          · admin
 * PUT    /api/buildings.php?id=…     ενημέρωση                           · admin
 * DELETE /api/buildings.php?id=…     διαγραφή (οι χώροι μένουν χωρίς κτίριο) · admin
 */
$m = allow('GET', 'POST', 'PUT', 'DELETE');
$id = trim((string) ($_GET['id'] ?? ''));

function find_building(string $id): array
{
    $st = db()->prepare(BUILDING_SELECT . ' WHERE b.id = ?');
    $st->execute([$id]);
    $row = $st->fetch();
    if (!$row) fail('Το κτίριο δεν βρέθηκε.', 404);
    return $row;
}

if ($m === 'GET') {
    require_role('admin', 'user');
    if ($id !== '') json_out(building_out(find_building($id)));
    $rows = db()->query(BUILDING_SELECT . ' ORDER BY b.code IS NULL, b.code, b.name_el')->fetchAll();
    json_out(array_map('building_out', $rows));
}

$user = require_role('admin');

if ($m === 'POST') {
    $row = building_in(body());
    $newId = new_id();
    sql_insert('buildings', ['id' => $newId, 'updated_by' => $user['id']] + $row);
    log_activity($user, 'create', 'building', $newId, 'Δημιούργησε το κτίριο ' . $row['name_el']);
    json_out(building_out(find_building($newId)), 201);
}

if ($id === '') fail('Λείπει το id.', 400);
$before = find_building($id);

if ($m === 'PUT') {
    $row = building_in(body());
    sql_update('buildings', $id, $row + ['updated_by' => $user['id']]);
    log_activity($user, 'update', 'building', $id, 'Ενημέρωσε το κτίριο ' . $row['name_el']);
    json_out(building_out(find_building($id)));
}

db()->prepare('DELETE FROM buildings WHERE id = ?')->execute([$id]);
log_activity($user, 'delete', 'building', $id, 'Διέγραψε το κτίριο ' . $before['name_el']);
json_out(['ok' => true]);
