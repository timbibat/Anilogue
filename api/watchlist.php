<?php
/**
 * Local watchlist storage is disabled because database helpers were removed.
 */
error_reporting(0);
ini_set('display_errors', 0);
header('Content-Type: application/json');
require_once '../config.php';

http_response_code(503);
echo json_encode(['error' => 'Local database watchlist storage is disabled.']);
