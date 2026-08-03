import express from 'express';
import LeaveController from '../controllers/leave.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply auth middleware globally to all leaves endpoints
router.use(authenticateUser);

router.get('/', LeaveController.getLeaves);
router.post('/', LeaveController.createLeave);
router.patch('/:id', LeaveController.cancelLeave);
router.delete('/:id', LeaveController.deleteLeave);
router.patch('/:id/approve', LeaveController.approveLeave);
router.patch('/:id/reject', LeaveController.rejectLeave);

export default router;
