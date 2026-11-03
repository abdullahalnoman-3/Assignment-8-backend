import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Polyfill for @mongodb-js/saslprep (resolves cPanel zip extraction issues with scoped @ folders)
try {
  require('@mongodb-js/saslprep');
} catch (e) {
  const Module = require('module');
  const originalLoad = Module._load;
  Module._load = function (request, parent, isMain) {
    if (request === '@mongodb-js/saslprep') {
      const fn = (input) => (typeof input === 'string' ? input.normalize('NFKC') : input);
      fn.saslprep = fn;
      fn.default = fn;
      return fn;
    }
    return originalLoad.apply(this, arguments);
  };
}

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB, { connectDB as namedConnectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import userRoutes from './routes/userRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect Database
connectDB();

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://assignment.hmnoman.com',
  'http://assignment.hmnoman.com',
  'https://assignmentback.hmnoman.com',
  'http://assignmentback.hmnoman.com',
  'https://assignmentserver.hmnoman.com',
  'http://assignmentserver.hmnoman.com',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // permissive for development
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root welcome route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Assignment 8 Backend API is running successfully!',
    endpoints: {
      auth: '/api/auth',
      events: '/api/events',
      users: '/api/users',
      health: '/api/health',
    },
  });
});

// API Routes Mount
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/user', userRoutes); // Alias for assignment compatibility

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Assignment 8 server is healthy and running.',
    timestamp: new Date().toISOString(),
  });
});

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route ${req.originalUrl} not found.`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Assignment 8 Backend Server running on port ${PORT}`);
});

export default app;
