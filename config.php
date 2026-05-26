<?php
/**
 * Anilogue Configuration File
 * Loads environment variables from a secure .env file
 * Fully compatible with both XAMPP (local) and InfinityFree (production)
 */

if (session_status() === PHP_SESSION_NONE) {
    // Ensure session cookie covers the entire site (fixes path mismatch between /Anime/ and /Anime/api/)
    session_set_cookie_params([
        'lifetime' => 86400 * 30, // 30 days
        'path'     => '/',         // Root path — accessible from any sub-directory
        'secure'   => false,       // Allow HTTP for XAMPP local dev
        'httponly'  => true,        // Prevent JS access to session cookie (security)
        'samesite'  => 'Lax'       // CSRF protection
    ]);
    session_start();
}

// ═══════════════════════════════════════════════════════════════
// InfinityFree-safe .env loader
// Uses ONLY $_ENV and $_SERVER superglobals (putenv is DISABLED on InfinityFree)
// ═══════════════════════════════════════════════════════════════
function loadEnv($dir) {
    $envPath = $dir . '/.env';
    if (!file_exists($envPath)) {
        return;
    }
    
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        // Skip comments
        if (strpos($line, '#') === 0 || empty($line)) {
            continue;
        }
        
        // Parse Name=Value pairs
        if (strpos($line, '=') !== false) {
            list($name, $value) = explode('=', $line, 2);
            $name = trim($name);
            $value = trim($value);
            
            // Remove optional quotes around value
            if (preg_match('/^["\'](.*)["\']\s*$/', $value, $matches)) {
                $value = $matches[1];
            }
            
            // Store in superglobals only (NO putenv — it is disabled on InfinityFree)
            if (!array_key_exists($name, $_ENV)) {
                $_ENV[$name] = $value;
            }
            if (!array_key_exists($name, $_SERVER)) {
                $_SERVER[$name] = $value;
            }
        }
    }
}

/**
 * Safe environment variable getter
 * Checks $_ENV, then $_SERVER (InfinityFree-safe, no getenv dependency)
 */
function env($key, $default = null) {
    if (isset($_ENV[$key])) {
        return $_ENV[$key];
    }
    if (isset($_SERVER[$key])) {
        return $_SERVER[$key];
    }
    // Fallback to getenv only if available (works on XAMPP, may not on InfinityFree)
    $val = @getenv($key);
    if ($val !== false) {
        return $val;
    }
    return $default;
}

// Load environment configuration
loadEnv(__DIR__);

// Retrieve Client ID from Environment variables
$malClientId = env('MAL_CLIENT_ID');

// Define configuration constants
define('MAL_CLIENT_ID', $malClientId ? trim($malClientId) : 'YOUR_MYANIMELIST_CLIENT_ID');
define('MAL_API_URL', 'https://api.myanimelist.net/v2');

// Suppress errors in production to prevent PHP warnings from breaking JSON responses
// InfinityFree has display_errors=On by default which corrupts API JSON output
error_reporting(0);
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);

// Utility function to verify if Client ID is configured
function isMalClientConfigured() {
    return defined('MAL_CLIENT_ID') && MAL_CLIENT_ID !== '' && MAL_CLIENT_ID !== 'YOUR_MYANIMELIST_CLIENT_ID';
}

function getOauthAccessToken() {
    return isset($_SESSION['mal_access_token']) ? $_SESSION['mal_access_token'] : null;
}

function isOauthAuthenticated() {
    return getOauthAccessToken() !== null;
}

// Auto-initialize local/production database structure silently on every request
require_once __DIR__ . '/includes/db.php';
getDB();
