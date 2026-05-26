<?php
/**
 * Anilogue Configuration File
 * Loads environment variables from a secure .env file
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Custom native PHP parser for .env files (dependency-free for InfinityFree compatibility)
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
            if (preg_match('/^["\'](.*)["\']$/', $value, $matches)) {
                $value = $matches[1];
            }
            
            if (!array_key_exists($name, $_SERVER) && !array_key_exists($name, $_ENV)) {
                putenv(sprintf('%s=%s', $name, $value));
                $_ENV[$name] = $value;
                $_SERVER[$name] = $value;
            }
        }
    }
}

// Load environment configuration
loadEnv(__DIR__);

// Retrieve Client ID from Environment variables
$malClientId = getenv('MAL_CLIENT_ID');
if (!$malClientId && isset($_ENV['MAL_CLIENT_ID'])) {
    $malClientId = $_ENV['MAL_CLIENT_ID'];
}

// Define configuration constants
define('MAL_CLIENT_ID', $malClientId ? trim($malClientId) : 'YOUR_MYANIMELIST_CLIENT_ID');
define('MAL_API_URL', 'https://api.myanimelist.net/v2');

// Display errors for debugging (disable in production)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

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
