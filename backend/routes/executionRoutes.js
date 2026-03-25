import express from 'express';
import { executeCode, executeCodeSystem } from '../controllers/executionController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Docker-based execution - authenticated users only
router.post('/', verifyToken, executeCode);

// Testing endpoint - NO authentication required (for testing purposes)
router.post('/test', executeCode);

// System-based execution - NO authentication required (for local development/testing)
router.post('/system', executeCodeSystem);

export default router;
