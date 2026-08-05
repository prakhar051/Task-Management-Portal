import express from 'express';
import TimesheetController from '../controllers/timesheet.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticateUser);

router.get('/', TimesheetController.getTimesheets);
router.get('/monthly', TimesheetController.getMonthlySummary);
router.get('/export', TimesheetController.exportTimesheets);
router.get('/:id', TimesheetController.getTimesheetById);

export default router;
