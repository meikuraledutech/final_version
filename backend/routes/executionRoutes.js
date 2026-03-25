import express from 'express';
import { executeCode } from '../controllers/executionController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Code execution endpoint - authenticated users only
router.post('/', verifyToken, executeCode);

// Testing endpoint - NO authentication required (for testing purposes)
router.post('/test', executeCode);

export default router;
