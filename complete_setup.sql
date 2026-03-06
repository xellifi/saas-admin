-- Admin Dashboard SaaS - Complete Database Setup
-- Unified Schema and Seed Data for phpMyAdmin Import
-- Compatible with MySQL 8.0+

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- ---------------------------------------------------------
-- Database Setup
-- ---------------------------------------------------------

-- Uncomment the line below if you want to create the database automatically
-- CREATE DATABASE IF NOT EXISTS saas_dashboard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE saas_dashboard;

-- ---------------------------------------------------------
-- Drop Tables in Order (due to Foreign Key constraints)
-- ---------------------------------------------------------

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `support_ticket_replies`;
DROP TABLE IF EXISTS `support_tickets`;
DROP TABLE IF EXISTS `subscriptions`;
DROP TABLE IF EXISTS `plans`;
DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `activity_logs`;
DROP TABLE IF EXISTS `file_uploads`;
DROP TABLE IF EXISTS `addons`;
DROP TABLE IF EXISTS `settings`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `roles`;
-- SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------
-- Table Structure: roles
-- ---------------------------------------------------------

CREATE TABLE `roles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL UNIQUE,
  `description` TEXT,
  `permissions` JSON,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- Table Structure: users
-- ---------------------------------------------------------

CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `hashed_password` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'user',
  `first_name` VARCHAR(100),
  `last_name` VARCHAR(100),
  `avatar` VARCHAR(500),
  `status` ENUM('active', 'blocked') NOT NULL DEFAULT 'active',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `email_verified` BOOLEAN NOT NULL DEFAULT FALSE,
  `last_login_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `metadata` JSON,
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- Table Structure: plans
-- ---------------------------------------------------------

CREATE TABLE `plans` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `currency` VARCHAR(3) DEFAULT 'USD',
  `billing_cycle` ENUM('monthly', 'yearly') DEFAULT 'monthly',
  `features` JSON,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `max_users` INT DEFAULT 1,
  `max_storage` INT DEFAULT 1024,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_plans_active` (`is_active`),
  INDEX `idx_plans_price` (`price`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- Table Structure: subscriptions
-- ---------------------------------------------------------

CREATE TABLE `subscriptions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `plan_id` INT NOT NULL,
  `status` ENUM('active', 'cancelled', 'expired', 'pending') DEFAULT 'pending',
  `starts_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ends_at` TIMESTAMP NULL,
  `auto_renew` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE RESTRICT,
  INDEX `idx_subscriptions_user` (`user_id`),
  INDEX `idx_subscriptions_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- Table Structure: settings
-- ---------------------------------------------------------

CREATE TABLE `settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `key_name` VARCHAR(255) NOT NULL UNIQUE,
  `key` VARCHAR(255) GENERATED ALWAYS AS (`key_name`) VIRTUAL,
  `value` TEXT,
  `type` VARCHAR(50) NOT NULL DEFAULT 'string',
  `category` VARCHAR(50) NOT NULL DEFAULT 'general',
  `description` TEXT,
  `is_public` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_settings_key` (`key_name`),
  INDEX `idx_settings_public` (`is_public`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- Table Structure: addons
-- ---------------------------------------------------------

CREATE TABLE `addons` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `version` VARCHAR(50) NOT NULL,
  `description` TEXT,
  `author` VARCHAR(255),
  `manifest` JSON,
  `is_enabled` BOOLEAN NOT NULL DEFAULT FALSE,
  `is_active` BOOLEAN GENERATED ALWAYS AS (`is_enabled`) VIRTUAL,
  `is_installed` BOOLEAN NOT NULL DEFAULT FALSE,
  `install_path` VARCHAR(500),
  `config` JSON GENERATED ALWAYS AS (`manifest`) VIRTUAL,
  `installed_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_addons_name` (`name`),
  INDEX `idx_addons_enabled` (`is_enabled`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- Table Structure: support_tickets
-- ---------------------------------------------------------

CREATE TABLE `support_tickets` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ticket_number` VARCHAR(50) UNIQUE,
  `user_id` INT NOT NULL,
  `subject` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `message` TEXT,
  `status` ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
  `priority` ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  `category` VARCHAR(100),
  `assigned_to` INT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `resolved_at` TIMESTAMP NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX `idx_tickets_user` (`user_id`),
  INDEX `idx_tickets_status` (`status`),
  INDEX `idx_tickets_priority` (`priority`),
  INDEX `idx_tickets_ticket_number` (`ticket_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- Table Structure: support_ticket_replies
-- ---------------------------------------------------------

CREATE TABLE `support_ticket_replies` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ticket_id` INT NOT NULL,
  `user_id` INT NULL,
  `message` TEXT NOT NULL,
  `is_internal` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`ticket_id`) REFERENCES `support_tickets` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX `idx_replies_ticket` (`ticket_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- Table Structure: activity_logs
-- ---------------------------------------------------------

CREATE TABLE `activity_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NULL,
  `action` VARCHAR(100) NOT NULL,
  `resource_type` VARCHAR(50),
  `resource_id` INT,
  `details` JSON,
  `ip_address` VARCHAR(45),
  `user_agent` TEXT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX `idx_logs_user` (`user_id`),
  INDEX `idx_logs_action` (`action`),
  INDEX `idx_logs_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- Table Structure: audit_logs
-- ---------------------------------------------------------

CREATE TABLE `audit_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NULL,
  `action` VARCHAR(100) NOT NULL,
  `resource` VARCHAR(100),
  `resource_id` INT,
  `old_values` JSON,
  `new_values` JSON,
  `ip_address` VARCHAR(45),
  `user_agent` TEXT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX `idx_audit_user` (`user_id`),
  INDEX `idx_audit_resource` (`resource`),
  INDEX `idx_audit_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- Table Structure: file_uploads
-- ---------------------------------------------------------

CREATE TABLE `file_uploads` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NULL,
  `filename` VARCHAR(255) NOT NULL,
  `original_name` VARCHAR(255) NOT NULL,
  `mime_type` VARCHAR(100),
  `file_size` INT NOT NULL,
  `file_path` VARCHAR(500) NOT NULL,
  `is_public` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX `idx_uploads_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- SEED DATA
-- ---------------------------------------------------------

-- Default Roles
INSERT INTO `roles` (`name`, `description`, `permissions`) VALUES
('superadmin', 'System owner with full access to all settings and configurations.', '{"accessAdminUsersEnabled": true, "accessAdminPlansEnabled": true, "accessAdminSettingsEnabled": true, "accessUserBillingEnabled": true, "accessUserSupportEnabled": true}'),
('admin', 'Full access to all functionalities and settings. Can manage users, roles, and configurations.', '{"accessAdminUsersEnabled": true, "accessAdminPlansEnabled": true, "accessAdminSettingsEnabled": true, "accessUserBillingEnabled": true, "accessUserSupportEnabled": true}'),
('supervisor', 'Oversees operations and users. Can view reports and has limited configuration access.', '{"accessAdminUsersEnabled": true, "accessAdminPlansEnabled": false, "accessAdminSettingsEnabled": false, "accessUserBillingEnabled": true, "accessUserSupportEnabled": true}'),
('support', 'Provides technical assistance. Can access user accounts and system reports for diagnostics.', '{"accessAdminUsersEnabled": false, "accessAdminPlansEnabled": false, "accessAdminSettingsEnabled": false, "accessUserBillingEnabled": false, "accessUserSupportEnabled": true}'),
('user', 'Access to basic features necessary for tasks. Limited administrative privileges.', '{"accessAdminUsersEnabled": false, "accessAdminPlansEnabled": false, "accessAdminSettingsEnabled": false, "accessUserBillingEnabled": true, "accessUserSupportEnabled": true}'),
('auditor', 'Reviews system activities. Can access reports, but cannot make changes.', '{"accessAdminUsersEnabled": false, "accessAdminPlansEnabled": false, "accessAdminSettingsEnabled": false, "accessUserBillingEnabled": false, "accessUserSupportEnabled": true}'),
('guest', 'Temporary access to limited features. Ideal for visitors or temporary users.', '{"accessAdminUsersEnabled": false, "accessAdminPlansEnabled": false, "accessAdminSettingsEnabled": false, "accessUserBillingEnabled": false, "accessUserSupportEnabled": false}');

-- Default Users (Password: 12345678)
-- Common hash: $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm
INSERT INTO `users` (`email`, `hashed_password`, `role`, `first_name`, `last_name`, `status`, `last_login_at`, `created_at`) VALUES
('superadmin@saas.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'superadmin', 'Super', 'Admin', 'active', '2025-02-10 10:40:00', NOW()),
('admin@saas.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'admin', 'Angelina', 'Gotelli', 'active', '2024-08-12 10:40:00', NOW()),
('supervisor@saas.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'supervisor', 'Shannon', 'Baker', 'active', '2025-02-10 09:00:00', NOW()),
('support@saas.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'support', 'Roberta', 'Horton', 'active', '2024-11-28 10:40:00', NOW()),
('user@saas.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'user', 'Jeremiah', 'Minak', 'active', '2024-11-24 09:00:00', NOW()),
('auditor@saas.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'auditor', 'Arlene', 'Pierce', 'active', '2024-12-02 10:40:00', NOW()),
('guest@saas.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'guest', 'Eugene', 'Stewart', 'active', '2024-11-10 10:40:00', NOW()),
('blocked@saas.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'user', 'Max', 'Alexander', 'blocked', '2024-11-24 08:00:00', NOW()),
('jessica@saas.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'supervisor', 'Jessica', 'Wells', 'blocked', '2025-02-11 08:00:00', NOW()),
('camila@saas.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'guest', 'Camila', 'Simmmona', 'blocked', '2024-12-18 10:40:00', NOW()),
('earl@saas.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'admin', 'Earl', 'Miles', 'active', '2024-12-06 10:40:00', NOW());

-- Plans
INSERT INTO `plans` (`name`, `description`, `price`, `currency`, `billing_cycle`, `features`, `is_active`, `max_users`, `max_storage`) VALUES
('Free Plan', 'Basic plan for individual users', 0.00, 'USD', 'monthly', '{"features": ["Basic Dashboard", "5 Projects", "1GB Storage"]}', TRUE, 1, 1024),
('Starter Plan', 'Great for growing businesses', 29.00, 'USD', 'monthly', '{"features": ["All features", "25 users", "10GB storage", "Priority support", "API access"]}', TRUE, 25, 10240),
('Pro Plan', 'Professional plan for teams', 49.99, 'USD', 'monthly', '{"features": ["Advanced Dashboard", "Unlimited Projects", "50GB Storage", "Priority Support"]}', TRUE, 5, 51200),
('Enterprise Plan', 'Complete solution for large organizations', 99.99, 'USD', 'monthly', '{"features": ["Custom Dashboard", "Unlimited Projects", "100GB Storage", "24/7 Support", "API Access"]}', TRUE, 50, 102400);

-- Subscriptions
INSERT INTO `subscriptions` (`user_id`, `plan_id`, `status`, `starts_at`, `ends_at`, `auto_renew`) VALUES
(1, 4, 'active', '2024-01-01', '2025-01-01', TRUE),
(2, 3, 'active', '2024-01-15', '2025-01-15', TRUE),
(3, 1, 'active', '2024-02-01', NULL, FALSE);

-- Settings
INSERT INTO `settings` (`key_name`, `value`, `type`, `category`, `description`, `is_public`) VALUES
('site_name', 'SaaS Dashboard', 'string', 'general', 'The name of the application', TRUE),
('site_description', 'A comprehensive SaaS dashboard solution', 'string', 'general', 'Description of the application', TRUE),
('max_file_size', '10485760', 'number', 'system', 'Maximum file upload size in bytes', FALSE),
('maintenance_mode', 'false', 'boolean', 'system', 'Whether the site is in maintenance mode', FALSE),
('registration_enabled', 'true', 'boolean', 'auth', 'Whether new user registration is enabled', TRUE),
('primary_color', '#3B82F6', 'color', 'theme', 'Primary theme color', TRUE),
('accent_color', '#10B981', 'color', 'theme', 'Accent theme color', TRUE),
('email_notifications', 'true', 'boolean', 'notifications', 'Enable email notifications', FALSE),
('access_admin_users_enabled', 'true', 'boolean', 'access_control', 'Allow admins to manage users', FALSE),
('access_admin_plans_enabled', 'true', 'boolean', 'access_control', 'Allow admins to manage plans', FALSE),
('access_user_billing_enabled', 'true', 'boolean', 'access_control', 'Allow users to access billing', FALSE),
('access_user_support_enabled', 'true', 'boolean', 'access_control', 'Allow users to access support', FALSE),
('access_admin_settings_enabled', 'true', 'boolean', 'access_control', 'Allow admins to access basic settings', FALSE);

-- Addons
INSERT INTO `addons` (`name`, `version`, `description`, `author`, `manifest`, `is_enabled`, `is_installed`) VALUES
('Analytics Plugin', '1.0.0', 'Advanced analytics and reporting', 'SaaS Team', '{"name": "Analytics", "tracking_enabled": true}', TRUE, TRUE),
('Backup Plugin', '2.1.0', 'Automated backup solution', 'SaaS Team', '{"name": "Backup", "schedule": "daily"}', TRUE, TRUE),
('SEO Tools', '1.5.0', 'Search engine optimization tools', 'SEO Company', '{"name": "SEO", "meta_tags": true}', FALSE, FALSE),
('Online Store', '1.0.0', 'Full-featured e-commerce solution with product management and checkout.', 'SaaS Team', '{"name": "online-store-addon", "displayName": "Online Store", "category": "E-commerce", "version": "1.0.0", "main": "./backend/index.js"}', TRUE, TRUE);

-- Support Tickets
INSERT INTO `support_tickets` (`ticket_number`, `user_id`, `subject`, `description`, `message`, `status`, `priority`, `category`) VALUES
('TICK-001', 1, 'Login Issue', 'I am having trouble logging into my account', 'I am having trouble logging into my account', 'resolved', 'medium', 'Authentication'),
('TICK-002', 2, 'Feature Request', 'I would like to request a new feature for the dashboard', 'I would like to request a new feature for the dashboard', 'open', 'low', 'Feature Request'),
('TICK-003', 3, 'Bug Report', 'Found a bug in the user management section', 'Found a bug in the user management section', 'in_progress', 'high', 'Bug Report'),
('TICK-004', 4, 'Account Upgrade', 'I would like to upgrade my account to Pro plan', 'I would like to upgrade my account to Pro plan', 'open', 'medium', 'Billing'),
('TICK-005', 5, 'Data Export', 'I need to export my data from the platform', 'I need to export my data from the platform', 'resolved', 'low', 'Data Management');

-- Support Ticket Replies
INSERT INTO `support_ticket_replies` (`ticket_id`, `user_id`, `message`, `is_internal`) VALUES
(1, 1, 'I tried resetting my password but still having issues.', FALSE),
(1, 2, 'I see the issue. Let me help you reset your account properly.', FALSE),
(1, 16, 'User account has been reset. Please try logging in again.', TRUE);

-- Activity Logs
INSERT INTO `activity_logs` (`user_id`, `action`, `resource_type`, `resource_id`, `details`, `ip_address`, `user_agent`) VALUES
(1, 'login', 'user', 1, '{"success": true}', '192.168.1.100', 'Mozilla/5.0'),
(2, 'view_dashboard', 'dashboard', NULL, '{"page": "/dashboard"}', '192.168.1.101', 'Mozilla/5.0'),
(3, 'edit_profile', 'user', 3, '{"field": "first_name", "new_value": "Jane"}', '192.168.1.102', 'Mozilla/5.0');

COMMIT;
