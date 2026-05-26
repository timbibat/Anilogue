<?php
/**
 * Anilogue Local Database Connection & Helper
 * Hybrid implementation fully compatible with both XAMPP (Local) and InfinityFree (Production)
 * 
 * IMPORTANT: This file is loaded by config.php which provides the env() helper function.
 * All environment variable reads use env() instead of getenv() for InfinityFree compatibility.
 */

function getDB() {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    // Read credentials using the safe env() helper defined in config.php
    // Falls back to XAMPP defaults if .env is missing
    $dbHost = function_exists('env') ? env('DB_HOST', 'localhost') : 'localhost';
    $dbUser = function_exists('env') ? env('DB_USER', 'root') : 'root';
    $dbPass = function_exists('env') ? env('DB_PASS', '') : '';
    $dbName = function_exists('env') ? env('DB_NAME', 'anilogue_db') : 'anilogue_db';
    
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        // EMULATE_PREPARES=true for maximum InfinityFree MySQL driver compatibility
        PDO::ATTR_EMULATE_PREPARES   => true,
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
                @error_log("Anilogue DB: auto-creation failed: " . $subException->getMessage());
                return null;
            }
        } else {
            @error_log("Anilogue DB: connection failed: " . $e->getMessage());
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
            @error_log("Anilogue DB: table init failed: " . $tblException->getMessage());
        }
    }

    return $pdo;
}
