<?php
/**
 * Anilogue Local & OAuth Session Logout Controller
 * InfinityFree Compatible
 */
error_reporting(0);
ini_set('display_errors', 0);
require_once '../config.php';

// Revoke all session variables
$_SESSION = [];

if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

session_destroy();

// Send back dynamic JSON or redirect depending on headers
if (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false) {
    header('Content-Type: application/json');
    echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
} else {
    header('Location: ../index.php');
}
exit;
