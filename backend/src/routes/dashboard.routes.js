import { Router } from 'express';
import { getOverview, getActivity, getNotifications, getCharts } from '../controllers/dashboard.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/async.middleware.js';

const router = Router();

// Apply authentication guard to all dashboard routes
router.use(authenticateUser);

router.get('/overview', asyncHandler(getOverview));
router.get('/activity', asyncHandler(getActivity));
router.get('/notifications', asyncHandler(getNotifications));
router.get('/charts', asyncHandler(getCharts));

export default router;
