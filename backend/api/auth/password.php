<?php
declare(strict_types=1);
require __DIR__ . '/../../lib/bootstrap.php';

/** Αλλαγή του δικού μου κωδικού (κάθε ρόλος). */
allow('POST');
$user = require_role();

$in = body();
$current = (string) ($in['current'] ?? '');
$next = (string) ($in['next'] ?? '');


$st = db()->prepare('SELECT password_hash FROM users WHERE id = ?');
$st->execute([$user['id']]);
if (!password_verify($current, (string) $st->fetchColumn())) {
    fail('Ο τρέχων κωδικός δεν είναι σωστός.', 422, ['field' => 'current']);
}

validate_new_password($next, $user['email'], 'next');
if (hash_equals($current, $next)) fail('Ο νέος κωδικός πρέπει να διαφέρει από τον τρέχοντα.', 422, ['field' => 'next']);

$hash = hash_password($next);
db()->prepare('UPDATE users SET password_hash = ? WHERE id = ?')->execute([$hash, $user['id']]);
// Every other session of this user is now invalid; this one continues with a fresh id
session_regenerate_id(true);
$_SESSION['pwf'] = password_fingerprint($hash);
log_activity($user, 'update', 'user', (string) $user['id'], 'Άλλαξε τον κωδικό του');

json_out(['ok' => true]);
