-- Insert real users into the database
-- Password: 12345678 (hashed with bcrypt)
-- Active users: gamesme0000@gmail.com to gamesme0009@gmail.com
-- Inactive users: dummy0001@gmail.com to dummy0005@gmail.com

-- Active users (10 users)
INSERT INTO users (email, hashed_password, role, first_name, last_name, is_active, email_verified, created_at) VALUES
('gamesme0000@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'superadmin', 'Game', 'Master', TRUE, TRUE, NOW()),
('gamesme0001@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'admin', 'Game', 'Player', TRUE, TRUE, NOW()),
('gamesme0002@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'user', 'Game', 'Champion', TRUE, TRUE, NOW()),
('gamesme0003@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'user', 'Game', 'Warrior', TRUE, TRUE, NOW()),
('gamesme0004@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'user', 'Game', 'Hero', TRUE, TRUE, NOW()),
('gamesme0005@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'user', 'Game', 'Legend', TRUE, TRUE, NOW()),
('gamesme0006@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'user', 'Game', 'Expert', TRUE, TRUE, NOW()),
('gamesme0007@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'user', 'Game', 'Pro', TRUE, TRUE, NOW()),
('gamesme0008@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'user', 'Game', 'Master', TRUE, TRUE, NOW()),
('gamesme0009@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'user', 'Game', 'Elite', TRUE, TRUE, NOW());

-- Inactive users (5 users)
INSERT INTO users (email, hashed_password, role, first_name, last_name, is_active, email_verified, created_at) VALUES
('dummy0001@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'user', 'Dummy', 'User', FALSE, FALSE, NOW()),
('dummy0002@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'user', 'Test', 'Account', FALSE, FALSE, NOW()),
('dummy0003@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'user', 'Sample', 'Profile', FALSE, FALSE, NOW()),
('dummy0004@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'user', 'Inactive', 'User', FALSE, FALSE, NOW()),
('dummy0005@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'user', 'Disabled', 'Account', FALSE, FALSE, NOW());

-- Insert some sample plans
INSERT INTO plans (name, description, price, currency, billing_cycle, features, is_active, max_users, max_storage) VALUES
('Free Plan', 'Basic plan for individual users', 0.00, 'USD', 'monthly', '{"features": ["Basic Dashboard", "5 Projects", "1GB Storage"]}', TRUE, 1, 1024),
('Pro Plan', 'Professional plan for teams', 29.99, 'USD', 'monthly', '{"features": ["Advanced Dashboard", "Unlimited Projects", "10GB Storage", "Priority Support"]}', TRUE, 5, 10240),
('Enterprise Plan', 'Complete solution for large organizations', 99.99, 'USD', 'monthly', '{"features": ["Custom Dashboard", "Unlimited Projects", "100GB Storage", "24/7 Support", "API Access"]}', TRUE, 50, 102400);

-- Insert some sample support tickets
INSERT INTO support_tickets (user_id, subject, message, status, priority, category) VALUES
(1, 'Login Issue', 'I am having trouble logging into my account', 'resolved', 'medium', 'Authentication'),
(2, 'Feature Request', 'I would like to request a new feature for the dashboard', 'open', 'low', 'Feature Request'),
(3, 'Bug Report', 'Found a bug in the user management section', 'in_progress', 'high', 'Bug Report'),
(4, 'Account Upgrade', 'I would like to upgrade my account to Pro plan', 'open', 'medium', 'Billing'),
(5, 'Data Export', 'I need to export my data from the platform', 'resolved', 'low', 'Data Management');

-- Insert some activity logs
INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details, ip_address, user_agent) VALUES
(1, 'login', 'user', 1, '{"success": true}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
(2, 'view_dashboard', 'dashboard', NULL, '{"page": "/dashboard"}', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),
(3, 'edit_profile', 'user', 3, '{"field": "first_name", "old_value": "John", "new_value": "Jane"}', '192.168.1.102', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'),
(4, 'create_ticket', 'support_ticket', 2, '{"subject": "Feature Request"}', '192.168.1.103', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'),
(5, 'delete_user', 'user', 10, '{"deleted_user_email": "olduser@example.com"}', '192.168.1.104', 'Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0 Firefox/88.0');

-- Insert some settings
INSERT INTO settings (key_name, value, description, is_public) VALUES
('site_name', 'SaaS Dashboard', 'The name of the application', TRUE),
('site_description', 'A comprehensive SaaS dashboard solution', 'Description of the application', TRUE),
('max_file_size', '10485760', 'Maximum file upload size in bytes', FALSE),
('maintenance_mode', 'false', 'Whether the site is in maintenance mode', FALSE),
('registration_enabled', 'true', 'Whether new user registration is enabled', TRUE);

-- Insert some addon examples
INSERT INTO addons (name, version, description, author, is_active, is_installed, config) VALUES
('Analytics Plugin', '1.0.0', 'Advanced analytics and reporting', 'SaaS Team', TRUE, TRUE, '{"tracking_enabled": true, "reports": ["daily", "weekly", "monthly"]}'),
('Backup Plugin', '2.1.0', 'Automated backup solution', 'SaaS Team', TRUE, TRUE, '{"schedule": "daily", "retention": "30 days"}'),
('SEO Tools', '1.5.0', 'Search engine optimization tools', 'SEO Company', FALSE, FALSE, '{"meta_tags": true, "sitemap": true}');
