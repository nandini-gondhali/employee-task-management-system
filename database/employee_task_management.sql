-- Employee Task Management System Database Schema
-- Run: mysql -u root -p < database/employee_task_management.sql

CREATE DATABASE IF NOT EXISTS employee_task_management;
USE employee_task_management;

DROP TABLE IF EXISTS task_attachments;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'employee') NOT NULL DEFAULT 'employee',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  department VARCHAR(100) NOT NULL,
  designation VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
  status ENUM('pending', 'in_progress', 'completed') NOT NULL DEFAULT 'pending',
  start_date DATE NOT NULL,
  due_date DATE NOT NULL,
  assigned_employee_id INT NOT NULL,
  created_by INT NOT NULL,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT chk_due_date CHECK (due_date >= start_date)
);

CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  task_id INT NULL,
  message VARCHAR(500) NOT NULL,
  type ENUM('task_assigned', 'task_due', 'task_completed') NOT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
);

CREATE TABLE task_attachments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task_id INT NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_size INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- Sample users (passwords: Admin@123 and Employee@123)
INSERT INTO users (full_name, email, password_hash, role) VALUES
('System Admin', 'admin@company.com', '$2a$10$bPDx3nwbRFszfo7OVr3SJOSYqb/qGVUxxZIVo9OPpr5ichzRWQzj6', 'admin'),
('John Employee', 'employee@company.com', '$2a$10$L985wikUjJhb6Y1j9dBdnetD2fP8yjd7yHAEY7EUGxhTrL0Kfxlnq', 'employee');

INSERT INTO employees (user_id, name, email, department, designation) VALUES
(2, 'John Employee', 'employee@company.com', 'Engineering', 'Software Developer'),
(NULL, 'Jane Smith', 'jane.smith@company.com', 'Marketing', 'Marketing Specialist'),
(NULL, 'Robert Johnson', 'robert.j@company.com', 'HR', 'HR Manager'),
(NULL, 'Emily Davis', 'emily.d@company.com', 'Finance', 'Accountant');

INSERT INTO tasks (title, description, priority, status, start_date, due_date, assigned_employee_id, created_by) VALUES
('Setup Development Environment', 'Install and configure all required tools', 'high', 'completed', '2025-01-01', '2025-01-05', 1, 1),
('Design Database Schema', 'Create ER diagram and SQL schema', 'high', 'completed', '2025-01-06', '2025-01-10', 1, 1),
('Implement Authentication', 'JWT login and registration', 'high', 'in_progress', '2025-01-11', '2025-01-20', 1, 1),
('Marketing Campaign Q1', 'Plan Q1 marketing campaign', 'medium', 'pending', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 7 DAY), 2, 1),
('Employee Onboarding Process', 'Review and update onboarding docs', 'low', 'pending', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 DAY), 3, 1),
('Monthly Financial Report', 'Prepare January financial report', 'high', 'pending', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 14 DAY), 4, 1);

INSERT INTO notifications (user_id, task_id, message, type, is_read) VALUES
(2, 3, 'You have been assigned a new task: Implement Authentication', 'task_assigned', 0),
(2, 5, 'Task "Employee Onboarding Process" is due within 1 day', 'task_due', 0);
