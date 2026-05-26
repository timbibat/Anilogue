<?php
/**
 * Anilogue Watchlist & Database Sync API Endpoint
 * InfinityFree Compatible
 */
error_reporting(0);
ini_set('display_errors', 0);
header('Content-Type: application/json');
require_once '../config.php';

// Ensure the user is logged in locally
$userId = isset($_SESSION['local_user_id']) ? $_SESSION['local_user_id'] : null;

if (!$userId) {
    http_response_code(412);
    echo json_encode(['error' => 'Authentication required. Please register or log in first.']);
    exit;
}

$db = getDB();
if (!$db) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection offline.']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        try {
            // Retrieve all watchlist entries for current user
            $stmt = $db->prepare("SELECT media_id, media_type, status, progress, volumes_progress, score, updated_at FROM watchlist WHERE user_id = ?");
            $stmt->execute([$userId]);
            $rows = $stmt->fetchAll();
            
            echo json_encode([
                'success' => true,
                'watchlist' => $rows
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch watchlist.']);
        }
        break;

    case 'POST':
        // Handle insertion & updates (UPSERT)
        $input = json_decode(file_get_contents('php://input'), true);
        
        $mediaId = isset($input['media_id']) ? intval($input['media_id']) : 0;
        $mediaType = isset($input['media_type']) ? $input['media_type'] : '';
        $status = isset($input['status']) ? trim($input['status']) : '';
        $progress = isset($input['progress']) ? intval($input['progress']) : 0;
        $volumesProgress = isset($input['volumes_progress']) ? intval($input['volumes_progress']) : 0;
        $score = isset($input['score']) ? intval($input['score']) : 0;

        if ($mediaId <= 0 || !in_array($mediaType, ['anime', 'manga']) || empty($status)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid or missing media metadata parameters.']);
            exit;
        }

        try {
            // Check if status is a standard state
            $allowedStatuses = ['watching', 'reading', 'completed', 'on_hold', 'dropped', 'plan_to_watch', 'plan_to_read'];
            if (!in_array($status, $allowedStatuses)) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid watchlist status specified.']);
                exit;
            }

            // Insert or Update details
            $stmt = $db->prepare("
                INSERT INTO watchlist (user_id, media_id, media_type, status, progress, volumes_progress, score)
                VALUES (:user_id, :media_id, :media_type, :status, :progress, :volumes_progress, :score)
                ON DUPLICATE KEY UPDATE 
                    status = VALUES(status), 
                    progress = VALUES(progress), 
                    volumes_progress = VALUES(volumes_progress), 
                    score = VALUES(score)
            ");
            
            $stmt->execute([
                ':user_id' => $userId,
                ':media_id' => $mediaId,
                ':media_type' => $mediaType,
                ':status' => $status,
                ':progress' => $progress,
                ':volumes_progress' => $volumesProgress,
                ':score' => $score
            ]);

            echo json_encode([
                'success' => true,
                'message' => 'Watchlist entry saved successfully!',
                'entry' => [
                    'media_id' => $mediaId,
                    'media_type' => $mediaType,
                    'status' => $status,
                    'progress' => $progress,
                    'volumes_progress' => $volumesProgress,
                    'score' => $score
                ]
            ]);

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to save watchlist.']);
        }
        break;

    case 'DELETE':
        // Handle entry deletion
        $input = json_decode(file_get_contents('php://input'), true);
        $mediaId = isset($input['media_id']) ? intval($input['media_id']) : 0;
        $mediaType = isset($input['media_type']) ? $input['media_type'] : '';

        if ($mediaId <= 0 || !in_array($mediaType, ['anime', 'manga'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid or missing deletion parameters.']);
            exit;
        }

        try {
            $stmt = $db->prepare("DELETE FROM watchlist WHERE user_id = ? AND media_id = ? AND media_type = ?");
            $stmt->execute([$userId, $mediaId, $mediaType]);

            echo json_encode([
                'success' => true,
                'message' => 'Watchlist item deleted successfully!'
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete entry.']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method Not Allowed']);
        break;
}
