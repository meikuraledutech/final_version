import { v4 as uuidv4 } from 'uuid';
import pool from '../config/db.js';

const SUPPORTED_LANGUAGES = ['python', 'java', 'c', 'cpp'];

const createQuestion = async (req, res) => {
  try {
    const { title, description, solution_code, lang, is_active } = req.body;

    if (!title || !description || !solution_code || !lang) {
      return res.status(400).json({ error: 'All fields required (title, description, solution_code, lang)' });
    }

    if (!SUPPORTED_LANGUAGES.includes(lang)) {
      return res.status(400).json({ error: `Unsupported language. Supported: ${SUPPORTED_LANGUAGES.join(', ')}` });
    }

    const id = uuidv4();
    const isActive = is_active !== undefined ? is_active : true;

    const result = await pool.query(
      'INSERT INTO questions (id, title, description, solution_code, lang, is_active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, title, description, lang, is_active, created_at',
      [id, title, description, solution_code, lang, isActive]
    );

    res.status(201).json({
      message: 'Question created successfully',
      question: result.rows[0]
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Question title already exists' });
    }
    res.status(500).json({ error: 'Failed to create question' });
  }
};

const getAllQuestions = async (req, res) => {
  try {
    const { lang } = req.query;
    let query = 'SELECT id, title, description, lang, is_active, created_at, updated_at FROM questions WHERE 1=1';
    const params = [];

    if (lang) {
      if (!SUPPORTED_LANGUAGES.includes(lang)) {
        return res.status(400).json({ error: `Unsupported language. Supported: ${SUPPORTED_LANGUAGES.join(', ')}` });
      }
      query += ' AND lang = $' + (params.length + 1);
      params.push(lang);
    }

    query += ' ORDER BY created_at DESC';

    const questionsResult = await pool.query(query, params);

    // Fetch test cases for each question
    const questions = await Promise.all(
      questionsResult.rows.map(async (question) => {
        const testCasesResult = await pool.query(
          'SELECT id, question_id, input, expected_output, created_at FROM test_cases WHERE question_id = $1 ORDER BY created_at ASC',
          [question.id]
        );
        return {
          ...question,
          testCases: testCasesResult.rows,
          testCaseCount: testCasesResult.rows.length
        };
      })
    );

    res.json({
      questions: questions,
      count: questions.length,
      filters: { lang: lang || null }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
};

const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, title, description, solution_code, lang, is_active, created_at, updated_at FROM questions WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const question = result.rows[0];

    // Fetch test cases for this question
    const testCasesResult = await pool.query(
      'SELECT id, question_id, input, expected_output, created_at FROM test_cases WHERE question_id = $1 ORDER BY created_at ASC',
      [id]
    );

    res.json({
      question: {
        ...question,
        testCases: testCasesResult.rows,
        testCaseCount: testCasesResult.rows.length
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch question' });
  }
};

const getQuestionsByLanguage = async (req, res) => {
  try {
    const { lang } = req.params;

    if (!SUPPORTED_LANGUAGES.includes(lang)) {
      return res.status(400).json({ error: `Unsupported language. Supported: ${SUPPORTED_LANGUAGES.join(', ')}` });
    }

    const result = await pool.query(
      'SELECT id, title, description, lang, is_active, created_at, updated_at FROM questions WHERE lang = $1 ORDER BY created_at DESC',
      [lang]
    );

    // Fetch test cases for each question
    const questions = await Promise.all(
      result.rows.map(async (question) => {
        const testCasesResult = await pool.query(
          'SELECT id, question_id, input, expected_output, created_at FROM test_cases WHERE question_id = $1 ORDER BY created_at ASC',
          [question.id]
        );
        return {
          ...question,
          testCases: testCasesResult.rows,
          testCaseCount: testCasesResult.rows.length
        };
      })
    );

    res.json({
      questions: questions,
      count: questions.length,
      lang
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, solution_code, lang, is_active } = req.body;

    const result = await pool.query('SELECT * FROM questions WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const question = result.rows[0];

    if (lang && !SUPPORTED_LANGUAGES.includes(lang)) {
      return res.status(400).json({ error: `Unsupported language. Supported: ${SUPPORTED_LANGUAGES.join(', ')}` });
    }

    const updatedTitle = title || question.title;
    const updatedDescription = description || question.description;
    const updatedSolutionCode = solution_code || question.solution_code;
    const updatedLang = lang || question.lang;
    const updatedIsActive = is_active !== undefined ? is_active : question.is_active;

    const updateResult = await pool.query(
      'UPDATE questions SET title = $1, description = $2, solution_code = $3, lang = $4, is_active = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING id, title, description, lang, is_active, created_at, updated_at',
      [updatedTitle, updatedDescription, updatedSolutionCode, updatedLang, updatedIsActive, id]
    );

    res.json({
      message: 'Question updated successfully',
      question: updateResult.rows[0]
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Question title already exists' });
    }
    res.status(500).json({ error: 'Failed to update question' });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM questions WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    await pool.query('DELETE FROM questions WHERE id = $1', [id]);

    res.json({ message: 'Question deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete question' });
  }
};

export { createQuestion, getAllQuestions, getQuestionById, getQuestionsByLanguage, updateQuestion, deleteQuestion };
