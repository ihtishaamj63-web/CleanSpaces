-- CLEANSPACES — schema.sql
-- Run top to bottom on a fresh MySQL instance.
-- Everyone on the team runs this file; any future schema changes get
-- appended here so this file stays the single source of truth.

CREATE DATABASE IF NOT EXISTS cleanspaces;

USE cleanspaces;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('resident','admin') DEFAULT 'resident',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE zones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  neighborhood VARCHAR(255) NOT NULL,
  households INT NOT NULL,
  plan_type ENUM('small','medium','large') NOT NULL,
  status ENUM('pending','active') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE zone_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  zone_id INT NOT NULL,
  user_id INT NOT NULL,
  payment_status ENUM('pending','paid') DEFAULT 'pending',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (zone_id) REFERENCES zones(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  zone_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  method ENUM('card','eft') NOT NULL,
  status ENUM('pending','completed','failed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (zone_id) REFERENCES zones(id)
);

CREATE TABLE employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  role ENUM('Crew Member', 'Crew Lead', 'Operations Manager') NOT NULL,
  daily_wage DECIMAL(10,2) NOT NULL,
  hire_date DATE NOT NULL,
  zone_id INT NOT NULL,
  status ENUM('active','inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (zone_id) REFERENCES zones(id)
);

CREATE TABLE payroll (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  period VARCHAR(20) NOT NULL,
  status ENUM('pending','paid') DEFAULT 'pending',
  payment_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id)
);

CREATE TABLE cleanup_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  zone_id INT NOT NULL,
  employee_id INT NOT NULL,
  before_url VARCHAR(255) NOT NULL,
  after_url VARCHAR(255) NOT NULL,
  notes VARCHAR(500) NOT NULL,
  date_cleaned DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (zone_id) REFERENCES zones(id),
  FOREIGN KEY (employee_id) REFERENCES employees(id)
);

CREATE TABLE testimonials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  quote VARCHAR(500) NOT NULL,
  rating INT NOT NULL,
  status ENUM('pending','approved','rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contact_submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message VARCHAR(1000) NOT NULL,
  status ENUM('new','closed') DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- TEST ACCOUNTS (development only, not encrypted)
INSERT INTO users (name, email, phone, password_hash, role)
VALUES ('Admin', 'admin@cleanspaces.co.za', '0210000000', 'Admin@2026', 'admin');

INSERT INTO users (name, email, phone, password_hash, role)
VALUES ('Thandiwe Mbeki', 'thandiwe@gmail.com', '0821234567', 'Resident@2026', 'resident');