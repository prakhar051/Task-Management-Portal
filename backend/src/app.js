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
import taskRoutes from './routes/task.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import activityRoutes from './routes/activity.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import reportRoutes from './routes/report.routes.js';
import calendarRoutes from './routes/calendar.routes.js';
import leaveRoutes from './routes/leave.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import timesheetRoutes from './routes/timesheet.routes.js';
import documentRoutes from './routes/document.routes.js';
import salaryRoutes from './routes/salary.routes.js';
import payrollRoutes from './routes/payroll.routes.js';
import jobRoutes from './routes/job.routes.js';
import candidateRoutes from './routes/candidate.routes.js';
import interviewRoutes from './routes/interview.routes.js';
import offerRoutes from './routes/offer.routes.js';
import { contextMiddleware } from './middleware/context.middleware.js';
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
app.use('/uploads/documents', express.static(path.join(process.cwd(), 'uploads')));

// Parse body JSON payloads (limit size to prevent raw buffer overflow attacks)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Parse request cookies
app.use(cookieParser());

// Enable context storage for non-blocking logging
app.use(contextMiddleware);

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
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/timesheets', timesheetRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/offers', offerRoutes);

// Global 404 handler for unmatched routes
app.use(notFoundHandler);

// Global Error Handler Middleware
app.use(errorHandler);

export default app;
