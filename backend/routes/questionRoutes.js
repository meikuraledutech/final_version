import express from 'express';
import { createQuestion, getAllQuestions, getQuestionById, getQuestionsByLanguage, updateQuestion, deleteQuestion } from '../controllers/questionController.js';
import { addTestCase, getTestCasesByQuestion, getTestCaseById, updateTestCase, deleteTestCase } from '../controllers/testCaseController.js';
import { verifyToken, verifySuperAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Question routes - superadmin only
router.post('/', verifyToken, verifySuperAdmin, createQuestion);
router.get('/', verifyToken, verifySuperAdmin, getAllQuestions);
router.get('/lang/:lang', verifyToken, verifySuperAdmin, getQuestionsByLanguage);

// Test case routes - MUST be before :id route to avoid conflicts - superadmin only
router.post('/:question_id/testcases', verifyToken, verifySuperAdmin, addTestCase);
router.get('/:question_id/testcases', verifyToken, verifySuperAdmin, getTestCasesByQuestion);
router.put('/testcases/:id', verifyToken, verifySuperAdmin, updateTestCase);
router.delete('/testcases/:id', verifyToken, verifySuperAdmin, deleteTestCase);
router.get('/testcases/:id', verifyToken, verifySuperAdmin, getTestCaseById);

// Generic question routes - MUST be last - superadmin only
router.get('/:id', verifyToken, verifySuperAdmin, getQuestionById);
router.put('/:id', verifyToken, verifySuperAdmin, updateQuestion);
router.delete('/:id', verifyToken, verifySuperAdmin, deleteQuestion);

export default router;
