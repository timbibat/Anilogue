<?php
/**
 * Anilogue Local User Session Status Endpoint
 * InfinityFree Compatible
 */
error_reporting(0);
ini_set('display_errors', 0);
header('Content-Type: application/json');
require_once '../config.php';

$action = isset($_GET['action']) ? $_GET['action'] : 'status';

switch ($action) {
    case 'status':
        if (isset($_SESSION['local_user_id']) && isset($_SESSION['local_username'])) {
            echo json_encode([
                'isLoggedIn' => true,
                'authType' => 'local',
                'user' => [
                    'id' => intval($_SESSION['local_user_id']),
                    'username' => $_SESSION['local_username']
                ]
            ]);
        } else if (isset($_SESSION['mal_access_token'])) {
            // User is logged in via MAL OAuth, not local
            echo json_encode([
                'isLoggedIn' => true,
                'authType' => 'mal'
            ]);
        } else {
            echo json_encode([
                'isLoggedIn' => false
            ]);
        }
        break;

    case 'logout':
        unset($_SESSION['local_user_id']);
        unset($_SESSION['local_username']);
        unset($_SESSION['mal_access_token']);
        unset($_SESSION['mal_refresh_token']);
        unset($_SESSION['oauth2_state']);
        unset($_SESSION['oauth2_verifier']);
        echo json_encode(['success' => true, 'message' => 'Logged out successfully.']);
        break;

    default:
        echo json_encode(['error' => 'Unknown action.']);
        break;
}
