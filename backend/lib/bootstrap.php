<?php
declare(strict_types=1);

/**
 * Κοινός πυρήνας για κάθε endpoint: .env, PDO, JSON I/O, session, ρόλοι, CSRF.
 */

date_default_timezone_set('Europe/Athens');

// ─── .env ───────────────────────────────────────────────────────────────────
(function (): void {
    $file = __DIR__ . '/../.env';
    if (!is_file($file)) return;
    foreach (file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) continue;
        [$k, $v] = explode('=', $line, 2);
        $_ENV[trim($k)] = trim($v);
    }
})();

function env(string $key, string $default = ''): string
{
    $v = $_ENV[$key] ?? getenv($key);
    return ($v === false || $v === null || $v === '') ? $default : (string) $v;
}

const ROLES = ['admin', 'user'];
const SESSION_IDLE_SECONDS = 60 * 60 * 8;

// ─── Database ───────────────────────────────────────────────────────────────
function db(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        $dsn = sprintf(
            'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
            env('DB_HOST', 'localhost'),
            env('DB_PORT', '3306'),
            env('DB_NAME', 'aegean_signage')
        );
        $pdo = new PDO($dsn, env('DB_USER', 'root'), env('DB_PASS'), [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    }
    return $pdo;
}

// ─── HTTP / JSON ────────────────────────────────────────────────────────────
function json_out(mixed $data, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function fail(string $message, int $status = 400, array $extra = []): never
{
    json_out(['error' => $message] + $extra, $status);
}

function method(): string
{
    return strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
}

/** Επιτρέπει μόνο τις δοσμένες μεθόδους· απαντά σε OPTIONS. */
function allow(string ...$methods): string
{
    $m = method();
    if ($m === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
    if (!in_array($m, $methods, true)) {
        header('Allow: ' . implode(', ', $methods));
        fail('Η μέθοδος δεν επιτρέπεται.', 405);
    }
    return $m;
}

function body(): array
{
    static $data = null;
    if ($data !== null) return $data;
    $raw = file_get_contents('php://input') ?: '';
    if ($raw === '') return $data = [];
    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) fail('Μη έγκυρο JSON.', 400);
    return $data = $decoded;
}

function str_in(array $src, string $key, int $max = 500): string
{
    $v = $src[$key] ?? '';
    if (!is_scalar($v)) return '';
    return mb_substr(trim((string) $v), 0, $max);
}

function nullable(string $v): ?string
{
    return $v === '' ? null : $v;
}

function new_id(int $length = 10): string
{
    $alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    $out = '';
    for ($i = 0; $i < $length; $i++) {
        $out .= $alphabet[random_int(0, strlen($alphabet) - 1)];
    }
    return $out;
}

// ─── CORS (μόνο όταν οριστεί ρητά) ──────────────────────────────────────────
if (($corsOrigin = env('CORS_ORIGIN')) !== '') {
    header('Access-Control-Allow-Origin: ' . $corsOrigin);
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
}
unset($corsOrigin);

header('X-Content-Type-Options: nosniff');

// ─── Session ────────────────────────────────────────────────────────────────
function start_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) return;
    session_name('aegean_sid');
    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'secure'   => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();

    $now = time();
    if (isset($_SESSION['last_seen']) && $now - (int) $_SESSION['last_seen'] > SESSION_IDLE_SECONDS) {
        $_SESSION = [];
        session_regenerate_id(true);
    }
    $_SESSION['last_seen'] = $now;
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
}

/** Ο συνδεδεμένος χρήστης (φρέσκος από τη βάση) ή null. */
function current_user(): ?array
{
    static $cached = false;
    if ($cached !== false) return $cached;
    start_session();
    $id = $_SESSION['user_id'] ?? null;
    if (!$id) return $cached = null;

    $st = db()->prepare('SELECT id, name, email, role, active, last_login_at, created_at FROM users WHERE id = ?');
    $st->execute([$id]);
    $u = $st->fetch();
    if (!$u || !(int) $u['active']) {
        unset($_SESSION['user_id']);
        return $cached = null;
    }
    return $cached = public_user($u);
}

function public_user(array $u): array
{
    return [
        'id'          => (int) $u['id'],
        'name'        => $u['name'],
        'email'       => $u['email'],
        'role'        => $u['role'],
        'active'      => (bool) (int) $u['active'],
        'lastLoginAt' => $u['last_login_at'] ?? null,
        'createdAt'   => $u['created_at'] ?? null,
    ];
}

/** Απαιτεί σύνδεση (και προαιρετικά ρόλο). Για μεταβλητές μεθόδους ελέγχει και CSRF. */
function require_role(string ...$roles): array
{
    $user = current_user();
    if (!$user) fail('Απαιτείται σύνδεση.', 401);
    if ($roles && !in_array($user['role'], $roles, true)) {
        fail('Δεν έχετε δικαίωμα για αυτή την ενέργεια.', 403);
    }
    if (in_array(method(), ['POST', 'PUT', 'PATCH', 'DELETE'], true)) {
        verify_csrf();
    }
    return $user;
}

function verify_csrf(): void
{
    start_session();
    $sent = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!is_string($sent) || !hash_equals($_SESSION['csrf'] ?? '', $sent)) {
        fail('Η συνεδρία έληξε. Ανανεώστε τη σελίδα και δοκιμάστε ξανά.', 419);
    }
}

// ─── Activity log ───────────────────────────────────────────────────────────
function log_activity(?array $user, string $action, string $entity, ?string $entityId, string $summary): void
{
    $st = db()->prepare(
        'INSERT INTO activity_log (user_id, action, entity, entity_id, summary) VALUES (?, ?, ?, ?, ?)'
    );
    $st->execute([$user['id'] ?? null, $action, $entity, $entityId, mb_substr($summary, 0, 255)]);
}

// ─── Global error guard: ποτέ stack traces στον client ──────────────────────
set_exception_handler(function (Throwable $e): void {
    error_log((string) $e);
    if ($e instanceof PDOException) {
        $driverCode = (int) ($e->errorInfo[1] ?? 0);
        if ($driverCode === 1062) {
            fail('Υπάρχει ήδη εγγραφή με αυτή την τιμή (π.χ. ίδια αρίθμηση ή email).', 409);
        }
        if (in_array($driverCode, [1049, 1146, 2002], true) || str_contains($e->getMessage(), '2002')) {
            fail('Η βάση δεδομένων δεν είναι διαθέσιμη. Ξεκινήστε το MySQL και τρέξτε `npm run db:setup`.', 503);
        }
    }
    fail('Παρουσιάστηκε σφάλμα στον διακομιστή.', 500);
});
