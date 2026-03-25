import { v4 as uuidv4 } from 'uuid';
import pool from '../config/db.js';

const assignTestToBatch = async (req, res) => {
  try {
    const { batch_id, test_id } = req.body;

    if (!batch_id || !test_id) {
      return res.status(400).json({ error: 'batch_id and test_id required' });
    }

    // Validate batch exists
    const batchResult = await pool.query('SELECT id FROM batches WHERE id = $1', [batch_id]);
    if (batchResult.rows.length === 0) {
      return res.status(400).json({ error: 'Batch not found' });
    }

    // Validate test exists
    const testResult = await pool.query('SELECT id FROM tests WHERE id = $1', [test_id]);
    if (testResult.rows.length === 0) {
      return res.status(400).json({ error: 'Test not found' });
    }

    const id = uuidv4();

    const result = await pool.query(
      'INSERT INTO batch_tests (id, batch_id, test_id) VALUES ($1, $2, $3) RETURNING id, batch_id, test_id, created_at',
      [id, batch_id, test_id]
    );

    res.status(201).json({
      message: 'Test assigned to batch successfully',
      batchTest: result.rows[0]
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Test already assigned to this batch' });
    }
    res.status(500).json({ error: 'Failed to assign test to batch' });
  }
};

const getTestsByBatch = async (req, res) => {
  try {
    const { batch_id } = req.params;

    // Validate batch exists
    const batchResult = await pool.query('SELECT id FROM batches WHERE id = $1', [batch_id]);
    if (batchResult.rows.length === 0) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    const result = await pool.query(
      `SELECT bt.id, bt.batch_id, t.id as test_id, t.title, t.description, t.is_active, t.created_at, t.updated_at, bt.created_at as assigned_at
       FROM batch_tests bt
       JOIN tests t ON bt.test_id = t.id
       WHERE bt.batch_id = $1
       ORDER BY bt.created_at ASC`,
      [batch_id]
    );

    // Get question count for each test
    const tests = await Promise.all(
      result.rows.map(async (test) => {
        const countResult = await pool.query(
          'SELECT COUNT(*) FROM test_questions WHERE test_id = $1',
          [test.test_id]
        );
        return {
          ...test,
          questionCount: parseInt(countResult.rows[0].count)
        };
      })
    );

    res.json({
      tests: tests,
      count: tests.length,
      batch_id
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tests for batch' });
  }
};

const removeTestFromBatch = async (req, res) => {
  try {
    const { batch_id, test_id } = req.body;

    if (!batch_id || !test_id) {
      return res.status(400).json({ error: 'batch_id and test_id required' });
    }

    const result = await pool.query(
      'SELECT * FROM batch_tests WHERE batch_id = $1 AND test_id = $2',
      [batch_id, test_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Test not assigned to this batch' });
    }

    await pool.query(
      'DELETE FROM batch_tests WHERE batch_id = $1 AND test_id = $2',
      [batch_id, test_id]
    );

    res.json({ message: 'Test removed from batch successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove test from batch' });
  }
};

export { assignTestToBatch, getTestsByBatch, removeTestFromBatch };
