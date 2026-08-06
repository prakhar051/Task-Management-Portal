import MaintenanceService from '../services/maintenance.service.js';

class MaintenanceController {
  async createRecord(req, res, next) {
    try {
      const data = await MaintenanceService.createRecord(req.user, req.body);
      return res.status(201).json({
        success: true,
        message: 'Asset maintenance scheduled.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async updateRecord(req, res, next) {
    try {
      const data = await MaintenanceService.updateRecord(req.user, req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Asset maintenance details modified.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async getRecordById(req, res, next) {
    try {
      const data = await MaintenanceService.getRecordById(req.user, req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Maintenance log details.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async listRecords(req, res, next) {
    try {
      const data = await MaintenanceService.listRecords(req.user);
      return res.status(200).json({
        success: true,
        message: 'Scheduled asset maintenance logs.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteRecord(req, res, next) {
    try {
      await MaintenanceService.deleteRecord(req.user, req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Maintenance schedule deleted.'
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new MaintenanceController();
