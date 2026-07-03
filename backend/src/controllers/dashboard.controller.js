import pool from '../config/db.js';
import { checkDueSoonTasks } from '../services/notification.service.js';

const getDashboard = async (req, res, next) => {
  try {
    await checkDueSoonTasks();

    if (req.user.role === 'admin') {
      const [[employeeCount]] = await pool.execute('SELECT COUNT(*) AS total FROM employees');
      const [[taskCount]] = await pool.execute('SELECT COUNT(*) AS total FROM tasks');
      const [[completedCount]] = await pool.execute(
        "SELECT COUNT(*) AS total FROM tasks WHERE status = 'completed'"
      );
      const [[pendingCount]] = await pool.execute(
        "SELECT COUNT(*) AS total FROM tasks WHERE status != 'completed'"
      );

      return res.json({
        success: true,
        data: {
          role: 'admin',
          totalEmployees: employeeCount.total,
          totalTasks: taskCount.total,
          completedTasks: completedCount.total,
          pendingTasks: pendingCount.total
        }
      });
    }

    const employeeId = req.user.employeeId;
    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'Employee profile not found.' });
    }

    const [[myTasks]] = await pool.execute(
      'SELECT COUNT(*) AS total FROM tasks WHERE assigned_employee_id = ?',
      [employeeId]
    );
    const [[completedTasks]] = await pool.execute(
      "SELECT COUNT(*) AS total FROM tasks WHERE assigned_employee_id = ? AND status = 'completed'",
      [employeeId]
    );
    const [[pendingTasks]] = await pool.execute(
      "SELECT COUNT(*) AS total FROM tasks WHERE assigned_employee_id = ? AND status != 'completed'",
      [employeeId]
    );
    const [[overdueTasks]] = await pool.execute(
      `SELECT COUNT(*) AS total FROM tasks
       WHERE assigned_employee_id = ? AND status != 'completed' AND due_date < CURDATE()`,
      [employeeId]
    );

    res.json({
      success: true,
      data: {
        role: 'employee',
        myTasks: myTasks.total,
        completedTasks: completedTasks.total,
        pendingTasks: pendingTasks.total,
        overdueTasks: overdueTasks.total
      }
    });
  } catch (error) {
    next(error);
  }
};

export { getDashboard };
