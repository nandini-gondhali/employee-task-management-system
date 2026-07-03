# Employee Task Management System

A full-stack web application for managing employees and tasks with role-based access control, notifications, file uploads, and reporting.

## Features

- **Authentication**: Registration, login, logout, JWT auth, Remember Me (localStorage vs sessionStorage)
- **Dashboard**: Admin stats (employees, tasks) and employee stats (my tasks, overdue)
- **Employee Management** (Admin): CRUD, search, sort, pagination
- **Task Management**: CRUD with priority, status, dates, assignments, file attachments
- **Notifications**: Task assigned, due within 1 day, task completed
- **Reports**: Completed, pending, employee-wise with CSV and Excel export
- **File Upload**: PDF, JPG, PNG up to 5 MB

## Tech Stack

| Layer      | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | Angular 22, TypeScript, Bootstrap 5     |
| Backend   | Node.js, Express.js (ES Modules)        |
| Database  | MySQL                                   |
| Auth      | JWT, bcryptjs                           |
| Upload    | Multer                                  |
| Reports   | json2csv, ExcelJS                       |

## Folder Structure

```
employee-task-management-system/
├── backend/                 # Express API (ES Modules)
│   ├── server.js
│   ├── .env.example
│   ├── uploads/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── routes/
│       ├── services/
│       └── utils/
├── frontend/                # Angular app
│   └── src/app/
│       ├── components/
│       ├── guards/
│       ├── interceptors/
│       ├── models/
│       ├── pages/
│       └── services/
├── database/
│   └── employee_task_management.sql
├── diagrams/
│   └── architecture.md
└── README.md
```

---

## Prerequisites

Install these before running the project:

| Tool       | Version   | Check command        |
|-----------|-----------|----------------------|
| Node.js   | 18+       | `node --version`     |
| npm       | 9+        | `npm --version`      |
| MySQL     | 8.0+      | `mysql --version`    |

> **Windows tip:** If `mysql` is not recognized, add MySQL to your PATH or use MySQL Workbench to import the SQL file.

---

## Quick Start (Step-by-Step)

### Step 1 — Clone / open the project

```powershell
cd e:\workspace\employee-task-management-system
```

### Step 2 — Set up the database (one-time)

1. **Start MySQL** (Windows Services, XAMPP, WAMP, or MySQL Workbench).

2. **Import schema and sample data:**

**Windows (PowerShell):**
```powershell
Get-Content database\employee_task_management.sql | mysql -u root -p
```

**Linux / Mac:**
```bash
mysql -u root -p < database/employee_task_management.sql
```

**Alternative (MySQL Workbench):**
- Open MySQL Workbench → connect to local server
- File → Open SQL Script → select `database/employee_task_management.sql`
- Click Execute (⚡)

3. **Configure backend environment:**

```powershell
cd backend
copy .env.example .env
```

Edit `backend/.env` and set your MySQL password:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=employee_task_management
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=8h
JWT_REMEMBER_EXPIRES_IN=7d
UPLOAD_MAX_SIZE=5242880
```

> Leave `DB_PASSWORD` empty only if your MySQL root user has no password.

### Step 3 — Install and start the backend

Open **Terminal 1**:

```powershell
cd e:\workspace\employee-task-management-system\backend
npm install
npm start
```

Expected output:
```
Server running on http://localhost:3000
```

Verify the API is running — open in browser or run:

```powershell
curl http://localhost:3000/api/health
```

Expected response:
```json
{ "success": true, "message": "Employee Task Management API is running." }
```

**Development mode** (auto-restart on file changes):

```powershell
npm run dev
```

### Step 4 — Install and start the frontend

Open **Terminal 2**:

```powershell
cd e:\workspace\employee-task-management-system\frontend
npm install
npm start
```

Expected output:
```
Application bundle generation complete.
➜  Local:   http://localhost:4200/
```

### Step 5 — Open the app and log in

1. Open **http://localhost:4200** in your browser
2. Log in with sample credentials (see below)
3. Explore Dashboard, Tasks, Reports, and (Admin only) Employees

---

## Daily Run (After First Setup)

Once the database is imported and `.env` is configured, you only need **two terminals**:

**Terminal 1 — Backend:**
```powershell
cd e:\workspace\employee-task-management-system\backend
npm start
```

**Terminal 2 — Frontend:**
```powershell
cd e:\workspace\employee-task-management-system\frontend
npm start
```

Then open **http://localhost:4200**

---

## Application URLs

| Service   | URL                              |
|-----------|----------------------------------|
| Frontend  | http://localhost:4200            |
| Backend   | http://localhost:3000            |
| Health    | http://localhost:3000/api/health |
| Uploads   | http://localhost:3000/uploads/   |

The frontend connects to the backend via `frontend/src/environments/environment.ts`:

```typescript
apiUrl: 'http://localhost:3000/api'
```

Change this only if you run the backend on a different port or host.

---

## Sample Login Credentials

| Role     | Email                  | Password     |
|----------|------------------------|--------------|
| Admin    | admin@company.com      | Admin@123    |
| Employee | employee@company.com   | Employee@123 |

Admin-created employees receive default password: **Employee@123**

---

## Environment Variables

| Variable                | Description               | Default                    |
|-------------------------|---------------------------|----------------------------|
| PORT                    | API server port           | 3000                       |
| DB_HOST                 | MySQL host                | localhost                  |
| DB_USER                 | MySQL user                | root                       |
| DB_PASSWORD             | MySQL password            | (empty)                    |
| DB_NAME                 | Database name             | employee_task_management   |
| JWT_SECRET              | JWT signing secret        | (required)                 |
| JWT_EXPIRES_IN          | Session token expiry      | 8h                         |
| JWT_REMEMBER_EXPIRES_IN | Remember Me token expiry  | 7d                         |
| UPLOAD_MAX_SIZE         | Max upload size in bytes  | 5242880 (5 MB)             |

Copy from template:

```powershell
cd backend
copy .env.example .env
```

---

## Backend Notes (ES Modules)

The backend uses **ES Modules** (`"type": "module"` in `backend/package.json`):

- Uses `import` / `export` instead of `require` / `module.exports`
- Local imports include `.js` extensions
- Entry point: `backend/server.js`

---

## API Endpoints

| Method | Endpoint                      | Access | Description              |
|--------|-------------------------------|--------|--------------------------|
| GET    | /api/health                   | Public | Health check             |
| POST   | /api/auth/register            | Public | Register user            |
| POST   | /api/auth/login               | Public | Login                    |
| GET    | /api/dashboard                | Auth   | Dashboard stats          |
| GET    | /api/employees                | Admin  | List employees           |
| POST   | /api/employees                | Admin  | Create employee          |
| PUT    | /api/employees/:id            | Admin  | Update employee          |
| DELETE | /api/employees/:id            | Admin  | Delete employee          |
| GET    | /api/tasks                    | Auth   | List tasks               |
| POST   | /api/tasks                    | Auth   | Create task              |
| PUT    | /api/tasks/:id                | Auth   | Update task              |
| DELETE | /api/tasks/:id                | Auth   | Delete task              |
| GET    | /api/notifications            | Auth   | Get notifications        |
| PUT    | /api/notifications/read-all   | Auth   | Mark all as read         |
| PUT    | /api/notifications/:id/read   | Auth   | Mark one as read         |
| GET    | /api/reports/completed        | Auth   | Completed tasks report   |
| GET    | /api/reports/pending          | Auth   | Pending tasks report     |
| GET    | /api/reports/employee-wise    | Auth   | Employee-wise report     |
| GET    | /api/reports/export/csv       | Auth   | Export CSV               |
| GET    | /api/reports/export/excel     | Auth   | Export Excel             |

---

## Troubleshooting

### Backend: "Failed to connect to database"

- Ensure MySQL is running
- Verify `DB_USER`, `DB_PASSWORD`, and `DB_NAME` in `backend/.env`
- Confirm the database was imported:
  ```sql
  SHOW DATABASES;
  USE employee_task_management;
  SHOW TABLES;
  ```

### Frontend cannot reach API / login fails

- Confirm backend is running at http://localhost:3000
- Check http://localhost:3000/api/health in the browser
- Ensure `apiUrl` in `frontend/src/environments/environment.ts` is `http://localhost:3000/api`

### Port already in use

**Backend (3000):**
```powershell
netstat -ano | findstr :3000
taskkill /PID <pid> /F
```

**Frontend (4200):**
```powershell
ng serve --port 4201
```
Then open http://localhost:4201

### `mysql` command not found (Windows)

- Install [MySQL Community Server](https://dev.mysql.com/downloads/mysql/) or use XAMPP/WAMP
- Or import `database/employee_task_management.sql` via MySQL Workbench

### npm install errors

```powershell
node --version   # must be 18+
npm cache clean --force
npm install
```

---

## Build for Production

**Frontend:**
```powershell
cd frontend
npm run build
```
Output: `frontend/dist/frontend/`

**Backend:**
```powershell
cd backend
npm start
```
Set production values in `.env` (strong `JWT_SECRET`, real DB credentials).

---

## Architecture

See [diagrams/architecture.md](diagrams/architecture.md) for Mermaid diagrams covering system architecture, JWT flow, and RBAC.

---

## License

MIT
