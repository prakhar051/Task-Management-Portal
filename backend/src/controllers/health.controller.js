import HealthService from '../services/health.service.js';

export const getHealth = async (req, res) => {
  const isConnected = await HealthService.checkDatabaseConnection();
  const timestamp = new Date().toISOString();

  if (!isConnected) {
    return res.status(503).json({
      success: false,
      status: "DOWN",
      service: "Task Management Portal API",
      database: "DISCONNECTED",
      timestamp,
      error: "Database unavailable"
    });
  }

  return res.status(200).json({
    success: true,
    status: "UP",
    service: "Task Management Portal API",
    version: "1.0.0",
    environment: process.env.NODE_ENV || 'development',
    timestamp,
    uptime: process.uptime(),
    database: "CONNECTED"
  });
};
