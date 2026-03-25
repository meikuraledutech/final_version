import { v4 as uuidv4 } from 'uuid';
import pool from '../config/db.js';

const addTestCase = async (req, res) => {
  try {
    const { question_id, input, expected_output } = req.body;

    if (!question_id || !input || !expected_output) {
      return res.status(400).json({ error: 'question_id, input, and expected_output required' });
    }

    // Validate question exists and fetch solution code + language
    const questionResult = await pool.query(
      'SELECT id, solution_code, lang FROM questions WHERE id = $1',
      [question_id]
    );
    if (questionResult.rows.length === 0) {
      return res.status(400).json({ error: 'Question not found' });
    }

    const question = questionResult.rows[0];

    // Validate test case by running the solution code
    try {
      // Extract token from request header
      const authHeader = req.headers.authorization;
      const headers = { 'Content-Type': 'application/json' };
      if (authHeader) {
        headers.Authorization = authHeader;
      }

      const executionResponse = await fetch('http://localhost:3001/api/execute', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          code: question.solution_code,
          language: question.lang,
          input: input,
          timeout: 5
        })
      });

      const executionResult = await executionResponse.json();

      // Check if execution was successful
      if (!executionResult.success) {
        return res.status(400).json({
          error: 'Test case validation failed',
          details: 'Solution code execution error: ' + (executionResult.error || 'Unknown error'),
          statusCode: 400
        });
      }

      // Compare actual output with expected output
      const actualOutput = executionResult.output.trim();
      const expectedOutputTrimmed = expected_output.trim();

      if (actualOutput !== expectedOutputTrimmed) {
        return res.status(400).json({
          error: 'Test case validation failed',
          details: 'Output mismatch',
          expected: expectedOutputTrimmed,
          actual: actualOutput,
          statusCode: 400
        });
      }

      // If validation passes, save the test case
      const id = uuidv4();

      const result = await pool.query(
        'INSERT INTO test_cases (id, question_id, input, expected_output) VALUES ($1, $2, $3, $4) RETURNING id, question_id, input, expected_output, created_at',
        [id, question_id, input, expected_output]
      );

      res.status(201).json({
        message: 'Test case added successfully',
        testCase: result.rows[0],
        validation: {
          status: 'passed',
          executionTime: executionResult.executionTime
        }
      });

    } catch (executionErr) {
      // Error calling execution endpoint
      return res.status(500).json({
        error: 'Test case validation failed',
        details: 'Unable to validate test case: ' + executionErr.message,
        statusCode: 500
      });
    }

  } catch (err) {
    res.status(500).json({ error: 'Failed to add test case' });
  }
};

const getTestCasesByQuestion = async (req, res) => {
  try {
    const { question_id } = req.params;

    // Validate question exists
    const questionResult = await pool.query('SELECT id FROM questions WHERE id = $1', [question_id]);
    if (questionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const result = await pool.query(
      'SELECT id, question_id, input, expected_output, created_at FROM test_cases WHERE question_id = $1 ORDER BY created_at ASC',
      [question_id]
    );

    res.json({
      testCases: result.rows,
      count: result.rows.length,
      question_id
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch test cases' });
  }
};

const getTestCaseById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT id, question_id, input, expected_output, created_at FROM test_cases WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Test case not found' });
    }

    res.json({ testCase: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch test case' });
  }
};

const updateTestCase = async (req, res) => {
  try {
    const { id } = req.params;
    const { input, expected_output } = req.body;

    const result = await pool.query('SELECT * FROM test_cases WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Test case not found' });
    }

    const testCase = result.rows[0];
    const updatedInput = input || testCase.input;
    const updatedExpectedOutput = expected_output || testCase.expected_output;

    const updateResult = await pool.query(
      'UPDATE test_cases SET input = $1, expected_output = $2 WHERE id = $3 RETURNING id, question_id, input, expected_output, created_at',
      [updatedInput, updatedExpectedOutput, id]
    );

    res.json({
      message: 'Test case updated successfully',
      testCase: updateResult.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update test case' });
  }
};

const deleteTestCase = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM test_cases WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Test case not found' });
    }

    await pool.query('DELETE FROM test_cases WHERE id = $1', [id]);

    res.json({ message: 'Test case deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete test case' });
  }
};

export { addTestCase, getTestCasesByQuestion, getTestCaseById, updateTestCase, deleteTestCase };
