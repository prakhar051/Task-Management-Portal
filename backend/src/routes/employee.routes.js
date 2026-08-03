import { Router } from 'express';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  restoreEmployee,
  updateAvatar,
  bulkDelete,
  bulkUpdateStatus,
  bulkRestore,
  exportEmployees
} from '../controllers/employee.controller.js';
import { authenticateUser, authorizeRoles } from '../middleware/auth.middleware.js';
import { uploadAvatarMiddleware } from '../utils/fileUpload.js';
import { asyncHandler } from '../middleware/async.middleware.js';

const router = Router();

// Apply authentication guard globally to all employee routes
router.use(authenticateUser);

// Export route (must be mounted before /:id path checks)
router.get('/export', authorizeRoles('ADMIN', 'MANAGER'), asyncHandler(exportEmployees));

// Bulk operations routes (must be mounted before /:id path checks)
router.delete('/bulk', authorizeRoles('ADMIN'), asyncHandler(bulkDelete));
router.patch('/bulk-status', authorizeRoles('ADMIN'), asyncHandler(bulkUpdateStatus));
router.patch('/bulk-restore', authorizeRoles('ADMIN'), asyncHandler(bulkRestore));

// Core CRUD routes
router.get('/', authorizeRoles('ADMIN', 'MANAGER'), asyncHandler(getEmployees));
router.post('/', authorizeRoles('ADMIN'), asyncHandler(createEmployee));

router.get('/:id', asyncHandler(getEmployeeById));
router.patch('/:id', asyncHandler(updateEmployee));
router.delete('/:id', authorizeRoles('ADMIN'), asyncHandler(deleteEmployee));
router.patch('/:id/restore', authorizeRoles('ADMIN'), asyncHandler(restoreEmployee));

// Avatar upload route
router.patch('/:id/avatar', uploadAvatarMiddleware, asyncHandler(updateAvatar));

export default router;
