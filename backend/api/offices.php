<?php
declare(strict_types=1);
require __DIR__ . '/../lib/bootstrap.php';
require __DIR__ . '/../lib/records.php';

/**
 * GET    /api/offices.php            όλοι οι χώροι (και μη δημοσιευμένοι) · admin, user
 * GET    /api/offices.php?id=…       ένας χώρος                           · admin, user
 * POST   /api/offices.php            νέος χώρος                           · admin
 * PUT    /api/offices.php?id=…       ενημέρωση                            · admin
 * DELETE /api/offices.php?id=…       διαγραφή                             · admin
 */
$m = allow('GET', 'POST', 'PUT', 'DELETE');
$id = trim((string) ($_GET['id'] ?? ''));

function find_office(string $id): array
{
    $st = db()->prepare(OFFICE_SELECT . ' WHERE o.id = ?');
    $st->execute([$id]);
    $row = $st->fetch();
    if (!$row) fail('Ο χώρος δεν βρέθηκε.', 404);
    return $row;
}

function office_name(array $row): string
{
    return trim(($row['code'] ? $row['code'] . ' · ' : '') . ($row['occupant_el'] ?: $row['label_el']));
}

if ($m === 'GET') {
    require_role('admin', 'user');
    if ($id !== '') json_out(office_out(find_office($id)));
    $rows = sort_by_code(db()->query(OFFICE_SELECT)->fetchAll());
    json_out(array_map('office_out', $rows));
}

$user = require_role('admin');

if ($m === 'POST') {
    $row = office_in(body());
    $newId = new_id();
    sql_insert('offices', ['id' => $newId, 'updated_by' => $user['id']] + $row);
    log_activity($user, 'create', 'office', $newId, 'Δημιούργησε τον χώρο ' . office_name($row));
    json_out(office_out(find_office($newId)), 201);
}

if ($id === '') fail('Λείπει το id.', 400);
$before = find_office($id);

if ($m === 'PUT') {
    $row = office_in(body());
    sql_update('offices', $id, $row + ['updated_by' => $user['id']]);
    $verb = $before['published'] && !$row['published'] ? 'Απέσυρε' : (!$before['published'] && $row['published'] ? 'Δημοσίευσε' : 'Ενημέρωσε');
    log_activity($user, 'update', 'office', $id, "$verb τον χώρο " . office_name($row));
    json_out(office_out(find_office($id)));
}

// DELETE
db()->prepare('DELETE FROM offices WHERE id = ?')->execute([$id]);
log_activity($user, 'delete', 'office', $id, 'Διέγραψε τον χώρο ' . office_name($before));
json_out(['ok' => true]);
