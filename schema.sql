-- =============================================
-- 1. SELECT THE DATABASE
-- =============================================
USE cleanspaces;

-- =============================================
-- 2. DROP EXISTING TABLES (order matters for FK constraints)
-- =============================================
DROP TABLE IF EXISTS password_resets;
DROP TABLE IF EXISTS payroll;
DROP TABLE IF EXISTS cleanup_reports;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS zone_members;
DROP TABLE IF EXISTS testimonials;
DROP TABLE IF EXISTS contact_submissions;
DROP TABLE IF EXISTS zones;
DROP TABLE IF EXISTS users;

-- =============================================
-- 3. CREATE TABLES
-- =============================================

-- USERS
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('resident', 'admin') DEFAULT 'resident',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ZONES
CREATE TABLE zones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    neighborhood VARCHAR(255) NOT NULL,
    households INT NOT NULL,
    plan_type ENUM('small', 'medium', 'large') NOT NULL,
    status ENUM('pending', 'active') DEFAULT 'pending',
    latitude DECIMAL(10, 7) NULL,
    longitude DECIMAL(10, 7) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ZONE MEMBERS
CREATE TABLE zone_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    zone_id INT NOT NULL,
    user_id INT NOT NULL,
    payment_status ENUM('pending', 'paid') DEFAULT 'pending',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- PAYMENTS
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    zone_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    method ENUM('card', 'eft') NOT NULL,
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE CASCADE
);

-- EMPLOYEES (with updated roles)
CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role ENUM('Crew Member', 'Crew Lead', 'Operations Manager') NOT NULL,
    daily_wage DECIMAL(10, 2) NOT NULL,
    hire_date DATE NOT NULL,
    zone_id INT NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE CASCADE
);

-- PAYROLL
CREATE TABLE payroll (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    period VARCHAR(20) NOT NULL,
    status ENUM('pending', 'paid') DEFAULT 'pending',
    payment_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- CLEANUP REPORTS
CREATE TABLE cleanup_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    zone_id INT NOT NULL,
    employee_id INT NOT NULL,
    before_url VARCHAR(255) NOT NULL,
    after_url VARCHAR(255) NOT NULL,
    notes VARCHAR(500) NOT NULL,
    date_cleaned DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- TESTIMONIALS
CREATE TABLE testimonials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    quote VARCHAR(500) NOT NULL,
    rating INT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CONTACT SUBMISSIONS
CREATE TABLE contact_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message VARCHAR(1000) NOT NULL,
    status ENUM('new', 'closed') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- PASSWORD RESETS (UPDATED with indexes)
-- =============================================
CREATE TABLE password_resets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,  -- Added UNIQUE constraint
    expires_at DATETIME NOT NULL,
    used BOOLEAN DEFAULT FALSE,          -- Added used flag for better tracking
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =============================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- =============================================

-- Password resets indexes
CREATE INDEX idx_password_resets_token ON password_resets(token);
CREATE INDEX idx_password_resets_user_id ON password_resets(user_id);
CREATE INDEX idx_password_resets_expires_at ON password_resets(expires_at);
CREATE INDEX idx_password_resets_used ON password_resets(used);

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Zones indexes
CREATE INDEX idx_zones_status ON zones(status);
CREATE INDEX idx_zones_neighborhood ON zones(neighborhood);

-- Zone members indexes
CREATE INDEX idx_zone_members_zone_id ON zone_members(zone_id);
CREATE INDEX idx_zone_members_user_id ON zone_members(user_id);
CREATE INDEX idx_zone_members_payment_status ON zone_members(payment_status);

-- Payments indexes
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_zone_id ON payments(zone_id);
CREATE INDEX idx_payments_status ON payments(status);

-- Employees indexes
CREATE INDEX idx_employees_zone_id ON employees(zone_id);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_role ON employees(role);

-- Payroll indexes
CREATE INDEX idx_payroll_employee_id ON payroll(employee_id);
CREATE INDEX idx_payroll_status ON payroll(status);

-- Cleanup reports indexes
CREATE INDEX idx_cleanup_reports_zone_id ON cleanup_reports(zone_id);
CREATE INDEX idx_cleanup_reports_employee_id ON cleanup_reports(employee_id);

-- Testimonials indexes
CREATE INDEX idx_testimonials_status ON testimonials(status);

-- Contact submissions indexes
CREATE INDEX idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX idx_contact_submissions_email ON contact_submissions(email);

-- =============================================
-- 5. INSERT TEST DATA
-- =============================================

-- Admin account (password: Admin@2026)
INSERT INTO users (name, email, phone, password_hash, role)
VALUES ('Admin', 'admin@cleanspaces.co.za', '0210000000', '$2b$10$3FxoG7gK9LgJbtgpZIoETuF5CQXnNji/YPVeoKnmHLF91pYxYfBNi', 'admin');

-- Resident account (password: Resident@2024)
INSERT INTO users (name, email, phone, password_hash, role)
VALUES ('Thandiwe Mbeki', 'thandiwe@gmail.com', '0821234567', '$2b$10$quGSmpfO2WpC.gzc050lS.W98NDEDB2bNdNYLvsmQoMK4BBbbbWty', 'resident');

-- Additional resident accounts
INSERT INTO users (name, email, phone, password_hash, role)
VALUES 
('John Doe', 'john.doe@gmail.com', '0821234568', '$2b$10$quGSmpfO2WpC.gzc050lS.W98NDEDB2bNdNYLvsmQoMK4BBbbbWty', 'resident'),
('Sarah Smith', 'sarah.smith@gmail.com', '0821234569', '$2b$10$quGSmpfO2WpC.gzc050lS.W98NDEDB2bNdNYLvsmQoMK4BBbbbWty', 'resident');

-- Sample zones (with real Cape Town coordinates for the map)
INSERT INTO zones (name, neighborhood, households, plan_type, status, latitude, longitude)
VALUES
('Manenberg Zone A', 'Manenberg', 65, 'small', 'active', -33.9758, 18.5286),
('Mitchells Plain Zone B', 'Mitchells Plain', 180, 'medium', 'active', -34.0426, 18.6221),
('Khayelitsha Zone C', 'Khayelitsha', 320, 'large', 'active', -34.0508, 18.6749),
('Manenberg Zone D', 'Manenberg', 55, 'small', 'pending', -33.9701, 18.5350),
('Langa Zone E', 'Langa', 95, 'medium', 'pending', -33.9458, 18.5233),
('Nyanga Zone F', 'Nyanga', 150, 'medium', 'active', -34.0050, 18.5836);

-- Sample zone members
INSERT INTO zone_members (zone_id, user_id, payment_status)
VALUES
(1, 2, 'paid'),
(2, 2, 'pending'),
(1, 3, 'paid'),
(2, 4, 'paid');

-- Sample employees
INSERT INTO employees (name, phone, role, daily_wage, hire_date, zone_id, status)
VALUES
('Sipho Ndlovu', '0721234561', 'Crew Lead', 250.00, '2025-01-15', 1, 'active'),
('Maria Santos', '0721234562', 'Crew Member', 200.00, '2025-02-01', 1, 'active'),
('David Chen', '0721234563', 'Crew Member', 200.00, '2025-02-15', 2, 'active'),
('Priya Patel', '0721234564', 'Operations Manager', 350.00, '2025-01-01', 1, 'active');

-- Sample payroll
INSERT INTO payroll (employee_id, amount, period, status, payment_date)
VALUES
(1, 7500.00, 'January 2025', 'paid', '2025-01-31'),
(2, 6000.00, 'January 2025', 'paid', '2025-01-31'),
(3, 6000.00, 'January 2025', 'pending', '2025-02-28');

-- Sample cleanup reports
INSERT INTO cleanup_reports (zone_id, employee_id, before_url, after_url, notes, date_cleaned)
VALUES
(1, 1, 'https://example.com/before1.jpg', 'https://example.com/after1.jpg', 'Full zone cleanup completed', '2025-02-20'),
(2, 3, 'https://example.com/before2.jpg', 'https://example.com/after2.jpg', 'Street cleaning and waste removal', '2025-02-21');

-- Sample testimonials
INSERT INTO testimonials (name, quote, rating, status)
VALUES
('Thandiwe Mbeki', 'CleanSpaces transformed our neighborhood! The team is professional and efficient.', 5, 'approved'),
('John Doe', 'Great service, our streets have never been cleaner.', 4, 'approved'),
('Sarah Smith', 'The team is always on time and does a thorough job.', 5, 'pending');

-- Sample contact submissions
INSERT INTO contact_submissions (name, email, phone, subject, message, status)
VALUES
('Peter Jones', 'peter@gmail.com', '0829876543', 'General Inquiry', 'Do you offer services in my area?', 'new'),
('Linda Brown', 'linda@gmail.com', '0712345678', 'Service Request', 'I would like to request cleanup service for my zone.', 'closed');

-- =============================================
-- 6. VERIFY EVERYTHING
-- =============================================
SELECT '✅ Users' AS 'Check', COUNT(*) AS 'Count' FROM users
UNION
SELECT '✅ Zones', COUNT(*) FROM zones
UNION
SELECT '✅ Zone Members', COUNT(*) FROM zone_members
UNION
SELECT '✅ Employees', COUNT(*) FROM employees
UNION
SELECT '✅ Payroll', COUNT(*) FROM payroll
UNION
SELECT '✅ Cleanup Reports', COUNT(*) FROM cleanup_reports
UNION
SELECT '✅ Testimonials', COUNT(*) FROM testimonials
UNION
SELECT '✅ Contact Submissions', COUNT(*) FROM contact_submissions
UNION
SELECT '✅ Password Resets', COUNT(*) FROM password_resets;

-- Show employee roles (should show 3 allowed values)
SELECT DISTINCT role FROM employees;

-- Show all users
SELECT id, name, email, role FROM users;

-- Show zones with status
SELECT id, name, neighborhood, status, households FROM zones;