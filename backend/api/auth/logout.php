<?php
declare(strict_types=1);
require __DIR__ . '/../../lib/bootstrap.php';

allow('POST');
start_session();
verify_csrf();

$_SESSION = [];
if (ini_get('session.use_cookies')) {
    $p = session_get_cookie_params();
    setcookie(session_name(), '', time() - 3600, $p['path'], $p['domain'], $p['secure'], $p['httponly']);
}
session_destroy();

json_out(['ok' => true]);
