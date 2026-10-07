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

/**
 * Many shared hosts (ModSecurity on cPanel) reject PUT/DELETE before PHP sees them.
 * The client therefore sends writes as POST + X-HTTP-Method-Override; only POST may be overridden.
 */
function method(): string
{
    $real = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
    $override = strtoupper(trim((string) ($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'] ?? '')));
    if ($real === 'POST' && in_array($override, ['PUT', 'DELETE'], true)) {
        return $override;
    }
    return $real;
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
    header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token, X-HTTP-Method-Override');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
}
unset($corsOrigin);

// ─── Hardening: no error output, no version banners, strict response headers ─
ini_set('display_errors', '0');
ini_set('log_errors', '1');
ini_set('expose_php', '0');
header_remove('X-Powered-By');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: strict-origin-when-cross-origin');
// The API only ever returns JSON: nothing in a response may run, load or be framed
header("Content-Security-Policy: default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'");
header('Cross-Origin-Resource-Policy: same-origin');

const SESSION_ABSOLUTE_SECONDS = 60 * 60 * 12;

function is_https(): bool
{
    return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (int) ($_SERVER['SERVER_PORT'] ?? 0) === 443;
}

// ─── Session ────────────────────────────────────────────────────────────────
function start_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) return;
    ini_set('session.use_strict_mode', '1');   // reject session ids the server never issued
    ini_set('session.use_only_cookies', '1');
    ini_set('session.use_trans_sid', '0');
    ini_set('session.sid_length', '48');
    ini_set('session.sid_bits_per_character', '6');
    // __Host- prefix: browser refuses the cookie unless Secure, path=/ and no Domain
    $https = is_https();
    session_name($https ? '__Host-aegean_sid' : 'aegean_sid');
    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'secure'   => $https,
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
    session_start();

    $now = time();
    $idle = isset($_SESSION['last_seen']) && $now - (int) $_SESSION['last_seen'] > SESSION_IDLE_SECONDS;
    $old  = isset($_SESSION['started']) && $now - (int) $_SESSION['started'] > SESSION_ABSOLUTE_SECONDS;
    if ($idle || $old) {
        $_SESSION = [];
        session_regenerate_id(true);
    }
    $_SESSION['started'] ??= $now;
    $_SESSION['last_seen'] = $now;
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
}

/** Ties a session to the password it was opened with: changing the password signs out every other session. */
function password_fingerprint(string $hash): string
{
    return substr(hash('sha256', $hash), 0, 32);
}

/** Ο συνδεδεμένος χρήστης (φρέσκος από τη βάση) ή null. */
function current_user(): ?array
{
    static $cached = false;
    if ($cached !== false) return $cached;
    start_session();
    $id = $_SESSION['user_id'] ?? null;
    if (!$id) return $cached = null;

    $st = db()->prepare('SELECT id, name, email, role, active, password_hash, last_login_at, created_at FROM users WHERE id = ?');
    $st->execute([$id]);
    $u = $st->fetch();
    $valid = $u && (int) $u['active']
        && hash_equals(password_fingerprint($u['password_hash']), (string) ($_SESSION['pwf'] ?? ''));
    if (!$valid) {
        $_SESSION = [];
        session_regenerate_id(true);
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
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

/**
 * Defence in depth for every state-changing request:
 * same-origin check, JSON-only bodies (a cross-site HTML form cannot send them), then the CSRF token.
 */
function verify_csrf(): void
{
    $origin = (string) ($_SERVER['HTTP_ORIGIN'] ?? '');
    if ($origin !== '') {
        $originHost = strtolower((string) parse_url($origin, PHP_URL_HOST));
        $host = strtolower((string) preg_replace('/:\d+$/', '', (string) ($_SERVER['HTTP_HOST'] ?? '')));
        $allowed = array_filter(array_map('trim', explode(',', env('CORS_ORIGIN'))));
        $loopback = in_array($_SERVER['REMOTE_ADDR'] ?? '', ['127.0.0.1', '::1'], true)
            && in_array($originHost, ['localhost', '127.0.0.1'], true); // Vite dev proxy
        if ($originHost !== $host && !in_array(rtrim($origin, '/'), $allowed, true) && !$loopback) {
            fail('Μη επιτρεπτή προέλευση αιτήματος.', 403);
        }
    }
    $type = strtolower((string) ($_SERVER['CONTENT_TYPE'] ?? ''));
    $length = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
    if ($length > 0 && !str_starts_with($type, 'application/json')) {
        fail('Μη αποδεκτός τύπος περιεχομένου.', 415);
    }
    if ($length > 64 * 1024) {
        fail('Το αίτημα είναι πολύ μεγάλο.', 413);
    }

    start_session();
    $sent = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!is_string($sent) || !hash_equals($_SESSION['csrf'] ?? '', $sent)) {
        fail('Η συνεδρία έληξε. Ανανεώστε τη σελίδα και δοκιμάστε ξανά.', 419);
    }
}

/** Shared password rule (server is the authority; the UI mirrors it). */
function validate_new_password(string $password, string $email = '', string $field = 'password'): void
{
    if (mb_strlen($password) < 10) {
        fail('Ο κωδικός χρειάζεται τουλάχιστον 10 χαρακτήρες.', 422, ['field' => $field]);
    }
    if (mb_strlen($password) > 200) {
        fail('Ο κωδικός είναι πολύ μεγάλος.', 422, ['field' => $field]);
    }
    $lower = mb_strtolower($password);
    $local = $email !== '' ? mb_strtolower(strstr($email, '@', true) ?: $email) : '';
    if ($local !== '' && str_contains($lower, $local)) {
        fail('Ο κωδικός δεν πρέπει να περιέχει το email σας.', 422, ['field' => $field]);
    }
    if (count(array_unique(mb_str_split($password))) < 5) {
        fail('Ο κωδικός είναι πολύ απλός. Χρησιμοποιήστε περισσότερους διαφορετικούς χαρακτήρες.', 422, ['field' => $field]);
    }
    $common = ['password', 'qwerty', '123456', '12345678', 'admin', 'aegean', 'letmein', 'welcome'];
    foreach ($common as $c) {
        if (str_contains($lower, $c) && mb_strlen($lower) < mb_strlen($c) + 4) {
            fail('Ο κωδικός είναι πολύ κοινός.', 422, ['field' => $field]);
        }
    }
}

/** Strongest hashing the server supports. */
function hash_password(string $password): string
{
    return defined('PASSWORD_ARGON2ID')
        ? password_hash($password, PASSWORD_ARGON2ID)
        : password_hash($password, PASSWORD_DEFAULT);
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
        // Connection errors carry no errorInfo; the driver code is in getCode()
        $driverCode = (int) ($e->errorInfo[1] ?? 0) ?: (int) $e->getCode();
        if ($driverCode === 1062) {
            fail('Υπάρχει ήδη εγγραφή με αυτή την τιμή (π.χ. ίδια αρίθμηση ή email).', 409);
        }
        if (in_array($driverCode, [1044, 1045], true)) {
            fail('Η σύνδεση με τη βάση απορρίφθηκε. Ελέγξτε τα στοιχεία DB_* στο .env και τα δικαιώματα του χρήστη.', 503);
        }
        if (in_array($driverCode, [1049, 1146, 2002, 2006], true)) {
            fail('Η βάση δεδομένων δεν είναι διαθέσιμη.', 503);
        }
    }
    fail('Παρουσιάστηκε σφάλμα στον διακομιστή.', 500);
});
