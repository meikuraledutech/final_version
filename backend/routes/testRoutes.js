import express from 'express';
import {
  createTest,
  getAllTests,
  getTestById,
  updateTest,
  deleteTest,
  addQuestionToTest,
  removeQuestionFromTest,
  reorderQuestions
} from '../controllers/testController.js';
import { verifyToken, verifySuperAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Test routes - superadmin only
router.post('/', verifyToken, verifySuperAdmin, createTest);
router.get('/', verifyToken, verifySuperAdmin, getAllTests);
router.get('/:id', verifyToken, verifySuperAdmin, getTestById);
router.put('/:id', verifyToken, verifySuperAdmin, updateTest);
router.delete('/:id', verifyToken, verifySuperAdmin, deleteTest);

// Test questions routes - superadmin only
router.post('/questions/add', verifyToken, verifySuperAdmin, addQuestionToTest);
router.post('/questions/remove', verifyToken, verifySuperAdmin, removeQuestionFromTest);
router.put('/:test_id/reorder', verifyToken, verifySuperAdmin, reorderQuestions);

export default router;
