import { Router } from 'express';
import { TaskController } from '../controllers/task.controller.js';
import { authenticateUser, authorizeRoles } from '../middleware/auth.middleware.js';
import { uploadAttachmentMiddleware } from '../utils/fileUpload.js';

const router = Router();

// Protect all routes
router.use(authenticateUser);

// Export route (must be before :id to prevent route shadowing)
router.get('/export', TaskController.exportTasks);

// Bulk operations (Admin only)
router.delete('/bulk', authorizeRoles('ADMIN'), TaskController.bulkDelete);
router.patch('/bulk-status', authorizeRoles('ADMIN'), TaskController.bulkUpdateStatus);
router.patch('/bulk-priority', authorizeRoles('ADMIN'), TaskController.bulkUpdatePriority);
router.patch('/bulk-restore', authorizeRoles('ADMIN'), TaskController.bulkRestore);

// Comments edit and delete
router.patch('/comments/:commentId', TaskController.updateComment);
router.delete('/comments/:commentId', TaskController.deleteComment);

// Attachments deletion
router.delete('/attachments/:attachmentId', TaskController.deleteAttachment);

// Standard task CRUD
router.get('/', TaskController.listTasks);
router.get('/:id', TaskController.getTask);
router.post('/', authorizeRoles('ADMIN'), TaskController.createTask);
router.patch('/:id', TaskController.updateTask);
router.delete('/:id', authorizeRoles('ADMIN'), TaskController.deleteTask);
router.patch('/:id/restore', authorizeRoles('ADMIN'), TaskController.restoreTask);

// Inline metadata controllers
router.patch('/:id/status', TaskController.updateStatus);
router.patch('/:id/progress', TaskController.updateProgress);
router.patch('/:id/assignees', authorizeRoles('ADMIN'), TaskController.assignAssignees);
router.patch('/:id/dependencies', TaskController.updateDependencies);

// Comments and attachments nesting endpoints
router.post('/:id/comments', TaskController.addComment);
router.get('/:id/comments', TaskController.getComments);
router.post('/:id/attachments', uploadAttachmentMiddleware, TaskController.addAttachment);

export default router;
