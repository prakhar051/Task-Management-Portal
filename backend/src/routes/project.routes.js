import express from 'express';
import { ProjectController } from '../controllers/project.controller.js';
import { authenticateUser, authorizeRoles } from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply auth middleware globally to all project routes
router.use(authenticateUser);

// 1. Global statistics & export endpoints (mounted before parameter matchers to prevent collision)
router.get('/statistics', ProjectController.getGlobalStatistics);
router.get('/export', authorizeRoles('ADMIN', 'MANAGER'), ProjectController.exportProjects);

// 2. Bulk operations endpoints (ADMIN only, mounted before parameter matchers)
router.delete('/bulk', authorizeRoles('ADMIN'), ProjectController.bulkDelete);
router.patch('/bulk-status', authorizeRoles('ADMIN'), ProjectController.bulkUpdateStatus);
router.patch('/bulk-restore', authorizeRoles('ADMIN'), ProjectController.bulkRestore);

// 3. Primary CRUD directory operations endpoints
router.get('/', ProjectController.listProjects);
router.post('/', authorizeRoles('ADMIN'), ProjectController.createProject);

// 4. Project detail and specific sub-resource endpoints
router.get('/:id', ProjectController.getProject);
router.patch('/:id', authorizeRoles('ADMIN'), ProjectController.updateProject);
router.delete('/:id', authorizeRoles('ADMIN'), ProjectController.deleteProject);
router.patch('/:id/restore', authorizeRoles('ADMIN'), ProjectController.restoreProject);

// 5. Manager and workforce member assignment endpoints
router.patch('/:id/manager', authorizeRoles('ADMIN'), ProjectController.assignManager);
router.patch('/:id/members', authorizeRoles('ADMIN'), ProjectController.assignMembers);
router.get('/:id/members', ProjectController.getMembers);

// 6. Project specific stats indicators
router.get('/:id/statistics', ProjectController.getSpecificStatistics);

export default router;
