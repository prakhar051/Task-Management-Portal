import express from 'express';
import BackupController from '../controllers/backup.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = express.Router();

const verifyAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Forbidden. Admin privileges required.' });
  }
  next();
};

router.use(authenticateUser);
router.use(verifyAdmin);

router.post('/', BackupController.triggerBackup);
router.get('/', BackupController.listBackups);
router.post('/:id/restore', BackupController.restoreBackup);

export default router;
