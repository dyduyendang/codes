-- IVY moda: schema for customers, addresses, orders, order_items, products
-- MySQL / MariaDB (InnoDB, utf8mb4)
-- Create database and use it
CREATE DATABASE IF NOT EXISTS `ivymoda` CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
USE `ivymoda`;

-- Drop tables if exist (safe for re-import during development)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS addresses;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS products;
SET FOREIGN_KEY_CHECKS = 1;

-- Customers
CREATE TABLE customers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(100) NULL,
  last_name VARCHAR(100) NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NULL,
  password_hash VARCHAR(255) NULL,
  is_admin TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY ux_customers_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Addresses (multiple per customer)
CREATE TABLE addresses (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  customer_id BIGINT UNSIGNED NOT NULL,
  label VARCHAR(50) NULL, -- e.g. 'home', 'work'
  line1 VARCHAR(255) NOT NULL,
  line2 VARCHAR(255) NULL,
  city VARCHAR(100) NULL,
  state VARCHAR(100) NULL,
  postal_code VARCHAR(50) NULL,
  country VARCHAR(100) DEFAULT 'Vietnam',
  is_default TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_addresses_customer (customer_id),
  CONSTRAINT fk_addresses_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Products (optional catalog table)
CREATE TABLE products (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  sku VARCHAR(100) NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  stock INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY ux_products_sku (sku)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Orders
CREATE TABLE `orders` (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_number VARCHAR(50) NOT NULL,
  customer_id BIGINT UNSIGNED NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency VARCHAR(10) NOT NULL DEFAULT 'VND',
  payment_method VARCHAR(50) NULL,
  shipping_address_id BIGINT UNSIGNED NULL,
  billing_address_id BIGINT UNSIGNED NULL,
  note TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY ux_orders_number (order_number),
  INDEX idx_orders_customer (customer_id),
  CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  CONSTRAINT fk_orders_shipping_address FOREIGN KEY (shipping_address_id) REFERENCES addresses(id) ON DELETE SET NULL,
  CONSTRAINT fk_orders_billing_address FOREIGN KEY (billing_address_id) REFERENCES addresses(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Order items
CREATE TABLE order_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NULL,
  product_sku VARCHAR(100) NULL,
  product_name VARCHAR(255) NULL,
  unit_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  quantity INT NOT NULL DEFAULT 1,
  line_total DECIMAL(12,2) AS (unit_price * quantity) STORED,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_order_items_order (order_id),
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES `orders`(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Example data (admin user). Replace password_hash with a real hashed password in production.
INSERT INTO customers (first_name, last_name, email, phone, password_hash, is_admin)
VALUES ('Admin', 'Ivy', 'admin@ivymoda.local', '+840000000000', 'PLAINTEXT-Admin@123', 1)
ON DUPLICATE KEY UPDATE email=email;

-- Example product
INSERT INTO products (sku, title, description, price, stock)
VALUES ('DXE001', 'Đầm Xòe Elegant', 'Mô tả ví dụ', 1590000.00, 10)
ON DUPLICATE KEY UPDATE sku=sku;

-- Usage notes:
-- To import into MySQL: mysql -u root -p < db/schema.sql
-- To adapt to SQLite: remove ENGINE/CHARSET clauses and adjust AUTOINCREMENT syntax (use INTEGER PRIMARY KEY AUTOINCREMENT).

-- End of schema
