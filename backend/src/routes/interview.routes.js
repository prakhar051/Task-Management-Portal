import { Router } from 'express';
import { authenticateUser, authorizeRoles } from '../middleware/auth.middleware.js';
import InterviewController from '../controllers/interview.controller.js';

const router = Router();

router.use(authenticateUser);

router.get('/', authorizeRoles('ADMIN', 'MANAGER'), InterviewController.listInterviews);
router.get('/:id', authorizeRoles('ADMIN', 'MANAGER'), InterviewController.getInterviewById);

// Submit feedback scorecards (HR and Dept Managers can do this)
router.post('/:id/feedback', authorizeRoles('ADMIN', 'MANAGER'), InterviewController.submitFeedback);

// Schedule changes restricted to HR and Admin
router.post('/', authorizeRoles('ADMIN'), InterviewController.scheduleInterview);
router.patch('/:id', authorizeRoles('ADMIN'), InterviewController.updateInterview);
router.delete('/:id', authorizeRoles('ADMIN'), InterviewController.cancelInterview);

export default router;
