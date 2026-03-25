import { v4 as uuidv4 } from 'uuid';
import pool from '../config/db.js';

const createTest = async (req, res) => {
  try {
    const { title, description, duration_minutes, is_active } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const id = uuidv4();
    const isActive = is_active !== undefined ? is_active : true;
    const duration = duration_minutes || 60;

    const result = await pool.query(
      'INSERT INTO tests (id, title, description, duration_minutes, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING id, title, description, duration_minutes, is_active, created_at, updated_at',
      [id, title, description, duration, isActive]
    );

    res.status(201).json({
      message: 'Test created successfully',
      test: result.rows[0]
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Test title already exists' });
    }
    res.status(500).json({ error: 'Failed to create test' });
  }
};

const getAllTests = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, description, duration_minutes, is_active, created_at, updated_at FROM tests ORDER BY created_at DESC'
    );

    // Get question count for each test
    const tests = await Promise.all(
      result.rows.map(async (test) => {
        const countResult = await pool.query(
          'SELECT COUNT(*) FROM test_questions WHERE test_id = $1',
          [test.id]
        );
        return {
          ...test,
          questionCount: parseInt(countResult.rows[0].count)
        };
      })
    );

    res.json({
      tests: tests,
      count: tests.length
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tests' });
  }
};

const getTestById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT id, title, description, duration_minutes, is_active, created_at, updated_at FROM tests WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Test not found' });
    }

    const test = result.rows[0];

    // Get questions in order
    const questionsResult = await pool.query(
      `SELECT tq.id, tq.question_order, q.id as question_id, q.title, q.description, q.lang,
              q.is_active, q.created_at, q.updated_at
       FROM test_questions tq
       JOIN questions q ON tq.question_id = q.id
       WHERE tq.test_id = $1
       ORDER BY tq.question_order ASC`,
      [id]
    );

    // Get test cases for each question
    const questions = await Promise.all(
      questionsResult.rows.map(async (question) => {
        const testCasesResult = await pool.query(
          'SELECT id, question_id, input, expected_output, created_at FROM test_cases WHERE question_id = $1 ORDER BY created_at ASC',
          [question.question_id]
        );
        return {
          ...question,
          testCases: testCasesResult.rows,
          testCaseCount: testCasesResult.rows.length
        };
      })
    );

    res.json({
      test: {
        ...test,
        questions: questions,
        questionCount: questions.length
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch test' });
  }
};

const updateTest = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, duration_minutes, is_active } = req.body;

    const result = await pool.query('SELECT * FROM tests WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Test not found' });
    }

    const test = result.rows[0];

    const updatedTitle = title || test.title;
    const updatedDescription = description !== undefined ? description : test.description;
    const updatedDuration = duration_minutes !== undefined ? duration_minutes : test.duration_minutes;
    const updatedIsActive = is_active !== undefined ? is_active : test.is_active;

    const updateResult = await pool.query(
      'UPDATE tests SET title = $1, description = $2, duration_minutes = $3, is_active = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING id, title, description, duration_minutes, is_active, created_at, updated_at',
      [updatedTitle, updatedDescription, updatedDuration, updatedIsActive, id]
    );

    res.json({
      message: 'Test updated successfully',
      test: updateResult.rows[0]
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Test title already exists' });
    }
    res.status(500).json({ error: 'Failed to update test' });
  }
};

const deleteTest = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM tests WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Test not found' });
    }

    await pool.query('DELETE FROM tests WHERE id = $1', [id]);

    res.json({ message: 'Test deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete test' });
  }
};

const addQuestionToTest = async (req, res) => {
  try {
    const { test_id, question_id } = req.body;

    if (!test_id || !question_id) {
      return res.status(400).json({ error: 'test_id and question_id required' });
    }

    // Validate test exists
    const testResult = await pool.query('SELECT id FROM tests WHERE id = $1', [test_id]);
    if (testResult.rows.length === 0) {
      return res.status(400).json({ error: 'Test not found' });
    }

    // Validate question exists
    const questionResult = await pool.query('SELECT id FROM questions WHERE id = $1', [question_id]);
    if (questionResult.rows.length === 0) {
      return res.status(400).json({ error: 'Question not found' });
    }

    // Get next order number
    const orderResult = await pool.query(
      'SELECT MAX(question_order) as max_order FROM test_questions WHERE test_id = $1',
      [test_id]
    );
    const nextOrder = (orderResult.rows[0].max_order || 0) + 1;

    const id = uuidv4();

    const result = await pool.query(
      'INSERT INTO test_questions (id, test_id, question_id, question_order) VALUES ($1, $2, $3, $4) RETURNING id, test_id, question_id, question_order, created_at',
      [id, test_id, question_id, nextOrder]
    );

    res.status(201).json({
      message: 'Question added to test successfully',
      testQuestion: result.rows[0]
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Question already in this test' });
    }
    res.status(500).json({ error: 'Failed to add question to test' });
  }
};

const removeQuestionFromTest = async (req, res) => {
  try {
    const { test_id, question_id } = req.body;

    if (!test_id || !question_id) {
      return res.status(400).json({ error: 'test_id and question_id required' });
    }

    const result = await pool.query(
      'SELECT * FROM test_questions WHERE test_id = $1 AND question_id = $2',
      [test_id, question_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Question not in this test' });
    }

    const removedOrder = result.rows[0].question_order;

    // Delete the question
    await pool.query(
      'DELETE FROM test_questions WHERE test_id = $1 AND question_id = $2',
      [test_id, question_id]
    );

    // Reorder remaining questions
    await pool.query(
      `UPDATE test_questions
       SET question_order = question_order - 1
       WHERE test_id = $1 AND question_order > $2`,
      [test_id, removedOrder]
    );

    res.json({ message: 'Question removed from test successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove question from test' });
  }
};

const reorderQuestions = async (req, res) => {
  try {
    const { test_id } = req.params;
    const { questions } = req.body;

    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({ error: 'questions array required' });
    }

    // Validate test exists
    const testResult = await pool.query('SELECT id FROM tests WHERE id = $1', [test_id]);
    if (testResult.rows.length === 0) {
      return res.status(404).json({ error: 'Test not found' });
    }

    // Update order for each question
    for (let i = 0; i < questions.length; i++) {
      await pool.query(
        'UPDATE test_questions SET question_order = $1 WHERE test_id = $2 AND question_id = $3',
        [i + 1, test_id, questions[i]]
      );
    }

    res.json({ message: 'Questions reordered successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reorder questions' });
  }
};

export {
  createTest,
  getAllTests,
  getTestById,
  updateTest,
  deleteTest,
  addQuestionToTest,
  removeQuestionFromTest,
  reorderQuestions
};
