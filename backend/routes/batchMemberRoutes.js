import express from 'express';
import {
  addStudentToBatch,
  getStudentsByBatch,
  removeStudentFromBatch,
  addTrainerToBatch,
  getTrainersByBatch,
  removeTrainerFromBatch
} from '../controllers/batchMemberController.js';
import { verifyToken, verifySuperAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All batch member routes require superadmin access

// Student routes
router.post('/students', verifyToken, verifySuperAdmin, addStudentToBatch);
router.get('/:batch_id/students', verifyToken, verifySuperAdmin, getStudentsByBatch);
router.delete('/:batch_id/students/:student_id', verifyToken, verifySuperAdmin, removeStudentFromBatch);

// Trainer routes
router.post('/trainers', verifyToken, verifySuperAdmin, addTrainerToBatch);
router.get('/:batch_id/trainers', verifyToken, verifySuperAdmin, getTrainersByBatch);
router.delete('/:batch_id/trainers/:trainer_id', verifyToken, verifySuperAdmin, removeTrainerFromBatch);

export default router;
