import pool from '../config/db.js';

const createNotification = async (userId, taskId, message, type) => {
  await pool.execute(
    'INSERT INTO notifications (user_id, task_id, message, type) VALUES (?, ?, ?, ?)',
    [userId, taskId, message, type]
  );
};

export const notifyTaskAssigned = async (taskId, employeeId, title) => {
  const [rows] = await pool.execute(
    'SELECT user_id FROM employees WHERE id = ? AND user_id IS NOT NULL',
    [employeeId]
  );
  if (rows.length > 0 && rows[0].user_id) {
    await createNotification(
      rows[0].user_id,
      taskId,
      `You have been assigned a new task: ${title}`,
      'task_assigned'
    );
  }
};

export const notifyTaskCompleted = async (taskId, title, createdBy) => {
  await createNotification(
    createdBy,
    taskId,
    `Task "${title}" has been marked as completed`,
    'task_completed'
  );

  const [taskRows] = await pool.execute(
    'SELECT assigned_employee_id FROM tasks WHERE id = ?',
    [taskId]
  );
  if (taskRows.length > 0) {
    const [empRows] = await pool.execute(
      'SELECT user_id FROM employees WHERE id = ? AND user_id IS NOT NULL',
      [taskRows[0].assigned_employee_id]
    );
    if (empRows.length > 0 && empRows[0].user_id) {
      await createNotification(
        empRows[0].user_id,
        taskId,
        `Your task "${title}" has been marked as completed`,
        'task_completed'
      );
    }
  }
};

export const checkDueSoonTasks = async () => {
  const [tasks] = await pool.execute(`
    SELECT t.id, t.title, t.due_date, e.user_id
    FROM tasks t
    JOIN employees e ON t.assigned_employee_id = e.id
    WHERE t.status != 'completed'
      AND e.user_id IS NOT NULL
      AND t.due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 1 DAY)
  `);

  for (const task of tasks) {
    const [existing] = await pool.execute(
      `SELECT id FROM notifications
       WHERE user_id = ? AND task_id = ? AND type = 'task_due'
       AND DATE(created_at) = CURDATE()`,
      [task.user_id, task.id]
    );
    if (existing.length === 0) {
      await createNotification(
        task.user_id,
        task.id,
        `Task "${task.title}" is due within 1 day`,
        'task_due'
      );
    }
  }
};

export { createNotification };
