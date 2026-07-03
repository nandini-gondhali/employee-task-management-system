import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import { validateEmail } from '../utils/validators.js';

const DEFAULT_EMPLOYEE_PASSWORD = 'Employee@123';

const getEmployees = async (req, res, next) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, Number.parseInt(req.query.limit, 10) || 10));
    const offset = (page - 1) * limit;

    const search = req.query.search?.trim() || '';

    const allowedSortFields = ['name', 'email', 'department', 'designation', 'created_at'];
    const sortBy = allowedSortFields.includes(req.query.sortBy)
      ? req.query.sortBy
      : 'name';

    const sortOrder = req.query.sortOrder === 'desc' ? 'DESC' : 'ASC';

    let whereClause = '';
    const params = [];

    if (search) {
      whereClause = `
        WHERE name LIKE ?
        OR email LIKE ?
        OR department LIKE ?
        OR designation LIKE ?
      `;

      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    const [countResult] = await pool.execute(
      `SELECT COUNT(*) AS total FROM employees ${whereClause}`,
      params
    );

    const [employees] = await pool.execute(
      `SELECT id, user_id, name, email, department, designation, created_at
       FROM employees
       ${whereClause}
       ORDER BY ${sortBy} ${sortOrder}
       LIMIT ${limit} OFFSET ${offset}`,
      params
    );

    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        employees,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const createEmployee = async (req, res, next) => {
  try {
    const { name, email, department, designation } = req.body;

    if (!name || !email || !department || !designation) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const emailError = validateEmail(email);
    if (emailError) {
      return res.status(400).json({ success: false, message: emailError });
    }

    const [existingUser] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    const [existingEmp] = await pool.execute('SELECT id FROM employees WHERE email = ?', [email]);

    if (existingUser.length > 0 || existingEmp.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already exists.' });
    }

    const passwordHash = await bcrypt.hash(DEFAULT_EMPLOYEE_PASSWORD, 10);
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [userResult] = await connection.execute(
        'INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [name, email, passwordHash, 'employee']
      );

      const [empResult] = await connection.execute(
        'INSERT INTO employees (user_id, name, email, department, designation) VALUES (?, ?, ?, ?, ?)',
        [userResult.insertId, name, email, department, designation]
      );

      await connection.commit();

      res.status(201).json({
        success: true,
        message: `Employee created. Default password: ${DEFAULT_EMPLOYEE_PASSWORD}`,
        data: { id: empResult.insertId, name, email, department, designation }
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (error) {
    next(error);
  }
};

const updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, department, designation } = req.body;

    if (!name || !email || !department || !designation) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const emailError = validateEmail(email);
    if (emailError) {
      return res.status(400).json({ success: false, message: emailError });
    }

    const [existing] = await pool.execute('SELECT * FROM employees WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    const [emailConflict] = await pool.execute(
      'SELECT id FROM employees WHERE email = ? AND id != ?',
      [email, id]
    );
    if (emailConflict.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already in use.' });
    }

    const employee = existing[0];
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      await connection.execute(
        'UPDATE employees SET name = ?, email = ?, department = ?, designation = ? WHERE id = ?',
        [name, email, department, designation, id]
      );

      if (employee.user_id) {
        await connection.execute(
          'UPDATE users SET full_name = ?, email = ? WHERE id = ?',
          [name, email, employee.user_id]
        );
      }

      await connection.commit();

      res.json({
        success: true,
        message: 'Employee updated successfully.',
        data: { id: parseInt(id, 10), name, email, department, designation }
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (error) {
    next(error);
  }
};

const deleteEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.execute('SELECT user_id FROM employees WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    const userId = existing[0].user_id;
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();
      await connection.execute('DELETE FROM employees WHERE id = ?', [id]);
      if (userId) {
        await connection.execute('DELETE FROM users WHERE id = ?', [userId]);
      }
      await connection.commit();

      res.json({ success: true, message: 'Employee deleted successfully.' });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (error) {
    next(error);
  }
};

export {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee
};
