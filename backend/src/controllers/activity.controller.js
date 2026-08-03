import ActivityService from '../services/activity.service.js';

class ActivityController {
  async getActivities(req, res, next) {
    try {
      const data = await ActivityService.getActivities(req.user, req.query);
      return res.status(200).json({
        success: true,
        message: 'Activities retrieved successfully.',
        ...data
      });
    } catch (err) {
      next(err);
    }
  }

  async getActivityById(req, res, next) {
    try {
      const activity = await ActivityService.getActivityById(req.params.id, req.user);
      return res.status(200).json({
        success: true,
        message: 'Activity log retrieved successfully.',
        data: activity
      });
    } catch (err) {
      next(err);
    }
  }

  async getEntityActivities(req, res, next) {
    try {
      const activities = await ActivityService.getEntityActivities(
        req.params.entityType,
        req.params.entityId,
        req.user
      );
      return res.status(200).json({
        success: true,
        message: 'Entity audit log retrieved successfully.',
        data: activities
      });
    } catch (err) {
      next(err);
    }
  }

  async getUserActivities(req, res, next) {
    try {
      const data = await ActivityService.getUserActivities(
        req.params.userId,
        req.user,
        req.query
      );
      return res.status(200).json({
        success: true,
        message: 'User activity logs retrieved successfully.',
        ...data
      });
    } catch (err) {
      next(err);
    }
  }

  async exportCSV(req, res, next) {
    try {
      const csv = await ActivityService.exportCSV(req.user, req.query);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=activity_export_${Date.now()}.csv`);
      return res.status(200).send(csv);
    } catch (err) {
      next(err);
    }
  }
}

export default new ActivityController();
