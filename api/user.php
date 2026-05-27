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

    case 'migrate_to_mal':
        if (!isset($_SESSION['mal_access_token'])) {
            echo json_encode(['error' => 'You must be logged in via MyAnimeList to migrate.']);
            exit;
        }
        
        $token = $_SESSION['mal_access_token'];
        
        // Receive items to migrate (from local guest storage or local database)
        $input = json_decode(file_get_contents('php://input'), true);
        $items = isset($input['items']) ? $input['items'] : [];
        
        // If items are empty, try to fetch from local database if logged in
        if (empty($items) && isset($_SESSION['local_user_id'])) {
            try {
                require_once '../includes/db.php';
                $db = getDB();
                if ($db) {
                    $stmt = $db->prepare("SELECT media_id as id, media_type as type, status, progress, score, volumes_progress FROM watchlist WHERE user_id = ?");
                    $stmt->execute([$_SESSION['local_user_id']]);
                    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
                }
            } catch (Exception $dbEx) {
                // Ignore DB errors
            }
        }
        
        if (empty($items)) {
            echo json_encode(['success' => true, 'migrated_count' => 0, 'message' => 'No items found to migrate.']);
            exit;
        }
        
        $migratedCount = 0;
        $errors = [];
        
        foreach ($items as $item) {
            $id = intval($item['id'] ?? $item['media_id'] ?? 0);
            $type = ($item['type'] ?? $item['media_type'] ?? 'anime') === 'manga' ? 'manga' : 'anime';
            $status = $item['status'] ?? ($type === 'manga' ? 'reading' : 'watching');
            // Normalize plan to watch/read statuses
            if ($type === 'manga' && $status === 'plan_to_watch') {
                $status = 'plan_to_read';
            } elseif ($type === 'anime' && $status === 'plan_to_read') {
                $status = 'plan_to_watch';
            }
            
            $score = intval($item['score'] ?? 0);
            $progress = intval($item['progress'] ?? $item['num_watched_episodes'] ?? $item['num_chapters_read'] ?? 0);
            $volumesProgress = intval($item['volumes_progress'] ?? $item['num_volumes_read'] ?? 0);
            
            $url = MAL_API_URL . '/' . $type . '/' . $id . '/my_list_status';
            $postFields = [
                'status' => $status
            ];
            if ($score > 0) {
                $postFields['score'] = $score;
            }
            if ($type === 'manga') {
                $postFields['num_chapters_read'] = $progress;
                $postFields['num_volumes_read'] = $volumesProgress;
            } else {
                $postFields['num_watched_episodes'] = $progress;
            }
            
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postFields));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Authorization: Bearer ' . $token,
                'Content-Type: application/x-www-form-urlencoded'
            ]);
            curl_setopt($ch, CURLOPT_TIMEOUT, 8);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            
            $res = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            if ($httpCode === 200) {
                $migratedCount++;
            } else {
                $errors[] = "ID {$id} ({$type}) failed with HTTP {$httpCode}";
            }
        }
        
        // If this was a database user migrating, clear local DB session parameters after success
        if (isset($_SESSION['local_user_id'])) {
            unset($_SESSION['local_user_id']);
            unset($_SESSION['local_username']);
        }
        
        echo json_encode([
            'success' => true,
            'migrated_count' => $migratedCount,
            'errors' => $errors
        ]);
        break;

    default:
        echo json_encode(['error' => 'Unknown action.']);
        break;
}
