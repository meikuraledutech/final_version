import { v4 as uuidv4 } from 'uuid';
import pool from '../config/db.js';

// ===== BATCH STUDENTS =====

const addStudentToBatch = async (req, res) => {
  try {
    const { batch_id, student_id } = req.body;

    if (!batch_id || !student_id) {
      return res.status(400).json({ error: 'batch_id and student_id required' });
    }

    // Validate batch exists
    const batchResult = await pool.query('SELECT id FROM batches WHERE id = $1', [batch_id]);
    if (batchResult.rows.length === 0) {
      return res.status(400).json({ error: 'Batch not found' });
    }

    // Validate student exists and is a student
    const studentResult = await pool.query(
      'SELECT id, role FROM users WHERE id = $1 AND role = $2',
      [student_id, 'students']
    );
    if (studentResult.rows.length === 0) {
      return res.status(400).json({ error: 'Student not found' });
    }

    const id = uuidv4();

    const result = await pool.query(
      'INSERT INTO batch_students (id, batch_id, student_id) VALUES ($1, $2, $3) RETURNING id, batch_id, student_id, created_at',
      [id, batch_id, student_id]
    );

    res.status(201).json({
      message: 'Student added to batch successfully',
      batchStudent: result.rows[0]
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Student already in batch' });
    }
    res.status(500).json({ error: 'Failed to add student to batch' });
  }
};

const getStudentsByBatch = async (req, res) => {
  try {
    const { batch_id } = req.params;

    // Validate batch exists
    const batchResult = await pool.query('SELECT id FROM batches WHERE id = $1', [batch_id]);
    if (batchResult.rows.length === 0) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.college_id, bs.created_at
       FROM batch_students bs
       JOIN users u ON bs.student_id = u.id
       WHERE bs.batch_id = $1
       ORDER BY bs.created_at DESC`,
      [batch_id]
    );

    res.json({
      students: result.rows,
      count: result.rows.length,
      batch_id
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};

const removeStudentFromBatch = async (req, res) => {
  try {
    const { batch_id, student_id } = req.params;

    const result = await pool.query(
      'SELECT id FROM batch_students WHERE batch_id = $1 AND student_id = $2',
      [batch_id, student_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not in batch' });
    }

    await pool.query(
      'DELETE FROM batch_students WHERE batch_id = $1 AND student_id = $2',
      [batch_id, student_id]
    );

    res.json({ message: 'Student removed from batch successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove student from batch' });
  }
};

// ===== BATCH TRAINERS =====

const addTrainerToBatch = async (req, res) => {
  try {
    const { batch_id, trainer_id } = req.body;

    if (!batch_id || !trainer_id) {
      return res.status(400).json({ error: 'batch_id and trainer_id required' });
    }

    // Validate batch exists
    const batchResult = await pool.query('SELECT id FROM batches WHERE id = $1', [batch_id]);
    if (batchResult.rows.length === 0) {
      return res.status(400).json({ error: 'Batch not found' });
    }

    // Validate trainer exists and is a trainer
    const trainerResult = await pool.query(
      'SELECT id, role FROM users WHERE id = $1 AND role = $2',
      [trainer_id, 'trainer']
    );
    if (trainerResult.rows.length === 0) {
      return res.status(400).json({ error: 'Trainer not found' });
    }

    const id = uuidv4();

    const result = await pool.query(
      'INSERT INTO batch_trainers (id, batch_id, trainer_id) VALUES ($1, $2, $3) RETURNING id, batch_id, trainer_id, created_at',
      [id, batch_id, trainer_id]
    );

    res.status(201).json({
      message: 'Trainer added to batch successfully',
      batchTrainer: result.rows[0]
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Trainer already in batch' });
    }
    res.status(500).json({ error: 'Failed to add trainer to batch' });
  }
};

const getTrainersByBatch = async (req, res) => {
  try {
    const { batch_id } = req.params;

    // Validate batch exists
    const batchResult = await pool.query('SELECT id FROM batches WHERE id = $1', [batch_id]);
    if (batchResult.rows.length === 0) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.college_id, bt.created_at
       FROM batch_trainers bt
       JOIN users u ON bt.trainer_id = u.id
       WHERE bt.batch_id = $1
       ORDER BY bt.created_at DESC`,
      [batch_id]
    );

    res.json({
      trainers: result.rows,
      count: result.rows.length,
      batch_id
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch trainers' });
  }
};

const removeTrainerFromBatch = async (req, res) => {
  try {
    const { batch_id, trainer_id } = req.params;

    const result = await pool.query(
      'SELECT id FROM batch_trainers WHERE batch_id = $1 AND trainer_id = $2',
      [batch_id, trainer_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Trainer not in batch' });
    }

    await pool.query(
      'DELETE FROM batch_trainers WHERE batch_id = $1 AND trainer_id = $2',
      [batch_id, trainer_id]
    );

    res.json({ message: 'Trainer removed from batch successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove trainer from batch' });
  }
};

export {
  addStudentToBatch,
  getStudentsByBatch,
  removeStudentFromBatch,
  addTrainerToBatch,
  getTrainersByBatch,
  removeTrainerFromBatch
};
