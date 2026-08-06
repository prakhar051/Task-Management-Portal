import { Router } from 'express';
import { authenticateUser, authorizeRoles } from '../middleware/auth.middleware.js';
import JobController from '../controllers/job.controller.js';

const router = Router();

router.use(authenticateUser);

// Read-only pipelines visible to Managers as well
router.get('/', authorizeRoles('ADMIN', 'MANAGER'), JobController.listJobs);
router.get('/stages', authorizeRoles('ADMIN', 'MANAGER'), JobController.listStages);
router.get('/:id', authorizeRoles('ADMIN', 'MANAGER'), JobController.getJobById);

// Create, Update, Delete Job openings restricted to Admin and HR roles only
router.post('/', authorizeRoles('ADMIN'), JobController.createJob);
router.patch('/:id', authorizeRoles('ADMIN'), JobController.updateJob);
router.delete('/:id', authorizeRoles('ADMIN'), JobController.deleteJob);

export default router;
