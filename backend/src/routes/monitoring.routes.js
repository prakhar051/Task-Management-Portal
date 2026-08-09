import express from 'express';
import MonitoringController from '../controllers/monitoring.controller.js';
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

router.get('/health', MonitoringController.getHealthMetrics);
router.get('/metrics', MonitoringController.getMetricsHistory);

router.get('/logs', MonitoringController.getLogs);
router.get('/errors', MonitoringController.getErrors);
router.patch('/errors/:id/resolve', MonitoringController.resolveError);

router.get('/jobs', MonitoringController.listJobs);
router.post('/jobs/:id/run', MonitoringController.runJob);
router.patch('/jobs/:id', MonitoringController.updateJob);
router.get('/jobs/executions', MonitoringController.listJobExecutions);

router.get('/smtp', MonitoringController.getSmtpConfig);
router.patch('/smtp', MonitoringController.updateSmtpConfig);
router.post('/smtp/test', MonitoringController.sendTestEmail);
router.get('/smtp/history', MonitoringController.getEmailHistory);
router.get('/smtp/templates', MonitoringController.getEmailTemplates);

export default router;
