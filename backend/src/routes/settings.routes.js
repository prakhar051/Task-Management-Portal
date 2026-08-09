import express from 'express';
import SettingsController from '../controllers/settings.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = express.Router();

// Enforce authentication & ADMIN role permissions
const verifyAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Forbidden. Admin privileges required.' });
  }
  next();
};

router.use(authenticateUser);
router.use(verifyAdmin);

router.get('/', SettingsController.getSettings);
router.patch('/', SettingsController.updateSettings);

router.get('/keys', SettingsController.listApiKeys);
router.post('/keys', SettingsController.createApiKey);
router.patch('/keys/:id/revoke', SettingsController.revokeApiKey);
router.delete('/keys/:id', SettingsController.deleteApiKey);

router.get('/maintenance', SettingsController.getMaintenanceConfig);
router.patch('/maintenance', SettingsController.updateMaintenanceConfig);

export default router;
