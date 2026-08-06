import InterviewService from '../services/interview.service.js';

class InterviewController {
  async scheduleInterview(req, res, next) {
    try {
      const { panelEmployeeIds, ...data } = req.body;
      const result = await InterviewService.scheduleInterview(req.user, data, panelEmployeeIds);
      return res.status(201).json({
        success: true,
        message: 'Interview session scheduled successfully.',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async updateInterview(req, res, next) {
    try {
      const { panelEmployeeIds, ...data } = req.body;
      const result = await InterviewService.updateInterview(req.user, req.params.id, data, panelEmployeeIds);
      return res.status(200).json({
        success: true,
        message: 'Interview session schedule updated.',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async cancelInterview(req, res, next) {
    try {
      const result = await InterviewService.cancelInterview(req.user, req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Interview session cancelled.',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async getInterviewById(req, res, next) {
    try {
      const data = await InterviewService.getInterviewById(req.user, req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Interview details.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async listInterviews(req, res, next) {
    try {
      const data = await InterviewService.listInterviews(req.user);
      return res.status(200).json({
        success: true,
        message: 'Scheduled interviews roster.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async submitFeedback(req, res, next) {
    try {
      const data = await InterviewService.submitFeedback(req.user, {
        interviewId: req.params.id,
        ...req.body
      });
      return res.status(201).json({
        success: true,
        message: 'Interview score card feedback submitted.',
        data
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new InterviewController();
