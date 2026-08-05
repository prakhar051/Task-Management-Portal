import { Router } from 'express';
import { authenticateUser, authorizeRoles } from '../middleware/auth.middleware.js';
import SalaryController from '../controllers/salary.controller.js';

const router = Router();

router.use(authenticateUser);

// Manage structure triggers (Scoped to Admin and HR roles only)
router.get('/', authorizeRoles('ADMIN', 'HR'), SalaryController.listStructures);
router.post('/', authorizeRoles('ADMIN', 'HR'), SalaryController.createStructure);
router.get('/employee/:employeeId', authorizeRoles('ADMIN', 'HR'), SalaryController.getStructureByEmployeeId);
router.patch('/employee/:employeeId', authorizeRoles('ADMIN', 'HR'), SalaryController.updateStructure);

export default router;
