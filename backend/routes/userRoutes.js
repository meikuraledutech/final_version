import express from 'express';
import { getAllUsers, getUserById, updateUser, deleteUser, getStudents, getTrainers, getCollegeAdmins } from '../controllers/userController.js';
import { verifyToken, verifySuperAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All user management routes require superadmin access
router.get('/', verifyToken, verifySuperAdmin, getAllUsers);
router.get('/filter/students', verifyToken, verifySuperAdmin, getStudents);
router.get('/filter/trainers', verifyToken, verifySuperAdmin, getTrainers);
router.get('/filter/college-admins', verifyToken, verifySuperAdmin, getCollegeAdmins);
router.get('/:id', verifyToken, verifySuperAdmin, getUserById);
router.put('/:id', verifyToken, verifySuperAdmin, updateUser);
router.delete('/:id', verifyToken, verifySuperAdmin, deleteUser);

export default router;
