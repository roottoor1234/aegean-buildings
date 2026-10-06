<?php
declare(strict_types=1);
require __DIR__ . '/../lib/bootstrap.php';

/**
 * Διαχείριση λογαριασμών · μόνο admin.
 * GET / POST / PUT ?id= / DELETE ?id=
 * Προστασία: δεν αφαιρείς από τον εαυτό σου τον ρόλο admin, δεν τον απενεργοποιείς, δεν τον διαγράφεις,
 * και δεν μένει ποτέ το σύστημα χωρίς ενεργό admin.
 */
$m = allow('GET', 'POST', 'PUT', 'DELETE');
$me = require_role('admin');
$id = (int) ($_GET['id'] ?? 0);

function find_user(int $id): array
{
    $st = db()->prepare('SELECT * FROM users WHERE id = ?');
    $st->execute([$id]);
    $u = $st->fetch();
    if (!$u) fail('Ο χρήστης δεν βρέθηκε.', 404);
    return $u;
}

function active_admins_except(int $id): int
{
    $st = db()->prepare("SELECT COUNT(*) FROM users WHERE role = 'admin' AND active = 1 AND id <> ?");
    $st->execute([$id]);
    return (int) $st->fetchColumn();
}

function validated_user_fields(array $in, bool $creating): array
{
    $name = str_in($in, 'name', 120);
    $email = strtolower(str_in($in, 'email', 190));
    $role = str_in($in, 'role', 10);
    if ($name === '') fail('Το ονοματεπώνυμο είναι υποχρεωτικό.', 422, ['field' => 'name']);
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) fail('Το email δεν είναι έγκυρο.', 422, ['field' => 'email']);
    if (!in_array($role, ROLES, true)) fail('Άκυρος ρόλος.', 422, ['field' => 'role']);

    $fields = ['name' => $name, 'email' => $email, 'role' => $role, 'active' => !array_key_exists('active', $in) || !empty($in['active']) ? 1 : 0];
    $password = (string) ($in['password'] ?? '');
    if ($creating || $password !== '') {
        if (mb_strlen($password) < 8) fail('Ο κωδικός χρειάζεται τουλάχιστον 8 χαρακτήρες.', 422, ['field' => 'password']);
        $fields['password_hash'] = password_hash($password, PASSWORD_DEFAULT);
    }
    return $fields;
}

if ($m === 'GET') {
    $rows = db()->query('SELECT * FROM users ORDER BY role, name')->fetchAll();
    json_out(array_map('public_user', $rows));
}

if ($m === 'POST') {
    $f = validated_user_fields(body(), true);
    $cols = array_keys($f);
    db()->prepare(sprintf(
        'INSERT INTO users (%s) VALUES (%s)',
        implode(', ', $cols),
        implode(', ', array_fill(0, count($cols), '?'))
    ))->execute(array_values($f));
    $newId = (int) db()->lastInsertId();
    log_activity($me, 'create', 'user', (string) $newId, "Πρόσθεσε τον χρήστη {$f['name']} ({$f['role']})");
    json_out(public_user(find_user($newId)), 201);
}

if (!$id) fail('Λείπει το id.', 400);
$before = find_user($id);
$isSelf = $id === $me['id'];

if ($m === 'PUT') {
    $f = validated_user_fields(body(), false);
    $losesAdmin = $before['role'] === 'admin' && ($f['role'] !== 'admin' || !$f['active']);
    if ($isSelf && $losesAdmin) fail('Δεν μπορείτε να αφαιρέσετε από τον εαυτό σας τον ρόλο διαχειριστή.', 422);
    if ($losesAdmin && active_admins_except($id) === 0) fail('Πρέπει να υπάρχει τουλάχιστον ένας ενεργός διαχειριστής.', 422);

    $sets = implode(', ', array_map(fn ($c) => "$c = ?", array_keys($f)));
    db()->prepare("UPDATE users SET $sets WHERE id = ?")->execute([...array_values($f), $id]);
    $what = isset($f['password_hash']) ? ' (νέος κωδικός)' : '';
    log_activity($me, 'update', 'user', (string) $id, "Ενημέρωσε τον χρήστη {$f['name']}$what");
    json_out(public_user(find_user($id)));
}

// DELETE
if ($isSelf) fail('Δεν μπορείτε να διαγράψετε τον δικό σας λογαριασμό.', 422);
if ($before['role'] === 'admin' && active_admins_except($id) === 0) fail('Πρέπει να υπάρχει τουλάχιστον ένας ενεργός διαχειριστής.', 422);
db()->prepare('DELETE FROM users WHERE id = ?')->execute([$id]);
log_activity($me, 'delete', 'user', (string) $id, "Διέγραψε τον χρήστη {$before['name']}");
json_out(['ok' => true]);
