import pool from '../config/db.js';
import { validateTaskDates } from '../utils/validators.js';
import { notifyTaskAssigned, notifyTaskCompleted } from '../services/notification.service.js';

const getTasks = async (req, res, next) => {
  try {
    let query = `
      SELECT t.*, e.name AS assigned_employee_name, e.email AS assigned_employee_email,
             u.full_name AS created_by_name
      FROM tasks t
      JOIN employees e ON t.assigned_employee_id = e.id
      JOIN users u ON t.created_by = u.id
    `;
    const params = [];

    if (req.user.role === 'employee') {
      if (!req.user.employeeId) {
        return res.json({ success: true, data: [] });
      }
      query += ' WHERE t.assigned_employee_id = ?';
      params.push(req.user.employeeId);
    }

    query += ' ORDER BY t.created_at DESC';

    const [tasks] = await pool.execute(query, params);

    const taskIds = tasks.map((t) => t.id);
    let attachments = [];
    if (taskIds.length > 0) {
      const placeholders = taskIds.map(() => '?').join(',');
      [attachments] = await pool.execute(
        `SELECT id, task_id, file_path, original_name, file_size FROM task_attachments WHERE task_id IN (${placeholders})`,
        taskIds
      );
    }

    const tasksWithAttachments = tasks.map((task) => ({
      ...task,
      attachments: attachments.filter((a) => a.task_id === task.id)
    }));

    res.json({ success: true, data: tasksWithAttachments });
  } catch (error) {
    next(error);
  }
};

const createTask = async (req, res, next) => {
  try {
    const { title, description, priority, status, startDate, dueDate, assignedEmployeeId } = req.body;

    if (!title || !startDate || !dueDate || !assignedEmployeeId) {
      return res.status(400).json({ success: false, message: 'Title, dates, and assigned employee are required.' });
    }

    const dateError = validateTaskDates(startDate, dueDate);
    if (dateError) {
      return res.status(400).json({ success: false, message: dateError });
    }

    const [employee] = await pool.execute('SELECT id FROM employees WHERE id = ?', [assignedEmployeeId]);
    if (employee.length === 0) {
      return res.status(404).json({ success: false, message: 'Assigned employee not found.' });
    }

    const taskStatus = status || 'pending';
    const completedAt = taskStatus === 'completed' ? new Date() : null;

    const [result] = await pool.execute(
      `INSERT INTO tasks (title, description, priority, status, start_date, due_date, assigned_employee_id, created_by, completed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description || '',
        priority || 'medium',
        taskStatus,
        startDate,
        dueDate,
        assignedEmployeeId,
        req.user.id,
        completedAt
      ]
    );

    const taskId = result.insertId;

    if (req.file) {
      await pool.execute(
        'INSERT INTO task_attachments (task_id, file_path, original_name, file_size) VALUES (?, ?, ?, ?)',
        [taskId, `/uploads/${req.file.filename}`, req.file.originalname, req.file.size]
      );
    }

    await notifyTaskAssigned(taskId, assignedEmployeeId, title);

    if (taskStatus === 'completed') {
      await notifyTaskCompleted(taskId, title, req.user.id);
    }

    res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      data: { id: taskId }
    });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, priority, status, startDate, dueDate, assignedEmployeeId } = req.body;

    const [existing] = await pool.execute('SELECT * FROM tasks WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const task = existing[0];

    if (task.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Completed tasks cannot be edited.' });
    }

    if (req.user.role === 'employee') {
      if (task.assigned_employee_id !== req.user.employeeId) {
        return res.status(403).json({ success: false, message: 'You can only update your own tasks.' });
      }
    }

    const dateError = validateTaskDates(startDate || task.start_date, dueDate || task.due_date);
    if (dateError) {
      return res.status(400).json({ success: false, message: dateError });
    }

    const newStatus = status || task.status;
    const wasCompleted = task.status === 'completed';
    const isNowCompleted = newStatus === 'completed';
    const completedAt = isNowCompleted && !wasCompleted ? new Date() : task.completed_at;

    const previousAssignee = task.assigned_employee_id;
    const newAssignee = assignedEmployeeId || task.assigned_employee_id;

    await pool.execute(
      `UPDATE tasks SET title = ?, description = ?, priority = ?, status = ?, start_date = ?,
       due_date = ?, assigned_employee_id = ?, completed_at = ? WHERE id = ?`,
      [
        title || task.title,
        description !== undefined ? description : task.description,
        priority || task.priority,
        newStatus,
        startDate || task.start_date,
        dueDate || task.due_date,
        newAssignee,
        completedAt,
        id
      ]
    );

    if (req.file) {
      await pool.execute(
        'INSERT INTO task_attachments (task_id, file_path, original_name, file_size) VALUES (?, ?, ?, ?)',
        [id, `/uploads/${req.file.filename}`, req.file.originalname, req.file.size]
      );
    }

    if (newAssignee !== previousAssignee) {
      await notifyTaskAssigned(parseInt(id, 10), newAssignee, title || task.title);
    }

    if (isNowCompleted && !wasCompleted) {
      await notifyTaskCompleted(parseInt(id, 10), title || task.title, task.created_by);
    }

    res.json({ success: true, message: 'Task updated successfully.' });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.execute('SELECT * FROM tasks WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    if (req.user.role === 'employee' && existing[0].assigned_employee_id !== req.user.employeeId) {
      return res.status(403).json({ success: false, message: 'You can only delete your own tasks.' });
    }

    await pool.execute('DELETE FROM tasks WHERE id = ?', [id]);

    res.json({ success: true, message: 'Task deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

export { getTasks, createTask, updateTask, deleteTask };
