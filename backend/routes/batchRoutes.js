import express from 'express';
import { createBatch, getAllBatches, getBatchById, getBatchesByCollege, updateBatch, deleteBatch } from '../controllers/batchController.js';
import { assignTestToBatch, getTestsByBatch, removeTestFromBatch } from '../controllers/batchTestController.js';
import { verifyToken, verifySuperAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All batch routes require superadmin access
router.post('/', verifyToken, verifySuperAdmin, createBatch);
router.get('/', verifyToken, verifySuperAdmin, getAllBatches);

// Specific batch routes - MUST be before :id routes to avoid conflicts
router.get('/college/:college_id', verifyToken, verifySuperAdmin, getBatchesByCollege);
router.post('/:batch_id/tests/assign', verifyToken, verifySuperAdmin, assignTestToBatch);
router.get('/:batch_id/tests', verifyToken, verifySuperAdmin, getTestsByBatch);
router.post('/:batch_id/tests/remove', verifyToken, verifySuperAdmin, removeTestFromBatch);

// Generic batch routes - MUST be last
router.get('/:id', verifyToken, verifySuperAdmin, getBatchById);
router.put('/:id', verifyToken, verifySuperAdmin, updateBatch);
router.delete('/:id', verifyToken, verifySuperAdmin, deleteBatch);

export default router;
