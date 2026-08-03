import NotificationService from '../services/notification.service.js';

class NotificationController {
  async getNotifications(req, res, next) {
    try {
      const data = await NotificationService.getNotifications(req.user.id, req.query);
      return res.status(200).json({
        success: true,
        message: 'Notifications retrieved successfully.',
        ...data
      });
    } catch (err) {
      next(err);
    }
  }

  async getUnreadCount(req, res, next) {
    try {
      const data = await NotificationService.getUnreadCount(req.user.id);
      return res.status(200).json({
        success: true,
        message: 'Unread notifications count retrieved.',
        ...data
      });
    } catch (err) {
      next(err);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const result = await NotificationService.markAsRead(req.params.id, req.user.id);
      return res.status(200).json({
        success: true,
        message: 'Notification marked as read.',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async markAllAsRead(req, res, next) {
    try {
      const result = await NotificationService.markAllAsRead(req.user.id);
      return res.status(200).json({
        success: true,
        message: 'All notifications marked as read.',
        ...result
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteNotification(req, res, next) {
    try {
      await NotificationService.deleteNotification(req.params.id, req.user.id);
      return res.status(200).json({
        success: true,
        message: 'Notification deleted successfully.'
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteBulkNotifications(req, res, next) {
    try {
      await NotificationService.deleteBulkNotifications(req.body.ids, req.user.id);
      return res.status(200).json({
        success: true,
        message: 'Notifications deleted successfully.'
      });
    } catch (err) {
      next(err);
    }
  }

  async getPreferences(req, res, next) {
    try {
      const prefs = await NotificationService.getPreferences(req.user.id);
      return res.status(200).json({
        success: true,
        message: 'Notification preferences retrieved.',
        data: prefs
      });
    } catch (err) {
      next(err);
    }
  }

  async updatePreferences(req, res, next) {
    try {
      const prefs = await NotificationService.updatePreferences(req.user.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Notification preferences updated successfully.',
        data: prefs
      });
    } catch (err) {
      next(err);
    }
  }

  async exportCSV(req, res, next) {
    try {
      const csv = await NotificationService.exportCSV(req.user.id, req.query);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=notifications_export_${Date.now()}.csv`);
      return res.status(200).send(csv);
    } catch (err) {
      next(err);
    }
  }
}

export default new NotificationController();
