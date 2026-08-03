import express from 'express';
import ActivityController from '../controllers/activity.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply auth middleware globally to all activity routes
router.use(authenticateUser);

router.get('/', ActivityController.getActivities);
router.get('/export', ActivityController.exportCSV);
router.get('/:id', ActivityController.getActivityById);
router.get('/entity/:entityType/:entityId', ActivityController.getEntityActivities);
router.get('/user/:userId', ActivityController.getUserActivities);

export default router;
