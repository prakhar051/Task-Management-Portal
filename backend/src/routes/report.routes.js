import express from 'express';
import ReportController from '../controllers/report.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply auth middleware globally to all report endpoints
router.use(authenticateUser);

router.get('/employees', ReportController.getEmployeeReport);
router.get('/departments', ReportController.getDepartmentReport);
router.get('/projects', ReportController.getProjectReport);
router.get('/tasks', ReportController.getTaskReport);
router.get('/productivity', ReportController.getProductivityReport);

export default router;
