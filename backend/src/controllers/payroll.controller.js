import path from 'path';
import PayrollService from '../services/payroll.service.js';

class PayrollController {
  async generatePayroll(req, res, next) {
    try {
      const { month, year } = req.body;
      if (!month || !year) {
        return res.status(400).json({ success: false, message: 'Month and year variables are required.' });
      }
      const data = await PayrollService.generatePayroll(req.user, parseInt(month), parseInt(year));
      return res.status(200).json({
        success: true,
        message: 'Monthly payroll compiled successfully.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async approvePayroll(req, res, next) {
    try {
      const data = await PayrollService.approvePayroll(req.user, req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Payroll run approved and payslips generated.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async payPayroll(req, res, next) {
    try {
      const data = await PayrollService.payPayroll(req.user, req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Payroll run payments executed.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async cancelPayroll(req, res, next) {
    try {
      const data = await PayrollService.cancelPayroll(req.user, req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Payroll run cancelled.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async getPayrollById(req, res, next) {
    try {
      const data = await PayrollService.getPayrollById(req.user, req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Payroll detailed statements.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async listPayrolls(req, res, next) {
    try {
      const data = await PayrollService.listPayrolls(req.user);
      return res.status(200).json({
        success: true,
        message: 'Payroll runs list compiled.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async getEmployeePayrollHistory(req, res, next) {
    try {
      const data = await PayrollService.getEmployeePayrollHistory(req.user, req.params.employeeId);
      return res.status(200).json({
        success: true,
        message: 'Personal payroll statement catalog.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async downloadPayslip(req, res, next) {
    try {
      const pdfPath = await PayrollService.getPayslipPath(req.user, req.params.itemId);
      const filename = path.basename(pdfPath);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.sendFile(pdfPath);
    } catch (err) {
      next(err);
    }
  }
}

export default new PayrollController();
