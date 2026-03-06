-- SaaS Dashboard-- SaaS Dashboard MySQL Seed Data
-- Compatible with MySQL 8.0+

-- Insert default users
INSERT INTO users (email, hashed_password, role, first_name, last_name, is_active, email_verified) VALUES
('superadmin@saas.com', '$2b$12$pxzrQnUnhfWxTdVSnTcegOVQIvJstsXPqsetlQ2OE3QBfoSFvgPBK', 'superadmin', 'Super', 'Admin', TRUE, TRUE),
('admin@saas.com', '$2b$12$2vTQOmkcco7hCFSvEsRNgOuhPxPl4SgfgXLEt/6Ya/ZwbH3nGSoo6', 'admin', 'Admin', 'User', TRUE, TRUE),
('user@saas.com', '$2b$12$WJmV/Jk6pLLzVP5qTanl1OFNURk9e3TyNOrlOoGWBweNfZJQFKPBu', 'user', 'Regular', 'User', TRUE, TRUE);

-- Insert plans
INSERT INTO plans (name, description, price, currency, billing_cycle, features, is_active, max_users, max_storage) VALUES
('Free', 'Perfect for small teams getting started', 0.00, 'USD', 'monthly', 
'["Basic features", "5 users", "1GB storage", "Community support"]', TRUE, 5, 1024),
('Starter', 'Great for growing businesses', 29.00, 'USD', 'monthly',
'["All features", "25 users", "10GB storage", "Priority support", "API access"]', TRUE, 25, 10240),
('Pro', 'Complete solution for large teams', 99.00, 'USD', 'monthly',
'["All features", "Unlimited users", "100GB storage", "Priority support", "Advanced API", "Custom branding", "White label"]', TRUE, 999, 102400);

-- Insert subscriptions
INSERT INTO subscriptions (user_id, plan_id, status, starts_at, ends_at, auto_renew) VALUES
(1, 3, 'active', '2024-01-01', '2025-01-01', TRUE),
(2, 2, 'active', '2024-01-15', '2025-01-15', TRUE),
(3, 1, 'active', '2024-02-01', NULL, FALSE);

-- Insert settings
INSERT INTO settings (key_name, value, description, is_public) VALUES
('site_name', 'SaaS Dashboard', 'Application name', TRUE),
('site_description', 'Production-ready SaaS Admin Dashboard', 'Application description', TRUE),
('maintenance_mode', 'false', 'Enable maintenance mode', FALSE),
('max_upload_size', '50', 'Maximum file upload size in MB', FALSE),
('email_notifications', 'true', 'Enable email notifications', FALSE),
('default_timezone', 'UTC', 'Default timezone', FALSE),
('default_currency', 'USD', 'Default currency', TRUE),
('trial_period_days', '14', 'Trial period in days', FALSE);

-- Insert sample support tickets
INSERT INTO support_tickets (user_id, subject, message, status, priority, category) VALUES
(3, 'Login Issue', 'I am having trouble logging into my account. It keeps saying invalid credentials.', 'open', 'medium', 'authentication'),
(3, 'Feature Request', 'Would it be possible to add dark mode to the dashboard?', 'open', 'low', 'feature_request'),
(2, 'Billing Question', 'I have a question about my recent invoice. Can you help me understand the charges?', 'in_progress', 'high', 'billing'),
(1, 'Bug Report', 'Found an issue with the user management page. When I try to edit a user, it throws an error.', 'resolved', 'urgent', 'bug_report');

-- Insert support ticket replies
INSERT INTO support_ticket_replies (ticket_id, user_id, message, is_internal) VALUES
(1, 3, 'I tried resetting my password but still having issues.', FALSE),
(1, 2, 'I see the issue. Let me help you reset your account properly.', FALSE),
(1, 1, 'User account has been reset. Please try logging in again.', TRUE),
(2, 3, 'The invoice was for the Starter plan upgrade. Everything looks correct on our end.', FALSE),
(3, 2, 'Thank you for the clarification. The charges are for the plan upgrade that was processed automatically.', FALSE),
(4, 1, 'This issue has been fixed in the latest update. Please clear your cache and try again.', TRUE);

-- Insert sample activity logs
INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details, ip_address, user_agent) VALUES
(1, 'login', 'user', 1, '{"success": true}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
(2, 'login', 'user', 2, '{"success": true}', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),
(3, 'login', 'user', 3, '{"success": true}', '192.168.1.102', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'),
(1, 'create', 'support_ticket', 1, '{"subject": "Login Issue"}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
(2, 'update', 'user', 2, '{"changes": ["email", "role"]}', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),
(3, 'view', 'dashboard', NULL, '{"page": "overview"}', '192.168.1.102', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36');

-- Insert sample file uploads
INSERT INTO file_uploads (user_id, filename, original_name, mime_type, file_size, file_path, is_public) VALUES
(1, 'avatar_001.jpg', 'profile-picture.jpg', 'image/jpeg', 245760, '/uploads/avatars/avatar_001.jpg', TRUE),
(2, 'doc_001.pdf', 'user-manual.pdf', 'application/pdf', 1048576, '/uploads/docs/doc_001.pdf', FALSE),
(3, 'logo_001.png', 'company-logo.png', 'image/png', 524288, '/uploads/logos/logo_001.png', TRUE),
(1, 'backup_001.zip', 'database-backup.zip', 'application/zip', 52428800, '/uploads/backups/backup_001.zip', FALSE);
