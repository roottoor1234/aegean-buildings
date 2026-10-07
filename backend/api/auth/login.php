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

if ($email === '' || $password === '' || mb_strlen($password) > 200) {
    fail('Συμπληρώστε email και κωδικό.', 422);
}

// Όρια: 8 αποτυχίες ανά IP και 10 ανά λογαριασμό (από οποιαδήποτε IP) σε 15 λεπτά
$pdo = db();
$pdo->exec('DELETE FROM login_attempts WHERE attempted_at < (NOW() - INTERVAL 1 DAY)');
$st = $pdo->prepare(
    'SELECT
        SUM(ip = ?)    AS by_ip,
        SUM(email = ?) AS by_email
       FROM login_attempts WHERE attempted_at > (NOW() - INTERVAL 15 MINUTE)'
);
$st->execute([$ip, $email]);
$recent = $st->fetch() ?: [];
if ((int) ($recent['by_ip'] ?? 0) >= 8 || (int) ($recent['by_email'] ?? 0) >= 10) {
    fail('Πολλές αποτυχημένες προσπάθειες. Δοκιμάστε ξανά σε 15 λεπτά.', 429);
}

$st = $pdo->prepare('SELECT * FROM users WHERE email = ?');
$st->execute([$email]);
$user = $st->fetch();

// Same cost whether or not the account exists: no timing hint about which emails are registered
$hash = $user['password_hash'] ?? '$2y$10$usesomesillystringfore7hnbRJHxXVLeakoG8K30oukPsA.ztMG';
$ok = password_verify($password, $hash) && $user;

if (!$ok) {
    $pdo->prepare('INSERT INTO login_attempts (ip, email) VALUES (?, ?)')->execute([$ip, $email]);
    usleep(random_int(250_000, 450_000));
    fail('Λάθος email ή κωδικός.', 401);
}
if (!(int) $user['active']) {
    fail('Ο λογαριασμός είναι απενεργοποιημένος. Επικοινωνήστε με τον διαχειριστή.', 403);
}

$algo = defined('PASSWORD_ARGON2ID') ? PASSWORD_ARGON2ID : PASSWORD_DEFAULT;
if (password_needs_rehash($user['password_hash'], $algo)) {
    $user['password_hash'] = hash_password($password);
    $pdo->prepare('UPDATE users SET password_hash = ? WHERE id = ?')->execute([$user['password_hash'], $user['id']]);
}
$pdo->prepare('UPDATE users SET last_login_at = NOW() WHERE id = ?')->execute([$user['id']]);
$pdo->prepare('DELETE FROM login_attempts WHERE ip = ? OR email = ?')->execute([$ip, $email]);

// Fresh session id and token on every sign-in (no session fixation)
session_regenerate_id(true);
$_SESSION = [
    'user_id'   => (int) $user['id'],
    'pwf'       => password_fingerprint($user['password_hash']),
    'started'   => time(),
    'last_seen' => time(),
    'csrf'      => bin2hex(random_bytes(32)),
];

json_out(['user' => public_user($user), 'csrf' => $_SESSION['csrf']]);
