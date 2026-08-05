import SalaryService from '../services/salary.service.js';

class SalaryController {
  async createStructure(req, res, next) {
    try {
      const data = await SalaryService.createStructure(req.user, req.body);
      return res.status(201).json({
        success: true,
        message: 'Salary structure templates registered.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async updateStructure(req, res, next) {
    try {
      const data = await SalaryService.updateStructure(req.user, req.params.employeeId, req.body);
      return res.status(200).json({
        success: true,
        message: 'Salary structure templates updated.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async getStructureByEmployeeId(req, res, next) {
    try {
      const data = await SalaryService.getStructureByEmployeeId(req.user, req.params.employeeId);
      return res.status(200).json({
        success: true,
        message: 'Salary structure details retrieved.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async listStructures(req, res, next) {
    try {
      const data = await SalaryService.listStructures(req.user);
      return res.status(200).json({
        success: true,
        message: 'Salary structure registries compiled.',
        data
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new SalaryController();
