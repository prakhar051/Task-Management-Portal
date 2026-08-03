import AnalyticsService from '../services/analytics.service.js';

class AnalyticsController {
  async getOverview(req, res, next) {
    try {
      const data = await AnalyticsService.getOverview(req.user, req.query);
      return res.status(200).json({
        success: true,
        message: 'Overview analytics data retrieved successfully.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async getEmployees(req, res, next) {
    try {
      const data = await AnalyticsService.getEmployees(req.user, req.query);
      return res.status(200).json({
        success: true,
        message: 'Employee analytics retrieved successfully.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async getDepartments(req, res, next) {
    try {
      const data = await AnalyticsService.getDepartments(req.user, req.query);
      return res.status(200).json({
        success: true,
        message: 'Department analytics retrieved successfully.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async getProjects(req, res, next) {
    try {
      const data = await AnalyticsService.getProjects(req.user, req.query);
      return res.status(200).json({
        success: true,
        message: 'Project analytics retrieved successfully.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async getTasks(req, res, next) {
    try {
      const data = await AnalyticsService.getTasks(req.user, req.query);
      return res.status(200).json({
        success: true,
        message: 'Task analytics retrieved successfully.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async getProductivity(req, res, next) {
    try {
      const data = await AnalyticsService.getProductivity(req.user, req.query);
      return res.status(200).json({
        success: true,
        message: 'Productivity trends analytics retrieved successfully.',
        data
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new AnalyticsController();
