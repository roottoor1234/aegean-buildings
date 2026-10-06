<?php
declare(strict_types=1);
require __DIR__ . '/../lib/bootstrap.php';

/** Πρόσφατες αλλαγές για την επισκόπηση · admin, user. */
allow('GET');
require_role('admin', 'user');

$limit = max(1, min(100, (int) ($_GET['limit'] ?? 20)));
$st = db()->prepare(
    "SELECT a.id, a.action, a.entity, a.entity_id, a.summary, a.created_at, u.name AS user_name
       FROM activity_log a LEFT JOIN users u ON u.id = a.user_id
      WHERE a.action <> 'login'
      ORDER BY a.id DESC LIMIT $limit"
);
$st->execute();

json_out(array_map(fn ($r) => [
    'id'        => (int) $r['id'],
    'action'    => $r['action'],
    'entity'    => $r['entity'],
    'entityId'  => $r['entity_id'],
    'summary'   => $r['summary'],
    'createdAt' => $r['created_at'],
    'userName'  => $r['user_name'],
], $st->fetchAll()));
