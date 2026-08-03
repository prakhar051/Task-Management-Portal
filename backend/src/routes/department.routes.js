import { Router } from 'express';
import {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  restoreDepartment,
  assignManager,
  getDepartmentEmployees,
  assignEmployees,
  getStatistics,
  bulkDelete,
  bulkUpdateStatus,
  bulkRestore,
  exportDepartments
} from '../controllers/department.controller.js';
import { authenticateUser, authorizeRoles } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/async.middleware.js';

const router = Router();

// Secure globally using auth validator middleware
router.use(authenticateUser);

// Roster analytics metrics - must be mounted before /:id parameter checks
router.get('/statistics', authorizeRoles('ADMIN', 'MANAGER'), asyncHandler(getStatistics));

// Export lists - must be mounted before /:id parameter checks
router.get('/export', authorizeRoles('ADMIN', 'MANAGER'), asyncHandler(exportDepartments));

// Bulk operations (ADMIN only) - must be mounted before /:id parameter checks
router.delete('/bulk', authorizeRoles('ADMIN'), asyncHandler(bulkDelete));
router.patch('/bulk-status', authorizeRoles('ADMIN'), asyncHandler(bulkUpdateStatus));
router.patch('/bulk-restore', authorizeRoles('ADMIN'), asyncHandler(bulkRestore));

// Core CRUD and assignment endpoints
router.get('/', asyncHandler(getDepartments));
router.post('/', authorizeRoles('ADMIN'), asyncHandler(createDepartment));

router.get('/:id', asyncHandler(getDepartmentById));
router.patch('/:id', authorizeRoles('ADMIN'), asyncHandler(updateDepartment));
router.delete('/:id', authorizeRoles('ADMIN'), asyncHandler(deleteDepartment));
router.patch('/:id/restore', authorizeRoles('ADMIN'), asyncHandler(restoreDepartment));

// Relationship assignment mappings endpoints
router.patch('/:id/manager', authorizeRoles('ADMIN'), asyncHandler(assignManager));
router.get('/:id/employees', asyncHandler(getDepartmentEmployees));
router.patch('/:id/employees', authorizeRoles('ADMIN'), asyncHandler(assignEmployees));

export default router;
