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

```text
employee-task-management-system
│
├── frontend
├── backend
├── database
└── README.md
```

---

# Setup

## 1. Clone the project

```bash
git clone <repository-url>
```

## 2. Database

Create a database named:

```text
employee_task_management
```

Import the SQL file:

```text
database/employee_task_management.sql
```

---

## 3. Backend Setup

Go to the backend folder.

```bash
cd backend
npm install
```

Create a `.env` file.

Example:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=employee_task_management

JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=8h
JWT_REMEMBER_EXPIRES_IN=7d
```

Run the backend:

```bash
npm run dev
```

Backend URL:

```text
http://localhost:3000
```

---

## 4. Frontend Setup

Go to the frontend folder.

```bash
cd frontend
npm install
ng serve
```

Frontend URL:

```text
http://localhost:4200
```

---

## API Endpoints

- Login
- Register
- Dashboard
- Employee CRUD
- Task CRUD
- Notifications
- Reports
- CSV Export
- Excel Export

---

## Notes

- Completed tasks cannot be edited.
- Employees can only view their own tasks.
- Admin can manage employees and tasks.
- Maximum upload size: **5 MB**
- Supported file types: **PDF, JPG, PNG**
