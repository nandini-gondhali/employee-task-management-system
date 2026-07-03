import pool from '../config/db.js';
import { Parser } from 'json2csv';
import ExcelJS from 'exceljs';

const buildTaskQuery = (statusFilter, user) => {
  let query = `
    SELECT t.id, t.title, t.description, t.priority, t.status, t.start_date, t.due_date,
           t.completed_at, e.name AS employee_name, e.email AS employee_email,
           e.department, e.designation
    FROM tasks t
    JOIN employees e ON t.assigned_employee_id = e.id
  `;
  const params = [];
  const conditions = [];

  if (statusFilter === 'completed') {
    conditions.push("t.status = 'completed'");
  } else if (statusFilter === 'pending') {
    conditions.push("t.status != 'completed'");
  }

  if (user.role === 'employee' && user.employeeId) {
    conditions.push('t.assigned_employee_id = ?');
    params.push(user.employeeId);
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }

  query += ' ORDER BY t.due_date ASC';
  return { query, params };
};

const getCompletedReport = async (req, res, next) => {
  try {
    const { query, params } = buildTaskQuery('completed', req.user);
    const [tasks] = await pool.execute(query, params);
    res.json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
};

const getPendingReport = async (req, res, next) => {
  try {
    const { query, params } = buildTaskQuery('pending', req.user);
    const [tasks] = await pool.execute(query, params);
    res.json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
};

const getEmployeeWiseReport = async (req, res, next) => {
  try {
    let query = `
      SELECT e.id AS employee_id, e.name AS employee_name, e.email, e.department, e.designation,
             COUNT(t.id) AS total_tasks,
             SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) AS completed_tasks,
             SUM(CASE WHEN t.status != 'completed' THEN 1 ELSE 0 END) AS pending_tasks,
             SUM(CASE WHEN t.status != 'completed' AND t.due_date < CURDATE() THEN 1 ELSE 0 END) AS overdue_tasks
      FROM employees e
      LEFT JOIN tasks t ON e.id = t.assigned_employee_id
    `;
    const params = [];

    if (req.user.role === 'employee' && req.user.employeeId) {
      query += ' WHERE e.id = ?';
      params.push(req.user.employeeId);
    }

    query += ' GROUP BY e.id, e.name, e.email, e.department, e.designation ORDER BY e.name ASC';

    const [report] = await pool.execute(query, params);
    res.json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

const formatTasksForExport = (tasks) =>
  tasks.map((t) => ({
    ID: t.id,
    Title: t.title,
    Description: t.description,
    Priority: t.priority,
    Status: t.status,
    'Start Date': t.start_date,
    'Due Date': t.due_date,
    'Completed At': t.completed_at || '',
    Employee: t.employee_name,
    Email: t.employee_email,
    Department: t.department,
    Designation: t.designation
  }));

const exportCsv = async (req, res, next) => {
  try {
    const reportType = req.query.type || 'completed';
    const { query, params } = buildTaskQuery(reportType, req.user);
    const [tasks] = await pool.execute(query, params);
    const data = formatTasksForExport(tasks);

    if (data.length === 0) {
      data.push({
        ID: '', Title: '', Description: '', Priority: '', Status: '',
        'Start Date': '', 'Due Date': '', 'Completed At': '',
        Employee: '', Email: '', Department: '', Designation: ''
      });
    }

    const parser = new Parser();
    const csv = parser.parse(data);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${reportType}-tasks-report.csv"`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

const exportExcel = async (req, res, next) => {
  try {
    const reportType = req.query.type || 'completed';
    const { query, params } = buildTaskQuery(reportType, req.user);
    const [tasks] = await pool.execute(query, params);
    const data = formatTasksForExport(tasks);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`${reportType} Tasks`);

    if (data.length > 0) {
      worksheet.columns = Object.keys(data[0]).map((key) => ({ header: key, key, width: 20 }));
      data.forEach((row) => worksheet.addRow(row));
    } else {
      worksheet.addRow(['No data available']);
    }

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${reportType}-tasks-report.xlsx"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};

export {
  getCompletedReport,
  getPendingReport,
  getEmployeeWiseReport,
  exportCsv,
  exportExcel
};
