import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import collegeRoutes from './routes/collegeRoutes.js';
import userRoutes from './routes/userRoutes.js';
import batchRoutes from './routes/batchRoutes.js';
import batchMemberRoutes from './routes/batchMemberRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import executionRoutes from './routes/executionRoutes.js';
import testRoutes from './routes/testRoutes.js';

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON
app.use(express.json());

// Hello World route
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello World!' });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Auth routes
app.use('/api/auth', authRoutes);

// College routes
app.use('/api/colleges', collegeRoutes);

// User management routes
app.use('/api/users', userRoutes);

// Batch management routes
app.use('/api/batches', batchRoutes);

// Batch member routes (students and trainers)
app.use('/api/batch-members', batchMemberRoutes);

// Question and test case routes
app.use('/api/questions', questionRoutes);

// Code execution routes
app.use('/api/execute', executionRoutes);

// Test/Assignment routes
app.use('/api/tests', testRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
