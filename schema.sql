-- CLEANSPACES — schema.sql
-- Fresh rebuild: run top to bottom. Matches the production Railway database.
-- Passwords (bcrypt, cost 10): Admin@2026 / Resident@2026

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
-- ============================================================

INSERT INTO users (name, email, phone, password_hash, role) VALUES
('Admin', 'admin@cleanspaces.co.za', '0210000000', '$2b$10$tJzrS4NfMGWfn1/YPkOeYemYa8WDQSYKL7IWkLLtsVl8mRErqQ1a2', 'admin'),
('Thandiwe Mbeki', 'thandiwe@gmail.com', '0821234567', '$2b$10$tqwjARJKHokTYjJUg4EXNOWfJzZeOx.jJFwekHQDiLIkf5zKRwohi', 'resident'),
('Nomvula Dlamini', 'secondresident@gmail.com', '0839876543', '$2b$10$tqwjARJKHokTYjJUg4EXNOWfJzZeOx.jJFwekHQDiLIkf5zKRwohi', 'resident'),
('Andile Khoza', 'andile@gmail.com', '0845550199', '$2b$10$tqwjARJKHokTYjJUg4EXNOWfJzZeOx.jJFwekHQDiLIkf5zKRwohi', 'resident'),
('Fatima Adams', 'fatima@gmail.com', '0854440288', '$2b$10$tqwjARJKHokTYjJUg4EXNOWfJzZeOx.jJFwekHQDiLIkf5zKRwohi', 'resident'),
('Zanele Mkhize', 'zanele@gmail.com', '0837770366', '$2b$10$tqwjARJKHokTYjJUg4EXNOWfJzZeOx.jJFwekHQDiLIkf5zKRwohi', 'resident');

-- Four zones: 2 active with different plans/progress, 1 pending (approval demo),
-- 1 active with no members (the "join a zone" journey)
INSERT INTO zones (name, neighborhood, households, plan_type, contact_name, contact_phone, status) VALUES
('NY108 Block', 'Manenberg', 62, 'small', 'Thandiwe Mbeki', '0821234567', 'active'),
('Site B Cluster', 'Khayelitsha', 210, 'large', 'Andile Khoza', '0845550199', 'active'),
('Tafelsig West', "Mitchell's Plain", 180, 'medium', 'Nomvula Dlamini', '0839876543', 'pending'),
('Harare Street Committee', 'Khayelitsha', 95, 'small', 'Zanele Mkhize', '0837770366', 'active');

-- Crew: each active zone has assigned workers; the pending zone has none
INSERT INTO employees (name, phone, role, hire_date, zone_id, status) VALUES
('Sipho Ndlovu', '0821110001', 'Crew Lead', '2026-08-01', 1, 'active'),
('Mubaarik Davids', '0683216302', 'Crew Lead', '2026-08-15', 1, 'active'),
('Bongani Sithole', '0812220003', 'Crew Member', '2026-08-20', 2, 'active'),
('Nomsa Petersen', '0823330004', 'Crew Member', '2026-09-01', 2, 'active'),
('Yusuf Ebrahim', '0844440005', 'Operations Manager', '2026-08-10', 2, 'active'),
('Lerato Mokoena', '0815550006', 'Crew Member', '2026-09-05', 4, 'active');

-- Memberships: zone 1 mid-activation, zone 2 well on its way, zone 4 empty
INSERT INTO zone_members (zone_id, user_id, payment_status) VALUES
(1, 2, 'paid'),
(1, 3, 'pending'),
(2, 4, 'paid'),
(2, 5, 'paid'),
(2, 6, 'paid');

-- Payments: threshold-based shares (small/62 = R108, large/210 = R91)
INSERT INTO payments (user_id, zone_id, amount, method, status) VALUES
(2, 1, 108.00, 'eft', 'completed'),
(4, 2, 91.00, 'card', 'completed'),
(5, 2, 91.00, 'card', 'completed'),
(6, 2, 91.00, 'eft', 'completed');

-- Cleanup proof: real before/after photos hosted on imgbb
INSERT INTO cleanup_reports (zone_id, employee_id, before_url, after_url, notes, date_cleaned) VALUES
(1, 1,
 'https://i.ibb.co/kg72YRCV/before-ny108-jpg.jpg',
 'https://i.ibb.co/HpXFQPvb/after-ny108-jpg.png',
 'Cleared illegal dump at the NY108 corner; 14 bags removed.',
 '2026-09-14'),
(2, 3,
 'https://i.ibb.co/5gyFMCSj/before-siteb-jpg.jpg',
 'https://i.ibb.co/GqMjG9j/after-siteb-jpg.png',
 'First scheduled cleanup of the Site B cluster: storm drain cleared, 22 bags and bulky waste removed.',
 '2026-09-12');

-- Two approved testimonials + one pending (shows moderation flow)
INSERT INTO testimonials (name, quote, rating, status) VALUES
('Zanele M., Khayelitsha', 'Our street had nine months of uncollected rubbish. Three weeks after pooling on CleanSpaces, the children play outside again. The photo proof every week is what convinced the neighbours.', 5, 'approved'),
('Andile K., Site B', 'Seeing the activation bar fill up got our whole cluster talking. Everyone can see who has paid and what the crew did — that transparency is why people contribute.', 4, 'approved'),
('Nomvula D., Tafelsig', 'We are still gathering households, but the dashboard already makes it easy to show neighbours exactly where we stand.', 5, 'pending');

-- One resident cleanup request in review (shows the report → admin flow)
INSERT INTO cleanup_requests (user_id, location_name, address, suburb, description, preferred_date, photo_url, status) VALUES
(3, 'Blocked storm drain', 'Oxford St & 5th Ave, Tafelsig', "Mitchell's Plain", 'Drain completely blocked by refuse; flooding risk when the rains come. About 15 bags of waste piled around it.', '2026-09-25', NULL, 'reviewing');

-- Verification
SELECT email, role, LEFT(password_hash, 7) AS hash_start FROM users;
SELECT SUM(amount) FROM payments WHERE status = 'completed' AND created_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01');