<?php
declare(strict_types=1);
require __DIR__ . '/../../lib/bootstrap.php';

/** Τρέχουσα συνεδρία + CSRF token (καλείται στην εκκίνηση του frontend). */
allow('GET');
start_session();

json_out([
    'user' => current_user(),
    'csrf' => $_SESSION['csrf'],
]);
