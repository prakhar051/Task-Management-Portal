import http from 'http';
import app from './app.js';
import { initializeSocket } from './utils/socket.js';
import SchedulerService from './services/scheduler.service.js';

const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);
initializeSocket(httpServer);

// Setup scheduled jobs list
SchedulerService.initializeJobs().catch((err) => {
  console.error('Failed to register cron job schedulers:', err.message);
});

const server = httpServer.listen(PORT, () => {
  console.log(`🚀 Task Management API server listening on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Graceful shutdown controls
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down server gracefully...');
  server.close(() => {
    console.log('Process terminated.');
  });
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection details:', err);
  server.close(() => {
    process.exit(1);
  });
});
