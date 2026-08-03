import CalendarService from '../services/calendar.service.js';

class CalendarController {
  async getCalendarFeed(req, res, next) {
    try {
      const data = await CalendarService.getUnifiedFeed(req.user, req.query);
      return res.status(200).json({
        success: true,
        message: 'Unified calendar events retrieved successfully.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async getTeamFeed(req, res, next) {
    try {
      // Force fetching department events scope
      const filters = { ...req.query };
      const data = await CalendarService.getUnifiedFeed(req.user, filters);
      return res.status(200).json({
        success: true,
        message: 'Team calendar events retrieved successfully.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async getUpcomingEvents(req, res, next) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 5;
      const data = await CalendarService.getUpcomingEvents(req.user, limit);
      return res.status(200).json({
        success: true,
        message: 'Upcoming events list retrieved successfully.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async createEvent(req, res, next) {
    try {
      let data;
      if (req.body.recurrenceRule) {
        data = await CalendarService.createRecurringEvent(req.user, req.body);
      } else {
        data = await CalendarService.createEvent(req.user, req.body);
      }
      return res.status(201).json({
        success: true,
        message: 'Calendar event created successfully.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async updateEvent(req, res, next) {
    try {
      let data;
      // Check if drag-and-drop update is requested
      if (req.query.drag === 'true' || req.body.isDragMove === true) {
        data = await CalendarService.handleDragDrop(
          req.user,
          req.params.id,
          req.body.type,
          req.body.startDate,
          req.body.endDate
        );
      } else {
        data = await CalendarService.updateEvent(req.user, req.params.id, req.body);
      }

      return res.status(200).json({
        success: true,
        message: 'Calendar event updated successfully.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteEvent(req, res, next) {
    try {
      await CalendarService.deleteEvent(req.user, req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Calendar event deleted successfully.'
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new CalendarController();
