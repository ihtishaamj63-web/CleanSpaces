CREATE DATABASE IF NOT EXISTS cleanspaces;
USE cleanspaces;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('resident','admin') DEFAULT 'resident',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS zones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  neighborhood VARCHAR(255) NOT NULL,
  households INT NOT NULL,
  plan_type ENUM('small','medium','large') NOT NULL,
  status ENUM('pending','active') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  role ENUM('Crew Member','Crew Lead','Operations Manager') NOT NULL,
  -- daily_wage is derived from role to ensure consistency and cannot be set by clients
  daily_wage DECIMAL(10,2) GENERATED ALWAYS AS (
    CASE role
      WHEN 'Crew Member' THEN 300.00
      WHEN 'Crew Lead' THEN 350.00
      WHEN 'Operations Manager' THEN 450.00
      ELSE 0.00
    END
  ) STORED,
  hire_date DATE NOT NULL,
  zone_id INT NOT NULL,
  status ENUM('active','inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (zone_id) REFERENCES zones(id)
);

/*
Migration helper (for applying to an existing DB via Workbench or mysql CLI):

-- 1) Inspect current role values
SELECT DISTINCT role FROM employees;

-- 2) If any roles are not exactly one of the three values below, update them.
-- Example canonicalisation updates (run as needed):
UPDATE employees SET role = 'Crew Member' WHERE role IN ('crew_member','Crew member','Crew Member','Cleanup crew','cleanup crew');
UPDATE employees SET role = 'Crew Lead' WHERE role IN ('crew_lead','Crew lead','Crew Lead');
UPDATE employees SET role = 'Operations Manager' WHERE role IN ('operations_manager','Operations manager','Operations Manager','ops manager','Ops Manager');

-- 3) After canonicalising existing values, alter the column to enforce the ENUM
ALTER TABLE employees
  MODIFY COLUMN role ENUM('Crew Member','Crew Lead','Operations Manager') NOT NULL;

-- 4) Ensure daily_wage is a generated column matching the displayed roles.
-- If `daily_wage` is already generated with different expressions, you can drop and re-add it:
ALTER TABLE employees DROP COLUMN IF EXISTS daily_wage;
ALTER TABLE employees ADD COLUMN daily_wage DECIMAL(10,2) GENERATED ALWAYS AS (
  CASE role
    WHEN 'Crew Member' THEN 300.00
    WHEN 'Crew Lead' THEN 350.00
    WHEN 'Operations Manager' THEN 450.00
    ELSE 0.00
  END
) STORED;

-- Notes:
-- • Run the SELECT DISTINCT first and only run the UPDATEs necessary to canonicalise your existing data.
-- • Back up your DB before running ALTER/DROP operations.
*/

CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, zone_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL, method ENUM('card','eft') NOT NULL,
  status ENUM('pending','completed','failed') DEFAULT 'pending', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id), FOREIGN KEY (zone_id) REFERENCES zones(id)
);

CREATE TABLE IF NOT EXISTS payroll (
  id INT AUTO_INCREMENT PRIMARY KEY, employee_id INT NOT NULL, amount DECIMAL(10,2) NOT NULL,
  period VARCHAR(20) NOT NULL, status ENUM('pending','paid') DEFAULT 'pending', payment_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (employee_id) REFERENCES employees(id)
);

CREATE TABLE IF NOT EXISTS cleanup_reports (
  id INT AUTO_INCREMENT PRIMARY KEY, zone_id INT NOT NULL, employee_id INT NOT NULL,
  before_url VARCHAR(255) NOT NULL, after_url VARCHAR(255) NOT NULL, notes VARCHAR(500) NOT NULL,
  date_cleaned DATE NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (zone_id) REFERENCES zones(id), FOREIGN KEY (employee_id) REFERENCES employees(id)
);

CREATE TABLE IF NOT EXISTS cleanup_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  location_name VARCHAR(255) NOT NULL,
  address VARCHAR(500) NOT NULL,
  suburb VARCHAR(255) NOT NULL,
  description VARCHAR(1000) NOT NULL,
  preferred_date DATE NULL,
  status ENUM('new','reviewing','scheduled','completed') DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

INSERT IGNORE INTO users (name, email, phone, password_hash, role)
VALUES ('Admin', 'admin@cleanspaces.co.za', '0210000000', 'Admin@2026', 'admin'),
       ('Thandiwe Mbeki', 'thandiwe@gmail.com', '0821234567', 'Resident@2026', 'resident');
