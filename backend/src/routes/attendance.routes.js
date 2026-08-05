import express from 'express';
import AttendanceController from '../controllers/attendance.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticateUser);

router.get('/', AttendanceController.getAttendances);
router.get('/request', AttendanceController.getAttendanceRequests);
router.post('/check-in', AttendanceController.checkIn);
router.post('/check-out', AttendanceController.checkOut);
router.post('/break/start', AttendanceController.startBreak);
router.post('/break/end', AttendanceController.endBreak);
router.post('/request', AttendanceController.submitCorrectionRequest);
router.patch('/request/:id/approve', AttendanceController.approveRequest);
router.patch('/request/:id/reject', AttendanceController.rejectRequest);

export default router;
