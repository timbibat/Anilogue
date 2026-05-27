<?php
require_once 'config.php';

echo "<h2>MyAnimeList API Diagnostics</h2>";
echo "<b>Client ID configured:</b> " . MAL_CLIENT_ID . "<br>";

$url = 'https://api.myanimelist.net/v2/anime/ranking?ranking_type=all&limit=1';
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$headers = [];
$token = trim(MAL_CLIENT_ID);
if (strlen($token) <= 45) {
    $headers[] = 'X-MAL-CLIENT-ID: ' . $token;
} else {
    $headers[] = 'Authorization: Bearer ' . $token;
}

curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

echo "<h3>cURL Execution Details</h3>";
echo "<b>HTTP Status Code:</b> " . $httpCode . "<br>";
if ($curlError) {
    echo "<b>cURL Error:</b> <font color='red'>" . htmlspecialchars($curlError) . "</font><br>";
} else {
    echo "<b>cURL Error:</b> None<br>";
}

echo "<b>Raw Response:</b><pre>" . htmlspecialchars($response) . "</pre>";
?>
