import ReportService from '../services/report.service.js';

class ReportController {
  async getEmployeeReport(req, res, next) {
    try {
      const format = req.query.format || 'csv';
      const result = await ReportService.getEmployeeReport(req.user, req.query, format);
      
      res.setHeader('Content-Type', result.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      return res.status(200).send(result.data);
    } catch (err) {
      next(err);
    }
  }

  async getDepartmentReport(req, res, next) {
    try {
      const format = req.query.format || 'csv';
      const result = await ReportService.getDepartmentReport(req.user, req.query, format);

      res.setHeader('Content-Type', result.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      return res.status(200).send(result.data);
    } catch (err) {
      next(err);
    }
  }

  async getProjectReport(req, res, next) {
    try {
      const format = req.query.format || 'csv';
      const result = await ReportService.getProjectReport(req.user, req.query, format);

      res.setHeader('Content-Type', result.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      return res.status(200).send(result.data);
    } catch (err) {
      next(err);
    }
  }

  async getTaskReport(req, res, next) {
    try {
      const format = req.query.format || 'csv';
      const result = await ReportService.getTaskReport(req.user, req.query, format);

      res.setHeader('Content-Type', result.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      return res.status(200).send(result.data);
    } catch (err) {
      next(err);
    }
  }

  async getProductivityReport(req, res, next) {
    try {
      const format = req.query.format || 'csv';
      const result = await ReportService.getProductivityReport(req.user, req.query, format);

      res.setHeader('Content-Type', result.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      return res.status(200).send(result.data);
    } catch (err) {
      next(err);
    }
  }
}

export default new ReportController();
