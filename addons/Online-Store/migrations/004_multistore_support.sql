-- Migration: Multi-Store Support
-- This migration transforms the online_store_settings table to support multiple stores per account.

-- 1. Create a temporary table with the new schema
CREATE TABLE IF NOT EXISTS online_store_settings_new (
  id INT PRIMARY KEY AUTO_INCREMENT,
  account_id INT NOT NULL,
  store_name VARCHAR(255),
  custom_domain VARCHAR(255),
  store_slug VARCHAR(255) UNIQUE,
  payment_methods JSON,
  theme_color VARCHAR(50),
  currency VARCHAR(10) DEFAULT 'USD',
  tax_rate DECIMAL(5,2) DEFAULT 0,
  shipping_flat_rate DECIMAL(10,2) DEFAULT 0,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (account_id)
);

-- 2. Migrate existing data if the old table exists
-- We check if the table exists and has data before inserting
INSERT INTO online_store_settings_new (account_id, store_name, custom_domain, store_slug, payment_methods, theme_color, currency, tax_rate, shipping_flat_rate, enabled)
SELECT account_id, store_name, custom_domain, store_slug, payment_methods, theme_color, currency, tax_rate, shipping_flat_rate, enabled
FROM online_store_settings;

-- 3. Replace the old table
DROP TABLE online_store_settings;
RENAME TABLE online_store_settings_new TO online_store_settings;

-- 4. Update Products table to include store_id
ALTER TABLE online_store_products ADD COLUMN store_id INT AFTER account_id;
-- Associate existing products with the first store found for the account
UPDATE online_store_products p
JOIN online_store_settings s ON p.account_id = s.account_id
SET p.store_id = s.id;

-- 5. Update Orders table to include store_id
ALTER TABLE online_store_orders ADD COLUMN store_id INT AFTER account_id;
-- Associate existing orders with the first store found for the account
UPDATE online_store_orders o
JOIN online_store_settings s ON o.account_id = s.account_id
SET o.store_id = s.id;
