<?php
declare(strict_types=1);
require __DIR__ . '/../../lib/bootstrap.php';

allow('POST');
start_session();
verify_csrf();

$in = body();
$email = strtolower(str_in($in, 'email', 190));
$password = (string) ($in['password'] ?? '');
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';

if ($email === '' || $password === '') {
    fail('Συμπληρώστε email και κωδικό.', 422);
}

// Όριο: 8 αποτυχημένες προσπάθειες ανά IP σε 15 λεπτά
$pdo = db();
$pdo->exec('DELETE FROM login_attempts WHERE attempted_at < (NOW() - INTERVAL 1 DAY)');
$st = $pdo->prepare('SELECT COUNT(*) FROM login_attempts WHERE ip = ? AND attempted_at > (NOW() - INTERVAL 15 MINUTE)');
$st->execute([$ip]);
if ((int) $st->fetchColumn() >= 8) {
    fail('Πολλές αποτυχημένες προσπάθειες. Δοκιμάστε ξανά σε 15 λεπτά.', 429);
}

$st = $pdo->prepare('SELECT * FROM users WHERE email = ?');
$st->execute([$email]);
$user = $st->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    $pdo->prepare('INSERT INTO login_attempts (ip, email) VALUES (?, ?)')->execute([$ip, $email]);
    usleep(350_000);
    fail('Λάθος email ή κωδικός.', 401);
}
if (!(int) $user['active']) {
    fail('Ο λογαριασμός είναι απενεργοποιημένος. Επικοινωνήστε με τον διαχειριστή.', 403);
}

if (password_needs_rehash($user['password_hash'], PASSWORD_DEFAULT)) {
    $pdo->prepare('UPDATE users SET password_hash = ? WHERE id = ?')
        ->execute([password_hash($password, PASSWORD_DEFAULT), $user['id']]);
}
$pdo->prepare('UPDATE users SET last_login_at = NOW() WHERE id = ?')->execute([$user['id']]);
$pdo->prepare('DELETE FROM login_attempts WHERE ip = ?')->execute([$ip]);

session_regenerate_id(true);
$_SESSION['user_id'] = (int) $user['id'];
$_SESSION['csrf'] = bin2hex(random_bytes(32));

json_out(['user' => public_user($user), 'csrf' => $_SESSION['csrf']]);
