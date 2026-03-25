import { v4 as uuidv4 } from 'uuid';
import pool from '../config/db.js';

const createBatch = async (req, res) => {
  try {
    const { name, description, college_id, is_active } = req.body;

    if (!name || !college_id) {
      return res.status(400).json({ error: 'Batch name and college_id required' });
    }

    // Validate college exists
    const collegeResult = await pool.query('SELECT id FROM colleges WHERE id = $1', [college_id]);
    if (collegeResult.rows.length === 0) {
      return res.status(400).json({ error: 'College not found' });
    }

    const id = uuidv4();
    const isActive = is_active !== undefined ? is_active : true;

    const result = await pool.query(
      'INSERT INTO batches (id, name, description, college_id, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, description, college_id, is_active, created_at',
      [id, name, description || null, college_id, isActive]
    );

    res.status(201).json({
      message: 'Batch created successfully',
      batch: result.rows[0]
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Batch name already exists in this college' });
    }
    res.status(500).json({ error: 'Failed to create batch' });
  }
};

const getAllBatches = async (req, res) => {
  try {
    const { college_id } = req.query;
    let query = 'SELECT id, name, description, college_id, is_active, created_at, updated_at FROM batches WHERE 1=1';
    const params = [];

    if (college_id) {
      query += ' AND college_id = $' + (params.length + 1);
      params.push(college_id);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json({
      batches: result.rows,
      count: result.rows.length,
      filters: { college_id: college_id || null }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch batches' });
  }
};

const getBatchById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, name, description, college_id, is_active, created_at, updated_at FROM batches WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    res.json({ batch: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch batch' });
  }
};

const getBatchesByCollege = async (req, res) => {
  try {
    const { college_id } = req.params;

    // Validate college exists
    const collegeResult = await pool.query('SELECT id FROM colleges WHERE id = $1', [college_id]);
    if (collegeResult.rows.length === 0) {
      return res.status(404).json({ error: 'College not found' });
    }

    const result = await pool.query(
      'SELECT id, name, description, college_id, is_active, created_at, updated_at FROM batches WHERE college_id = $1 ORDER BY created_at DESC',
      [college_id]
    );

    res.json({
      batches: result.rows,
      count: result.rows.length,
      college_id
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch batches' });
  }
};

const updateBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, college_id, is_active } = req.body;

    const result = await pool.query('SELECT * FROM batches WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    const batch = result.rows[0];

    // Validate college if provided
    if (college_id && college_id !== batch.college_id) {
      const collegeResult = await pool.query('SELECT id FROM colleges WHERE id = $1', [college_id]);
      if (collegeResult.rows.length === 0) {
        return res.status(400).json({ error: 'College not found' });
      }
    }

    const updatedName = name || batch.name;
    const updatedDescription = description !== undefined ? description : batch.description;
    const updatedCollegeId = college_id || batch.college_id;
    const updatedIsActive = is_active !== undefined ? is_active : batch.is_active;

    const updateResult = await pool.query(
      'UPDATE batches SET name = $1, description = $2, college_id = $3, is_active = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING id, name, description, college_id, is_active, created_at, updated_at',
      [updatedName, updatedDescription, updatedCollegeId, updatedIsActive, id]
    );

    res.json({
      message: 'Batch updated successfully',
      batch: updateResult.rows[0]
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Batch name already exists in this college' });
    }
    res.status(500).json({ error: 'Failed to update batch' });
  }
};

const deleteBatch = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM batches WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    await pool.query('DELETE FROM batches WHERE id = $1', [id]);

    res.json({ message: 'Batch deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete batch' });
  }
};

export { createBatch, getAllBatches, getBatchById, getBatchesByCollege, updateBatch, deleteBatch };
