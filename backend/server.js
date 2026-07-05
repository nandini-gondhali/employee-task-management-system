import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import authRoutes from './src/routes/auth.routes.js';
import dashboardRoutes from './src/routes/dashboard.routes.js';
import employeeRoutes from './src/routes/employees.routes.js';
import taskRoutes from './src/routes/tasks.routes.js';
import reportRoutes from './src/routes/reports.routes.js';
import notificationRoutes from './src/routes/notifications.routes.js';
import errorHandler from './src/middleware/errorHandler.js';
import pool from './src/config/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/testing', (req, res) => {
  res.json({ success: true, message: 'Employee Task Management API is running.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

app.use(errorHandler);

const startServer = async () => {
  try {
    await pool.query('SELECT 1');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to database:', error.message);
    console.error('Please ensure MySQL is running and the database is set up.');
    process.exit(1);
  }
};

startServer();
