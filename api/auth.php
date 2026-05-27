<?php
/**
 * Anilogue MyAnimeList OAuth2 PKCE Authentication Controller
 */
require_once '../config.php';

// Detect absolute redirect URI dynamically based on current server hosting
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'];
$redirectUri = $protocol . '://' . $host . strtok($_SERVER['REQUEST_URI'], '?');

$action = isset($_GET['action']) ? $_GET['action'] : '';

// Exposes authorization routes
if ($action === 'login') {
    // Generate secure state and PKCE verifier (Plain challenge method is lightweight and fully supported by MAL)
    $state = bin2hex(random_bytes(16));
    $verifier = bin2hex(random_bytes(32)); // 64-char verifier
    
    $_SESSION['oauth2_state'] = $state;
    $_SESSION['oauth2_verifier'] = $verifier;
    
    $authorizeUrl = 'https://myanimelist.net/v1/oauth2/authorize?' . http_build_query([
        'response_type' => 'code',
        'client_id' => MAL_CLIENT_ID,
        'state' => $state,
        'redirect_uri' => $redirectUri,
        'code_challenge' => $verifier,
        'code_challenge_method' => 'plain'
    ]);
    
    header('Location: ' . $authorizeUrl);
    exit;
}

if ($action === 'logout') {
    // Revoke local session parameters
    unset($_SESSION['mal_access_token']);
    unset($_SESSION['mal_refresh_token']);
    unset($_SESSION['oauth2_state']);
    unset($_SESSION['oauth2_verifier']);
    
    header('Location: ../index.php');
    exit;
}

// OAuth2 Callback handler
if (isset($_GET['code'])) {
    $code = $_GET['code'];
    $state = isset($_GET['state']) ? $_GET['state'] : '';
    
    // Verify state parameter prevents CSRF attacks
    if (empty($state) || !isset($_SESSION['oauth2_state']) || $state !== $_SESSION['oauth2_state']) {
        die('Authentication security error: state mismatch.');
    }
    
    $verifier = isset($_SESSION['oauth2_verifier']) ? $_SESSION['oauth2_verifier'] : '';
    if (empty($verifier)) {
        die('Authentication PKCE error: verifier missing.');
    }
    
    // Exchange Auth Code for OAuth Access Token
    $tokenUrl = 'https://myanimelist.net/v1/oauth2/token';
    $postFields = [
        'client_id' => MAL_CLIENT_ID,
        'grant_type' => 'authorization_code',
        'code' => $code,
        'code_verifier' => $verifier,
        'redirect_uri' => $redirectUri
    ];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $tokenUrl);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postFields));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/x-www-form-urlencoded',
        'Authorization: Basic ' . base64_encode(MAL_CLIENT_ID . ':')
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200 && $response) {
        $tokenData = json_decode($response, true);
        if (isset($tokenData['access_token'])) {
            // Save authentications inside session
            $_SESSION['mal_access_token'] = $tokenData['access_token'];
            if (isset($tokenData['refresh_token'])) {
                $_SESSION['mal_refresh_token'] = $tokenData['refresh_token'];
            }
            
            // Redirect back to main browse portal
            header('Location: ../index.php');
            exit;
        }
    }
    
    // Display error fallback
    echo '<h3>Failed to retrieve MyAnimeList Access Token</h3>';
    echo '<p>HTTP Code: ' . $httpCode . '</p>';
    echo '<pre>' . htmlspecialchars($response) . '</pre>';
    echo '<p><a href="../index.php">Return to index</a></p>';
    exit;
}

// Default landing page redirects back to home browse
header('Location: ../index.php');
exit;
