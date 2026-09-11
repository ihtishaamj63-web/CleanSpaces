-- CLEANSPACES — schema.sql
-- Full rebuild: DROP the old database first, then run this top to bottom.
-- All prior migrations (v1.1–v1.3) are folded into the CREATEs below.

DROP DATABASE IF EXISTS cleanspaces;

CREATE DATABASE cleanspaces;
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
  contact_name VARCHAR(255) NOT NULL DEFAULT '',
  contact_phone VARCHAR(20) NOT NULL DEFAULT '',
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
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE KEY uq_zone_member (zone_id, user_id)
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

CREATE TABLE cleanup_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  location_name VARCHAR(255) NOT NULL,
  address VARCHAR(255) NOT NULL,
  suburb VARCHAR(255) NOT NULL,
  description VARCHAR(1000) NOT NULL,
  preferred_date DATE NULL,
  photo_url VARCHAR(255) NULL,
  status ENUM('new','reviewing','scheduled','completed') DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
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

-- ============================================================
-- SEED DATA
-- Passwords (bcrypt, cost 10):
--   admin@cleanspaces.co.za  / Admin@2026
--   thandiwe@gmail.com      / Resident@2026
--   secondresident@gmail.com / Resident@2026
-- ============================================================

INSERT INTO users (name, email, phone, password_hash, role) VALUES
('Admin', 'admin@cleanspaces.co.za', '0210000000', '$2b$10$tJzrS4NfMGWfn1/YPkOeYemYa8WDQSYKL7IWkLLtsVl8mRErqQ1a2', 'admin'),
('Thandiwe Mbeki', 'thandiwe@gmail.com', '0821234567', '$2b$10$tqwjARJKHokTYjJUg4EXNOWfJzZeOx.jJFwekHQDiLIkf5zKRwohi', 'resident'),
('Nomvula Dlamini', 'secondresident@gmail.com', '0839876543', '$2b$10$tqwjARJKHokTYjJUg4EXNOWfJzZeOx.jJFwekHQDiLIkf5zKRwohi', 'resident');

-- Zones: 1 active (the demo zone), 1 pending (shows the approval flow)
INSERT INTO zones (name, neighborhood, households, plan_type, contact_name, contact_phone, status) VALUES
('NY108 Block', 'Manenberg', 62, 'small', 'Thandiwe Mbeki', '0821234567', 'active'),
('Tafelsig West', "Mitchell's Plain", 180, 'medium', 'Nomvula Dlamini', '0839876543', 'pending');

-- Crew assigned to the active zone
INSERT INTO employees (name, phone, role, hire_date, zone_id, status) VALUES
('Sipho Ndlovu', '0821110001', 'Crew Lead', '2026-08-01', 1, 'active'),
('Mubaarik Davids', '0683216302', 'Crew Lead', '2026-08-15', 1, 'active');

-- Both residents belong to the zone; Thandiwe has paid this month (R108 —
-- the new threshold-based share), Nomvula is pending.
INSERT INTO zone_members (zone_id, user_id, payment_status) VALUES
(1, 2, 'paid'),
(1, 3, 'pending');

INSERT INTO payments (user_id, zone_id, amount, method, status) VALUES
(2, 1, 108.00, 'eft', 'completed');

-- Proof-of-work: one completed cleanup with a real, stable image pair
INSERT INTO cleanup_reports (zone_id, employee_id, before_url, after_url, notes, date_cleaned) VALUES
(1, 1,
 'https://images.unsplash.com/photo-1605635595986-c469573a5676?q=80&w=1200',
 'https://images.unsplash.com/photo-1618477388959-2ea07c0d4c22?q=80&w=1200',
 'Cleared illegal dump at the NY108 corner; 14 bags removed.',
 '2026-09-14');

-- One approved testimonial so the homepage carousel + reviews page aren't empty
INSERT INTO testimonials (name, quote, rating, status) VALUES
('Zanele M., Khayelitsha', 'Our street had nine months of uncollected rubbish. Three weeks after pooling on CleanSpaces, the children play outside again. The photo proof every week is what convinced the neighbours.', 5, 'approved');

-- Verification: hashes must start with $2b$10
SELECT email, role, LEFT(password_hash, 7) AS hash_start FROM users;
