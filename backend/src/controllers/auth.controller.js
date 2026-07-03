import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import { signToken } from '../utils/jwt.js';
import { validatePassword, validateEmail } from '../utils/validators.js';

const register = async (req, res, next) => {
  try {
    const { fullName, email, password, confirmPassword, role } = req.body;

    if (!fullName || !email || !password || !confirmPassword || !role) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    const emailError = validateEmail(email);
    if (emailError) {
      return res.status(400).json({ success: false, message: emailError });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ success: false, message: passwordError });
    }

    if (!['admin', 'employee'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be admin or employee.' });
    }

    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [userResult] = await connection.execute(
        'INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [fullName, email, passwordHash, role]
      );

      if (role === 'employee') {
        await connection.execute(
          'INSERT INTO employees (user_id, name, email, department, designation) VALUES (?, ?, ?, ?, ?)',
          [userResult.insertId, fullName, email, 'General', 'Employee']
        );
      }

      await connection.commit();

      res.status(201).json({
        success: true,
        message: 'Registration successful. Please login.'
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

const login = async (req, res, next) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const [users] = await pool.execute(
      'SELECT id, full_name, email, password_hash, role FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    let employeeId = null;
    if (user.role === 'employee') {
      const [employees] = await pool.execute(
        'SELECT id FROM employees WHERE user_id = ?',
        [user.id]
      );
      employeeId = employees.length > 0 ? employees[0].id : null;
    }

    const token = signToken(
      { id: user.id, email: user.email, role: user.role },
      rememberMe === true || rememberMe === 'true'
    );

    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        rememberMe: rememberMe === true || rememberMe === 'true',
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          role: user.role,
          employeeId
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export { register, login };
