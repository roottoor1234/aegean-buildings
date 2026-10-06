<?php
declare(strict_types=1);
require __DIR__ . '/../../lib/bootstrap.php';

/** Αλλαγή του δικού μου κωδικού (κάθε ρόλος). */
allow('POST');
$user = require_role();

$in = body();
$current = (string) ($in['current'] ?? '');
$next = (string) ($in['next'] ?? '');

if (mb_strlen($next) < 8) fail('Ο νέος κωδικός χρειάζεται τουλάχιστον 8 χαρακτήρες.', 422, ['field' => 'next']);

$st = db()->prepare('SELECT password_hash FROM users WHERE id = ?');
$st->execute([$user['id']]);
if (!password_verify($current, (string) $st->fetchColumn())) {
    fail('Ο τρέχων κωδικός δεν είναι σωστός.', 422, ['field' => 'current']);
}

db()->prepare('UPDATE users SET password_hash = ? WHERE id = ?')
    ->execute([password_hash($next, PASSWORD_DEFAULT), $user['id']]);
log_activity($user, 'update', 'user', (string) $user['id'], 'Άλλαξε τον κωδικό του');

json_out(['ok' => true]);
