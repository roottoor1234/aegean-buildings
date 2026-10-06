<?php
declare(strict_types=1);
require __DIR__ . '/../lib/bootstrap.php';

allow('GET');
db()->query('SELECT 1');
json_out(['ok' => true, 'time' => date(DATE_ATOM)]);
