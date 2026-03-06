-- Products Table
CREATE TABLE IF NOT EXISTS online_store_products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  account_id INT NOT NULL,
  name VARCHAR(255),
  product_code VARCHAR(100),
  slug VARCHAR(255) UNIQUE,
  description TEXT,
  price DECIMAL(10,2),
  cost_price DECIMAL(10,2),
  bulk_discount_price DECIMAL(10,2),
  tax_rate DECIMAL(5,2),
  images JSON,
  category VARCHAR(100),
  brand VARCHAR(100),
  status ENUM('draft','published','archived'),
  inventory INT DEFAULT 0,
  tags JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table  
CREATE TABLE IF NOT EXISTS online_store_orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  account_id INT NOT NULL,
  order_number VARCHAR(50) UNIQUE,
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  items JSON,
  total DECIMAL(10,2),
  status ENUM('pending','paid','shipped','delivered','cancelled','failed'),
  payment_method VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Store Settings
CREATE TABLE IF NOT EXISTS online_store_settings (
  account_id INT PRIMARY KEY,
  store_name VARCHAR(255),
  custom_domain VARCHAR(255),
  currency VARCHAR(10) DEFAULT 'USD',
  tax_rate DECIMAL(5,2) DEFAULT 0,
  shipping_flat_rate DECIMAL(10,2) DEFAULT 0,
  enabled BOOLEAN DEFAULT TRUE
);
