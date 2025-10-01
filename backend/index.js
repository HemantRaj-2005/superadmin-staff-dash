import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import userRoutes from './routes/users.js';
import authRoutes from './routes/auth.js';
import postRoutes from './routes/posts.js';

// Import utilities
import { connectDB } from './db/databaseConnection.js';
import { runCleanupJob } from './utils/cleanupjob.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin:process.env.FRONTEND_URL || 'http://localhost:3000',  // React dev server
  methods: ['GET','POST'],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Server is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('💥 Error:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

// 404 handler
// app.use('*', (req, res) => {
//   res.status(404).json({ message: 'Route not found' });
// });

// Database connection
connectDB();

// Start cleanup job for permanent deletion
runCleanupJob();

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});