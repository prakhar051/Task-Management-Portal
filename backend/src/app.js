import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import employeeRoutes from './routes/employee.routes.js';
import departmentRoutes from './routes/department.routes.js';
import projectRoutes from './routes/project.routes.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';

// Load environmental variables
dotenv.config();

const app = express();

// Set security HTTP headers
app.use(helmet());

// Enable Cross-Origin Resource Sharing
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve static avatars uploads folder publicly
app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));

// Parse body JSON payloads (limit size to prevent raw buffer overflow attacks)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Parse request cookies
app.use(cookieParser());

// Phase 1 Health API endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'UP',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Register routers
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/projects', projectRoutes);

// Global 404 handler for unmatched routes
app.use(notFoundHandler);

// Global Error Handler Middleware
app.use(errorHandler);

export default app;
