import SettingsRepository from '../repositories/settings.repository.js';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';

export async function checkMaintenance(req, res, next) {
  // Allow system check endpoints or authentication routes to bypass block
  const bypassPaths = [
    '/api/health',
    '/api/auth/login',
    '/api/auth/refresh',
    '/api/auth/logout',
    '/api/admin/maintenance' // Allow toggling maintenance mode
  ];

  if (bypassPaths.some((path) => req.path.startsWith(path))) {
    return next();
  }

  try {
    const config = await SettingsRepository.getMaintenanceConfig();
    if (config && config.status === 'ENABLED') {
      let isUserAdmin = false;

      // Extract and verify token manually
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        const token = req.headers.authorization.split(' ')[1];
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { role: true }
          });
          if (user && user.role === 'ADMIN') {
            isUserAdmin = true;
          }
        } catch (err) {
          // Token expired or invalid, ignore admin bypass
        }
      }

      if (config.allowAdmin && isUserAdmin) {
        return next();
      }

      return res.status(503).json({
        success: false,
        maintenance: true,
        message: config.message || 'System is undergoing scheduled maintenance.',
        eta: config.eta ? config.eta.toISOString() : null
      });
    }
  } catch (err) {
    console.error('Error verifying maintenance configuration status:', err.message);
  }

  next();
}
