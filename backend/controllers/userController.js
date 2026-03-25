import pool from '../config/db.js';
import bcrypt from 'bcrypt';

const getAllUsers = async (req, res) => {
  try {
    const { role, college_id } = req.query;
    let query = 'SELECT id, name, email, role, college_id, created_at, updated_at FROM users WHERE 1=1';
    const params = [];

    if (role) {
      query += ' AND role = $' + (params.length + 1);
      params.push(role);
    }

    if (college_id) {
      query += ' AND college_id = $' + (params.length + 1);
      params.push(college_id);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json({
      users: result.rows,
      count: result.rows.length,
      filters: { role: role || null, college_id: college_id || null }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

const getStudents = async (req, res) => {
  try {
    const { college_id } = req.query;
    let query = 'SELECT id, name, email, role, college_id, created_at, updated_at FROM users WHERE role = $1';
    const params = ['students'];

    if (college_id) {
      query += ' AND college_id = $' + (params.length + 1);
      params.push(college_id);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json({
      students: result.rows,
      count: result.rows.length,
      filters: { college_id: college_id || null }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};

const getTrainers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, college_id, created_at, updated_at FROM users WHERE role = $1 ORDER BY created_at DESC',
      ['trainer']
    );
    res.json({
      trainers: result.rows,
      count: result.rows.length
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch trainers' });
  }
};

const getCollegeAdmins = async (req, res) => {
  try {
    const { college_id } = req.query;
    let query = 'SELECT id, name, email, role, college_id, created_at, updated_at FROM users WHERE role = $1';
    const params = ['college-admin'];

    if (college_id) {
      query += ' AND college_id = $' + (params.length + 1);
      params.push(college_id);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json({
      collegeAdmins: result.rows,
      count: result.rows.length,
      filters: { college_id: college_id || null }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch college admins' });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body;

    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    const updatedName = name || user.name;
    const updatedEmail = email || user.email;
    const updatedRole = role || user.role;
    let updatedPassword = user.password;

    if (password) {
      updatedPassword = await bcrypt.hash(password, 10);
    }

    const updateResult = await pool.query(
      'UPDATE users SET name = $1, email = $2, password = $3, role = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING id, name, email, role, created_at, updated_at',
      [updatedName, updatedEmail, updatedPassword, updatedRole, id]
    );

    res.json({
      message: 'User updated successfully',
      user: updateResult.rows[0]
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Failed to update user' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deleting superadmin
    if (result.rows[0].role === 'superadmin') {
      return res.status(403).json({ error: 'Cannot delete superadmin' });
    }

    await pool.query('DELETE FROM users WHERE id = $1', [id]);

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

export { getAllUsers, getUserById, updateUser, deleteUser, getStudents, getTrainers, getCollegeAdmins };
