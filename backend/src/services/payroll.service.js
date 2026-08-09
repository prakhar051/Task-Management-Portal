import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import crypto from 'crypto';
import PayrollRepository from '../repositories/payroll.repository.js';
import SalaryRepository from '../repositories/salary.repository.js';
import TaxService from './tax.service.js';
import NotificationService from './notification.service.js';
import ActivityService from './activity.service.js';
import { prisma } from '../config/db.js';

class PayrollService {
  /**
   * Generates a monthly payroll draft after executing calculations on base structure,
   * attendance, overtime hours, and leaves.
   */
  async generatePayroll(user, month, year) {
    // 1. Create or fetch draft payroll
    let payroll = await PayrollRepository.getPayrollByPeriod(month, year);
    if (payroll) {
      if (payroll.status !== 'DRAFT') {
        throw new Error(`Payroll for period ${month}/${year} is already ${payroll.status.toLowerCase()} and cannot be regenerated.`);
      }
    } else {
      payroll = await PayrollRepository.createPayroll({ month, year, status: 'DRAFT' });
    }

    // 2. Fetch all salary structures
    const structures = await SalaryRepository.listStructures();
    const payrollItems = [];

    // Helper to calculate working weekdays in month (excluding weekends)
    const getWorkingDaysInMonth = (m, y) => {
      const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
      let count = 0;
      for (let i = 1; i <= days; i++) {
        const dayOfWeek = new Date(Date.UTC(y, m - 1, i)).getUTCDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          count++;
        }
      }
      return count || 22;
    };

    const workingDaysCount = getWorkingDaysInMonth(month, year);
    const startOfMonth = new Date(Date.UTC(year, month - 1, 1));
    const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    for (const struct of structures) {
      const empId = struct.employeeId;

      // Pull daily logs to find absences & half-days
      const logs = await prisma.attendance.findMany({
        where: {
          employeeId: empId,
          date: { gte: startOfMonth, lte: endOfMonth }
        }
      });

      const absentCount = logs.filter((l) => l.status === 'ABSENT').length;
      const halfDayCount = logs.filter((l) => l.status === 'HALF_DAY').length;

      // Pull unpaid leaves
      const leaves = await prisma.leave.findMany({
        where: {
          employeeId: empId,
          status: 'APPROVED',
          type: 'UNPAID',
          startDate: { gte: startOfMonth },
          endDate: { lte: endOfMonth }
        }
      });

      let unpaidLeaveDays = 0;
      leaves.forEach((lv) => {
        const diff = new Date(lv.endDate) - new Date(lv.startDate);
        unpaidLeaveDays += Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
      });

      // Pull overtime hours
      const overtimes = logs.reduce((sum, log) => sum + (log.overtimeHours || 0), 0);

      // Math calculations
      const dailySalary = struct.baseSalary / workingDaysCount;
      const hourlyRate = struct.baseSalary / (workingDaysCount * 8);

      const absentDeduction = absentCount * dailySalary;
      const halfDayDeduction = halfDayCount * 0.5 * dailySalary;
      const unpaidLeaveDeduction = unpaidLeaveDays * dailySalary;

      // Extract fixed components from structure
      let allowances = 0;
      let bonuses = 0;
      let structDeductions = 0;

      struct.components.forEach((c) => {
        const val = c.isPercentage ? (struct.baseSalary * c.amount) : c.amount;
        if (c.type === 'ALLOWANCE') allowances += val;
        if (c.type === 'BONUS') bonuses += val;
        if (c.type === 'DEDUCTION') structDeductions += val;
      });

      const overtimePay = overtimes * hourlyRate * 1.5;
      const grossSalary = struct.baseSalary + allowances + bonuses + overtimePay;

      const tax = await TaxService.calculateTax(grossSalary);
      const deductions = absentDeduction + halfDayDeduction + unpaidLeaveDeduction + structDeductions;
      const netSalary = Math.max(0, grossSalary - tax - deductions);

      payrollItems.push({
        employeeId: empId,
        basicSalary: struct.baseSalary,
        allowances,
        bonuses,
        deductions,
        overtimePay,
        tax,
        grossSalary,
        netSalary
      });
    }

    // Save generated items
    await PayrollRepository.createPayrollItems(payroll.id, payrollItems);

    // Notify uploader
    await NotificationService.createNotification({
      userId: user.id,
      type: 'PROJECT_UPDATED',
      title: 'Payroll Generated',
      message: `Monthly payroll draft generated for period ${month}/${year}.`,
      priority: 'LOW',
      entityType: 'PAYROLL',
      entityId: payroll.id
    });

    // Log Activity
    await ActivityService.logActivity({
      userId: user.id,
      action: 'CREATE',
      entityType: 'PAYROLL',
      entityId: payroll.id,
      description: `Generated payroll draft for period ${month}/${year}`,
      metadata: { after: payroll }
    });

    return PayrollRepository.getPayrollById(payroll.id);
  }

  async approvePayroll(user, id) {
    const payroll = await PayrollRepository.getPayrollById(id);
    if (!payroll) throw new Error('Payroll run not found.');

    if (payroll.status !== 'DRAFT') {
      throw new Error(`Payroll status is already ${payroll.status.toLowerCase()}.`);
    }

    await PayrollRepository.updatePayroll(id, {
      status: 'APPROVED',
      approvedBy: user.id
    });

    // Reload the full payroll run with complete relation inclusions
    const approved = await PayrollRepository.getPayrollById(id);

    // Create immutable payslip snapshots
    for (const item of approved.items) {
      const payslipNumber = `PAY-${approved.year}-${approved.month.toString().padStart(2, '0')}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      
      const payslip = await PayrollRepository.createPayslip({
        payrollItemId: item.id,
        payslipNumber
      });

      // Generate PDF Payslip File
      const pdfPath = await this.generatePayslipPdf(item, payslipNumber, approved.month, approved.year);
      await PayrollRepository.updatePayslip(payslip.id, { pdfPath });

      // Notify employee
      await NotificationService.createNotification({
        userId: item.employee.userId,
        type: 'TASK_COMPLETED',
        title: 'Salary Payslip Approved',
        message: `Your salary payslip for ${approved.month}/${approved.year} is approved.`,
        priority: 'MEDIUM',
        entityType: 'PAYROLL',
        entityId: id
      });
    }

    // Log Activity
    await ActivityService.logActivity({
      userId: user.id,
      action: 'UPDATE',
      entityType: 'PAYROLL',
      entityId: id,
      description: `Approved payroll run for period ${payroll.month}/${payroll.year}`,
      metadata: { after: approved }
    });

    try {
      const AutomationService = (await import('./automation.service.js')).default;
      await AutomationService.trigger('PAYROLL_APPROVED', approved);
    } catch (err) {
      console.error('Automation check failed inside payroll approval workflow:', err);
    }

    return approved;
  }

  async payPayroll(user, id) {
    const payroll = await PayrollRepository.getPayrollById(id);
    if (!payroll) throw new Error('Payroll run not found.');

    if (payroll.status !== 'APPROVED') {
      throw new Error(`Payroll run must be approved before payment. Current status: ${payroll.status}`);
    }

    const paid = await PayrollRepository.updatePayroll(id, {
      status: 'PAID',
      paidAt: new Date()
    });

    // Notify employees
    for (const item of paid.items) {
      await NotificationService.createNotification({
        userId: item.employee.userId,
        type: 'TASK_COMPLETED',
        title: 'Salary Paid',
        message: `Your salary for ${payroll.month}/${payroll.year} has been marked as PAID.`,
        priority: 'HIGH',
        entityType: 'PAYROLL',
        entityId: id
      });
    }

    // Log Activity
    await ActivityService.logActivity({
      userId: user.id,
      action: 'UPDATE',
      entityType: 'PAYROLL',
      entityId: id,
      description: `Paid salary payroll run for period ${payroll.month}/${payroll.year}`,
      metadata: { after: paid }
    });

    return paid;
  }

  async cancelPayroll(user, id) {
    const payroll = await PayrollRepository.getPayrollById(id);
    if (!payroll) throw new Error('Payroll run not found.');

    const cancelled = await PayrollRepository.updatePayroll(id, {
      status: 'CANCELLED'
    });

    return cancelled;
  }

  async getPayrollById(user, id) {
    const payroll = await PayrollRepository.getPayrollById(id);
    if (!payroll) throw new Error('Payroll details not found.');
    return payroll;
  }

  async listPayrolls(user) {
    return PayrollRepository.listPayrolls();
  }

  async getEmployeePayrollHistory(user, employeeId) {
    return PayrollRepository.getEmployeeHistory(employeeId);
  }

  /**
   * Helper to write payslip PDF on disk.
   */
  async generatePayslipPdf(item, payslipNumber, month, year) {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const dir = path.resolve('uploads/payslips');
    await fs.promises.mkdir(dir, { recursive: true });

    const pdfPath = path.join(dir, `${item.id}.pdf`);
    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    // Write contents
    doc.fontSize(18).text('TASK MANAGEMENT PORTAL', { align: 'center' });
    doc.fontSize(10).text('Employee Salary Payslip Statement', { align: 'center' });
    doc.moveDown(1.5);

    doc.fontSize(10).text(`Statement Number: ${payslipNumber}`);
    doc.text(`Employee Code: ${item.employee.id}`);
    doc.text(`Employee Name: ${item.employee.firstName} ${item.employee.lastName}`);
    doc.text(`Designation: ${item.employee.designation}`);
    doc.text(`Payroll Run Period: Month ${month} / ${year}`);
    doc.moveDown(1.5);

    doc.text('----------------------------------------------------');
    doc.text(`Basic Salary: $${item.basicSalary.toFixed(2)}`);
    doc.text(`Allowances: +$${item.allowances.toFixed(2)}`);
    doc.text(`Bonuses: +$${item.bonuses.toFixed(2)}`);
    doc.text(`Overtime Pay: +$${item.overtimePay.toFixed(2)}`);
    doc.text(`Tax Deductions: -$${item.tax.toFixed(2)}`);
    doc.text(`Other Deductions: -$${item.deductions.toFixed(2)}`);
    doc.text('----------------------------------------------------');
    doc.fontSize(12).text(`Net Paid Salary: $${item.netSalary.toFixed(2)}`, { underline: true });
    doc.moveDown(2);

    doc.fontSize(8).text('Generated automatically by Task Management Payroll System. Confidential statement.', { align: 'center' });

    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', () => resolve(pdfPath));
      stream.on('error', reject);
    });
  }

  async getPayslipPath(user, itemId) {
    const item = await PayrollRepository.getPayrollItemById(itemId);
    if (!item) throw new Error('Payroll item not found.');

    // RBAC validation: Employees can only fetch own payslips
    if (user.role === 'EMPLOYEE') {
      const emp = await prisma.employee.findUnique({ where: { userId: user.id } });
      if (item.employeeId !== emp?.id) {
        throw new Error('Unauthorized: You cannot view this employee payslip.');
      }
    }

    const payslip = item.payslips[0];
    if (!payslip || !payslip.pdfPath) {
      throw new Error('Payslip PDF has not been generated for this item yet.');
    }

    return payslip.pdfPath;
  }
}

export default new PayrollService();
