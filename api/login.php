<?php
/**
 * Anilogue Local User Login Endpoint
 * InfinityFree Compatible
 */
error_reporting(0);
ini_set('display_errors', 0);
header('Content-Type: application/json');
require_once '../config.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

// Parse inputs
$input = json_decode(file_get_contents('php://input'), true);
$usernameOrEmail = isset($input['username']) ? trim($input['username']) : '';
$password = isset($input['password']) ? trim($input['password']) : '';

// Validation
if (empty($usernameOrEmail) || empty($password)) {
    http_response_code(400);
    echo json_encode(['error' => 'Username/Email and Password are required.']);
    exit;
}

// Connect to Database (already initialized by config.php)
$db = getDB();
if (!$db) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed. Please check your database configuration.']);
    exit;
}

try {
    // Search user by username or email
    $stmt = $db->prepare("SELECT * FROM users WHERE username = ? OR email = ?");
    $stmt->execute([$usernameOrEmail, $usernameOrEmail]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password_hash'])) {
        // Log the user in via session
        $_SESSION['local_user_id'] = $user['id'];
        $_SESSION['local_username'] = $user['username'];

        echo json_encode([
            'success' => true,
            'message' => 'Login successful!',
            'user' => [
                'id' => intval($user['id']),
                'username' => $user['username'],
                'email' => $user['email']
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid username/email or password.']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Login failed. Please try again.']);
}
