const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const env = require('./config/env');
const taskRoutes = require('./routes/task.routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);

// Body parser with size limit
app.use(express.json({ limit: '10kb' }));

// Health check endpoint
app.get(['/health', '/api/health'], (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Task routes mounted on both /api/tasks and /tasks for complete compatibility
app.use('/api/tasks', taskRoutes);
app.use('/tasks', taskRoutes);

// 404 handler for unknown routes
app.use(notFound);

// Centralized error-handling middleware
app.use(errorHandler);

module.exports = app;
