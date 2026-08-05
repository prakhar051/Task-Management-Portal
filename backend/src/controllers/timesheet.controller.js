import TimesheetService from '../services/timesheet.service.js';

class TimesheetController {
  async getTimesheets(req, res, next) {
    try {
      const data = await TimesheetService.getTimesheets(req.user, req.query);
      return res.status(200).json({
        success: true,
        message: 'Timesheets list retrieved successfully.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async getTimesheetById(req, res, next) {
    try {
      const data = await TimesheetService.getTimesheetById(req.user, req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Timesheet record details retrieved successfully.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async getMonthlySummary(req, res, next) {
    try {
      const data = await TimesheetService.getMonthlySummary(req.user, req.query);
      return res.status(200).json({
        success: true,
        message: 'Monthly productivity summary compiled successfully.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async exportTimesheets(req, res, next) {
    try {
      const csvContent = await TimesheetService.getTimesheetsExport(req.user, req.query);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="timesheets-report.csv"');
      return res.status(200).send(csvContent);
    } catch (err) {
      next(err);
    }
  }
}

export default new TimesheetController();
