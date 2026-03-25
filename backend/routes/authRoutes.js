import express from 'express';
import { register, login, refreshAccessToken } from '../controllers/authController.js';
import { verifyToken, verifySuperAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', verifyToken, verifySuperAdmin, register);
router.post('/login', login);
router.post('/refresh', refreshAccessToken);

export default router;
