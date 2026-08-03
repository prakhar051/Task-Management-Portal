import LeaveService from '../services/leave.service.js';

class LeaveController {
  async getLeaves(req, res, next) {
    try {
      const data = await LeaveService.getLeaves(req.user, req.query);
      return res.status(200).json({
        success: true,
        message: 'Leave requests retrieved successfully.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async createLeave(req, res, next) {
    try {
      const data = await LeaveService.createLeave(req.user, req.body);
      return res.status(201).json({
        success: true,
        message: 'Leave request submitted successfully.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async cancelLeave(req, res, next) {
    try {
      const data = await LeaveService.cancelLeave(req.user, req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Leave request cancelled successfully.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async approveLeave(req, res, next) {
    try {
      const data = await LeaveService.approveLeave(req.user, req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Leave request approved and calendar events created.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async rejectLeave(req, res, next) {
    try {
      const data = await LeaveService.rejectLeave(req.user, req.params.id, req.body.rejectionReason);
      return res.status(200).json({
        success: true,
        message: 'Leave request rejected successfully.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteLeave(req, res, next) {
    try {
      await LeaveService.deleteLeave(req.user, req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Leave request deleted successfully.'
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new LeaveController();
