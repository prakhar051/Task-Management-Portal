import { Router } from 'express';
import { authenticateUser, authorizeRoles } from '../middleware/auth.middleware.js';
import PayrollController from '../controllers/payroll.controller.js';

const router = Router();

router.use(authenticateUser);

// Payslip download and personal histories scopes are visible to Employees too
router.get('/payslip/:itemId', PayrollController.downloadPayslip);
router.get('/history/:employeeId', PayrollController.getEmployeePayrollHistory);

// Managing overall payroll run runs restricted to Admin and HR roles only
router.get('/', authorizeRoles('ADMIN', 'HR'), PayrollController.listPayrolls);
router.get('/:id', authorizeRoles('ADMIN', 'HR'), PayrollController.getPayrollById);
router.post('/', authorizeRoles('ADMIN', 'HR'), PayrollController.generatePayroll);
router.patch('/:id/approve', authorizeRoles('ADMIN', 'HR'), PayrollController.approvePayroll);
router.patch('/:id/pay', authorizeRoles('ADMIN', 'HR'), PayrollController.payPayroll);
router.patch('/:id/cancel', authorizeRoles('ADMIN', 'HR'), PayrollController.cancelPayroll);

export default router;
