import { v4 as uuidv4 } from 'uuid';
import pool from '../config/db.js';

const createCollege = async (req, res) => {
  try {
    const { name, description, is_active } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'College name required' });
    }

    const id = uuidv4();
    const isActive = is_active !== undefined ? is_active : true;

    const result = await pool.query(
      'INSERT INTO colleges (id, name, description, is_active) VALUES ($1, $2, $3, $4) RETURNING id, name, description, is_active, created_at',
      [id, name, description || null, isActive]
    );

    res.status(201).json({
      message: 'College created successfully',
      college: result.rows[0]
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'College name already exists' });
    }
    res.status(500).json({ error: 'Failed to create college' });
  }
};

const getAllColleges = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM colleges ORDER BY created_at DESC');
    res.json({
      colleges: result.rows,
      count: result.rows.length
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch colleges' });
  }
};

const getCollegeById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM colleges WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'College not found' });
    }

    res.json({ college: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch college' });
  }
};

const updateCollege = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_active } = req.body;

    const result = await pool.query('SELECT * FROM colleges WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'College not found' });
    }

    const updatedName = name || result.rows[0].name;
    const updatedDescription = description !== undefined ? description : result.rows[0].description;
    const updatedIsActive = is_active !== undefined ? is_active : result.rows[0].is_active;

    const updateResult = await pool.query(
      'UPDATE colleges SET name = $1, description = $2, is_active = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING id, name, description, is_active, created_at, updated_at',
      [updatedName, updatedDescription, updatedIsActive, id]
    );

    res.json({
      message: 'College updated successfully',
      college: updateResult.rows[0]
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'College name already exists' });
    }
    res.status(500).json({ error: 'Failed to update college' });
  }
};

const deleteCollege = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM colleges WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'College not found' });
    }

    await pool.query('DELETE FROM colleges WHERE id = $1', [id]);

    res.json({ message: 'College deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete college' });
  }
};

export { createCollege, getAllColleges, getCollegeById, updateCollege, deleteCollege };
