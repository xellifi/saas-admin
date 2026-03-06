-- Enhanced Store Management Schema

-- Add store preferences and settings table
CREATE TABLE IF NOT EXISTS online_store_preferences (
  id INT PRIMARY KEY AUTO_INCREMENT,
  store_id INT NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'general',
  setting_key VARCHAR(100) NOT NULL,
  setting_value TEXT,
  setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_store_setting (store_id, category, setting_key),
  INDEX idx_store_id (store_id),
  INDEX idx_category (category),
  INDEX idx_setting_key (setting_key)
);

-- Store analytics table
CREATE TABLE IF NOT EXISTS online_store_analytics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  store_id INT NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  event_data JSON,
  session_id VARCHAR(255),
  user_id INT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  referrer VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_store_id (store_id),
  INDEX idx_event_type (event_type),
  INDEX idx_created_at (created_at),
  INDEX idx_session_id (session_id)
);

-- Store templates table
CREATE TABLE IF NOT EXISTS online_store_templates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  category VARCHAR(100),
  preview_image VARCHAR(500),
  template_config JSON,
  is_premium BOOLEAN DEFAULT FALSE,
  price DECIMAL(10,2) DEFAULT 0.00,
  downloads INT DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.00,
  rating_count INT DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_featured (featured),
  INDEX idx_active (active)
);

-- Store domains table for custom domains
CREATE TABLE IF NOT EXISTS online_store_domains (
  id INT PRIMARY KEY AUTO_INCREMENT,
  store_id INT NOT NULL,
  domain VARCHAR(255) NOT NULL UNIQUE,
  is_primary BOOLEAN DEFAULT FALSE,
  ssl_enabled BOOLEAN DEFAULT FALSE,
  ssl_expires_at TIMESTAMP NULL,
  dns_verified BOOLEAN DEFAULT FALSE,
  dns_verification_token VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_store_id (store_id),
  INDEX idx_domain (domain),
  INDEX idx_primary (is_primary)
);

-- Store SEO settings
CREATE TABLE IF NOT EXISTS online_store_seo (
  id INT PRIMARY KEY AUTO_INCREMENT,
  store_id INT NOT NULL UNIQUE,
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords VARCHAR(500),
  og_image VARCHAR(500),
  twitter_card VARCHAR(50),
  google_analytics_id VARCHAR(50),
  facebook_pixel_id VARCHAR(50),
  custom_head_script TEXT,
  custom_body_script TEXT,
  sitemap_enabled BOOLEAN DEFAULT TRUE,
  robots_txt TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_store_id (store_id)
);

-- Store shipping zones
CREATE TABLE IF NOT EXISTS online_store_shipping_zones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  store_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  countries JSON NOT NULL,
  shipping_rates JSON NOT NULL,
  free_shipping_threshold DECIMAL(10,2) DEFAULT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_store_id (store_id),
  INDEX idx_active (active)
);

-- Store tax rates
CREATE TABLE IF NOT EXISTS online_store_tax_rates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  store_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  rate DECIMAL(5,4) NOT NULL,
  countries JSON,
  states JSON,
  applies_to_shipping BOOLEAN DEFAULT FALSE,
  compound BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_store_id (store_id),
  INDEX idx_active (active)
);

-- Update existing store settings table to support multiple stores
ALTER TABLE online_store_settings 
DROP PRIMARY KEY,
ADD COLUMN IF NOT EXISTS id INT PRIMARY KEY AUTO_INCREMENT FIRST,
ADD COLUMN IF NOT EXISTS store_slug VARCHAR(255) UNIQUE AFTER store_name,
ADD COLUMN IF NOT EXISTS theme_color VARCHAR(7) DEFAULT '#2563eb' AFTER currency,
ADD COLUMN IF NOT EXISTS logo_url VARCHAR(500) AFTER theme_color,
ADD COLUMN IF NOT EXISTS banner_url VARCHAR(500) AFTER logo_url,
ADD COLUMN IF NOT EXISTS payment_methods JSON AFTER banner_url,
ADD COLUMN IF NOT EXISTS shipping_methods JSON AFTER payment_methods,
ADD COLUMN IF NOT EXISTS email_settings JSON AFTER shipping_methods,
ADD COLUMN IF NOT EXISTS social_links JSON AFTER email_settings,
ADD COLUMN IF NOT EXISTS custom_css TEXT AFTER social_links,
ADD COLUMN IF NOT EXISTS custom_js TEXT AFTER custom_css,
ADD COLUMN IF NOT EXISTS maintenance_mode BOOLEAN DEFAULT FALSE AFTER custom_js,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER maintenance_mode,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

-- Remove old primary key constraint if it exists
ALTER TABLE online_store_settings DROP PRIMARY KEY,
ADD PRIMARY KEY (id);

-- Add foreign key constraints
ALTER TABLE online_store_preferences ADD CONSTRAINT fk_store_preferences_store_id 
FOREIGN KEY (store_id) REFERENCES online_store_settings(id) ON DELETE CASCADE;

ALTER TABLE online_store_analytics ADD CONSTRAINT fk_store_analytics_store_id 
FOREIGN KEY (store_id) REFERENCES online_store_settings(id) ON DELETE CASCADE;

ALTER TABLE online_store_domains ADD CONSTRAINT fk_store_domains_store_id 
FOREIGN KEY (store_id) REFERENCES online_store_settings(id) ON DELETE CASCADE;

ALTER TABLE online_store_seo ADD CONSTRAINT fk_store_seo_store_id 
FOREIGN KEY (store_id) REFERENCES online_store_settings(id) ON DELETE CASCADE;

ALTER TABLE online_store_shipping_zones ADD CONSTRAINT fk_store_shipping_zones_store_id 
FOREIGN KEY (store_id) REFERENCES online_store_settings(id) ON DELETE CASCADE;

ALTER TABLE online_store_tax_rates ADD CONSTRAINT fk_store_tax_rates_store_id 
FOREIGN KEY (store_id) REFERENCES online_store_settings(id) ON DELETE CASCADE;

-- Update products table to reference store
ALTER TABLE online_store_products 
ADD COLUMN IF NOT EXISTS store_id INT NOT NULL DEFAULT 1 AFTER id,
ADD COLUMN IF NOT EXISTS sku VARCHAR(100) UNIQUE AFTER product_code,
ADD COLUMN IF NOT EXISTS track_inventory BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS allow_backorder BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS weight DECIMAL(8,2),
ADD COLUMN IF NOT EXISTS dimensions JSON,
ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS seo_description TEXT,
ADD COLUMN IF NOT EXISTS variant_attributes JSON,
ADD COLUMN IF NOT EXISTS related_products JSON,
ADD COLUMN IF NOT EXISTS upsell_products JSON,
ADD COLUMN IF NOT EXISTS cross_sell_products JSON,
ADD COLUMN IF NOT EXISTS product_type ENUM('simple', 'variable', 'digital', 'service') DEFAULT 'simple',
ADD COLUMN IF NOT EXISTS downloadable_files JSON,
ADD COLUMN IF NOT EXISTS download_limit INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS download_expiry_days INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS sale_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS sale_start_date TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS sale_end_date TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Add index for store_id in products
ALTER TABLE online_store_products ADD INDEX idx_store_id (store_id);

-- Update orders table to reference store
ALTER TABLE online_store_orders 
ADD COLUMN IF NOT EXISTS store_id INT NOT NULL DEFAULT 1 AFTER id,
ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS billing_address JSON,
ADD COLUMN IF NOT EXISTS shipping_address JSON,
ADD COLUMN IF NOT EXISTS order_notes TEXT,
ADD COLUMN IF NOT EXISTS internal_notes TEXT,
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS shipping_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS payment_status ENUM('pending', 'paid', 'failed', 'refunded', 'partially_refunded') DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS fulfillment_status ENUM('unfulfilled', 'partial', 'fulfilled') DEFAULT 'unfulfilled',
ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(255),
ADD COLUMN IF NOT EXISTS shipping_carrier VARCHAR(100),
ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Add index for store_id in orders
ALTER TABLE online_store_orders ADD INDEX idx_store_id (store_id);
