-- =========================================================
-- Store Rating Web Application - MySQL Database Schema
-- =========================================================

CREATE DATABASE IF NOT EXISTS `store_rating_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `store_rating_db`;

-- Drop tables if exists in reverse dependency order
DROP TABLE IF EXISTS `ratings`;
DROP TABLE IF EXISTS `stores`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `roles`;

-- 1. Roles Table
CREATE TABLE `roles` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(50) NOT NULL UNIQUE,
    `description` VARCHAR(255) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Users Table
CREATE TABLE `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(60) NOT NULL,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `address` VARCHAR(400) NOT NULL,
    `role_id` INT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_users_roles` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `chk_user_name_len` CHECK (CHAR_LENGTH(`name`) >= 20 AND CHAR_LENGTH(`name`) <= 60),
    CONSTRAINT `chk_user_address_len` CHECK (CHAR_LENGTH(`address`) <= 400)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for users
CREATE INDEX `idx_users_email` ON `users` (`email`);
CREATE INDEX `idx_users_role_id` ON `users` (`role_id`);

-- 3. Stores Table
CREATE TABLE `stores` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(200) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `address` VARCHAR(400) NOT NULL,
    `owner_id` INT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_stores_owner` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `chk_store_address_len` CHECK (CHAR_LENGTH(`address`) <= 400)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for stores
CREATE INDEX `idx_stores_name` ON `stores` (`name`);
CREATE INDEX `idx_stores_owner_id` ON `stores` (`owner_id`);

-- 4. Ratings Table
CREATE TABLE `ratings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `store_id` INT NOT NULL,
    `rating` TINYINT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_ratings_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_ratings_stores` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `chk_rating_value` CHECK (`rating` >= 1 AND `rating` <= 5),
    CONSTRAINT `uq_user_store_rating` UNIQUE (`user_id`, `store_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for ratings
CREATE INDEX `idx_ratings_user_id` ON `ratings` (`user_id`);
CREATE INDEX `idx_ratings_store_id` ON `ratings` (`store_id`);
