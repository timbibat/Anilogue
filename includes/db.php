<?php
/**
 * Anilogue Local Database Connection & Helper
 * Hybrid implementation fully compatible with both XAMPP (Local) and InfinityFree (Production)
 */

// Load DB connection credentials from Environment (from .env file) or fall back to local XAMPP defaults
$dbHost = getenv('DB_HOST') ?: 'localhost';
$dbUser = getenv('DB_USER') ?: 'root';
$dbPass = getenv('DB_PASS') !== false ? getenv('DB_PASS') : '';
$dbName = getenv('DB_NAME') ?: 'anilogue_db';

function getDB() {
    global $dbHost, $dbUser, $dbPass, $dbName;
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }
    
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];

    try {
        // Attempt 1: Direct connection with dbname (Works on InfinityFree where DB is pre-created)
        $dsn = "mysql:host={$dbHost};dbname={$dbName};charset=utf8mb4";
        $tempPdo = new PDO($dsn, $dbUser, $dbPass, $options);
        $pdo = $tempPdo;
    } catch (PDOException $e) {
        // Attempt 2: If DB does not exist locally (XAMPP first run), connect without dbname and create it
        if ($e->getCode() == 1049 || strpos($e->getMessage(), 'Unknown database') !== false) {
            try {
                $rawDsn = "mysql:host={$dbHost};charset=utf8mb4";
                $rawPdo = new PDO($rawDsn, $dbUser, $dbPass, $options);
                
                // Try creating database (will fail on InfinityFree but we only reach here if DB doesn't exist)
                $rawPdo->exec("CREATE DATABASE IF NOT EXISTS `" . $dbName . "`");
                $rawPdo->exec("USE `" . $dbName . "`");
                
                $pdo = $rawPdo;
            } catch (PDOException $subException) {
                error_log("Database auto-creation failed: " . $subException->getMessage());
                return null;
            }
        } else {
            error_log("Database connection failed: " . $e->getMessage());
            return null;
        }
    }

    if ($pdo !== null) {
        try {
            // Auto-create users table if not exists
            $pdo->exec("CREATE TABLE IF NOT EXISTS `users` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `username` VARCHAR(50) NOT NULL UNIQUE,
                `email` VARCHAR(100) NOT NULL UNIQUE,
                `password_hash` VARCHAR(255) NOT NULL,
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
            
            // Auto-create watchlist table if not exists
            $pdo->exec("CREATE TABLE IF NOT EXISTS `watchlist` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `user_id` INT NOT NULL,
                `media_id` INT NOT NULL,
                `media_type` ENUM('anime', 'manga') NOT NULL,
                `status` VARCHAR(20) NOT NULL,
                `progress` INT DEFAULT 0,
                `volumes_progress` INT DEFAULT 0,
                `score` INT DEFAULT 0,
                `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
                UNIQUE KEY `user_media_unique` (`user_id`, `media_id`, `media_type`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
        } catch (PDOException $tblException) {
            error_log("Table initialization failed: " . $tblException->getMessage());
        }
    }

    return $pdo;
}
