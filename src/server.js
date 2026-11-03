import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB, { connectDB as namedConnectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import userRoutes from './routes/userRoutes.js';

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

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    platform: 'Assignment 8 API',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/user', userRoutes); // alias for backwards compatibility

// 404 handler for unmatched API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.originalUrl}`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Assignment 8 Backend Server running on http://localhost:${PORT}`);
});
