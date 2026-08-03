import express from 'express';
import AnalyticsController from '../controllers/analytics.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply auth middleware globally to all analytics endpoints
router.use(authenticateUser);

router.get('/overview', AnalyticsController.getOverview);
router.get('/employees', AnalyticsController.getEmployees);
router.get('/departments', AnalyticsController.getDepartments);
router.get('/projects', AnalyticsController.getProjects);
router.get('/tasks', AnalyticsController.getTasks);
router.get('/productivity', AnalyticsController.getProductivity);

export default router;
