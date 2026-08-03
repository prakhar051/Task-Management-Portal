import express from 'express';
import NotificationController from '../controllers/notification.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply auth middleware globally to all notification routes
router.use(authenticateUser);

router.get('/', NotificationController.getNotifications);
router.get('/unread', NotificationController.getUnreadCount);
router.get('/export', NotificationController.exportCSV);
router.get('/preferences', NotificationController.getPreferences);
router.patch('/preferences', NotificationController.updatePreferences);
router.patch('/read-all', NotificationController.markAllAsRead);
router.patch('/:id/read', NotificationController.markAsRead);
router.delete('/bulk', NotificationController.deleteBulkNotifications);
router.delete('/:id', NotificationController.deleteNotification);

export default router;
