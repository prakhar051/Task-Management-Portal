import express from 'express';
import CalendarController from '../controllers/calendar.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply auth middleware globally to all calendar endpoints
router.use(authenticateUser);

router.get('/', CalendarController.getCalendarFeed);
router.get('/team', CalendarController.getTeamFeed);
router.get('/upcoming', CalendarController.getUpcomingEvents);
router.post('/events', CalendarController.createEvent);
router.patch('/events/:id', CalendarController.updateEvent);
router.delete('/events/:id', CalendarController.deleteEvent);

export default router;
