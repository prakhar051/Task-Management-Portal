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
import assetRoutes from './routes/asset.routes.js';
import maintenanceRoutes from './routes/maintenance.routes.js';
import vendorRoutes from './routes/vendor.routes.js';
import knowledgeRoutes from './routes/knowledge.routes.js';
import aiRoutes from './routes/ai.routes.js';
import automationRoutes from './routes/automation.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import backupRoutes from './routes/backup.routes.js';
import monitoringRoutes from './routes/monitoring.routes.js';
import featureFlagRoutes from './routes/featureFlag.routes.js';
import healthRoutes from './routes/health.routes.js';
import { checkMaintenance } from './middleware/maintenance.middleware.js';
import { contextMiddleware } from './middleware/context.middleware.js';
import { standardResponse } from './middleware/standardResponse.middleware.js';
import { generalLimiter, authLimiter } from './middleware/rateLimiter.middleware.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';

// Load environmental variables
dotenv.config();

const app = express();

// Set security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginEmbedderPolicy: false
}));

// Enable Cross-Origin Resource Sharing
const allowedOrigins = [
  'http://localhost:5173',
  'https://task-management-portal-nine.vercel.app'
];
if (process.env.CLIENT_URL) allowedOrigins.push(process.env.CLIENT_URL);
if (process.env.FRONTEND_URL) allowedOrigins.push(process.env.FRONTEND_URL);

const cleanAllowedOrigins = Array.from(
  new Set(allowedOrigins.map(url => url.trim().replace(/\/$/, '')))
);

app.use(cors({
  origin: (origin, callback) => {
    console.log('[CORS Debug] Request Origin:', origin);
    console.log('[CORS Debug] Clean Allowed Origins:', cleanAllowedOrigins);
    
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    const cleanOrigin = origin.trim().replace(/\/$/, '');
    if (
      cleanAllowedOrigins.includes(cleanOrigin) ||
      /^https:\/\/.*\.vercel\.app$/.test(cleanOrigin)
    ) {
      return callback(null, true);
    }
    console.warn('[CORS Debug] Origin rejected:', cleanOrigin);
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 204
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

// Standardize API response formats & generate trace tracking IDs
app.use(standardResponse);

// Enforce general request rate limits (throttling)
app.use(generalLimiter);

// Enforce maintenance mode interceptor blocks
app.use(checkMaintenance);

// Register health routes (public, bypassed from maintenance/rate-limiting)
app.use('/health', healthRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/v1/health', healthRoutes);

// Register routers (with authLimiter applied to sensitive authentication routes)
app.use(['/api/auth', '/api/v1/auth'], authLimiter, authRoutes);

const routesMap = {
  dashboard: dashboardRoutes,
  employees: employeeRoutes,
  departments: departmentRoutes,
  projects: projectRoutes,
  tasks: taskRoutes,
  notifications: notificationRoutes,
  activity: activityRoutes,
  analytics: analyticsRoutes,
  reports: reportRoutes,
  calendar: calendarRoutes,
  leaves: leaveRoutes,
  attendance: attendanceRoutes,
  timesheets: timesheetRoutes,
  documents: documentRoutes,
  salary: salaryRoutes,
  payroll: payrollRoutes,
  jobs: jobRoutes,
  candidates: candidateRoutes,
  interviews: interviewRoutes,
  offers: offerRoutes,
  assets: assetRoutes,
  maintenance: maintenanceRoutes,
  vendors: vendorRoutes,
  knowledge: knowledgeRoutes,
  ai: aiRoutes,
  automation: automationRoutes,
  'admin/settings': settingsRoutes,
  'admin/backups': backupRoutes,
  'admin/monitoring': monitoringRoutes,
  'admin/features': featureFlagRoutes
};

// Register all routes for both backward-compatible '/api' and versioned '/api/v1' prefixes
for (const [routePath, router] of Object.entries(routesMap)) {
  app.use([`/api/${routePath}`, `/api/v1/${routePath}`], router);
}

// Global 404 handler for unmatched routes
app.use(notFoundHandler);

// Global Error Handler Middleware
app.use(errorHandler);

export default app;
