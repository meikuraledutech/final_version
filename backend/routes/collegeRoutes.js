import express from 'express';
import { createCollege, getAllColleges, getCollegeById, updateCollege, deleteCollege } from '../controllers/collegeController.js';
import { verifyToken, verifySuperAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All college routes require superadmin access
router.post('/', verifyToken, verifySuperAdmin, createCollege);
router.get('/', verifyToken, verifySuperAdmin, getAllColleges);
router.get('/:id', verifyToken, verifySuperAdmin, getCollegeById);
router.put('/:id', verifyToken, verifySuperAdmin, updateCollege);
router.delete('/:id', verifyToken, verifySuperAdmin, deleteCollege);

export default router;
