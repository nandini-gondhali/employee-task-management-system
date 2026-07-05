# Employee Task Management System

This project is a full-stack Employee Task Management System. It allows an admin to manage employees, assign tasks, track task status, view notifications, and generate reports. Employees can log in and view the tasks assigned to them.

## Tech Stack

- Frontend: Angular 22
- Backend: Node.js + Express.js
- Database: MySQL
- Authentication: JWT
- File Upload: Multer
- Reports: CSV & Excel Export

## Features

- User Registration & Login
- JWT Authentication
- Remember Me
- Dashboard
- Employee Management (Admin)
- Task Management
- Notifications
- File Upload
- Reports
- CSV & Excel Export

## Project Structure

employee-task-management-system
│
├── frontend
├── backend
├── database
└── README.md

## Setup

### 1. Clone the project

git clone <repository-url>


### 2. Database

Create a database named:

employee_task_management


Import the SQL file:

database/employee_task_management.sql


### 3. Backend

Go to backend folder.

cd backend
npm install

Create a `.env` file.

Example:

PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=employee_task_management

JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=8h
JWT_REMEMBER_EXPIRES_IN=7d


Run backend

npm run dev


Backend runs on

http://localhost:3000

---

### 4. Frontend

cd frontend
npm install
ng serve

Application runs on

http://localhost:4200

---

## API

Main APIs used:

- Login
- Register
- Dashboard
- Employees CRUD
- Tasks CRUD
- Notifications
- Reports
- CSV Export
- Excel Export

---

## Notes

- Completed tasks cannot be edited.
- Employees can only view their own tasks.
- Admin can manage employees and tasks.
- Maximum upload size is 5 MB.
- Supported files: PDF, JPG and PNG.
