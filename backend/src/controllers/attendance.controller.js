import AttendanceService from '../services/attendance.service.js';

class AttendanceController {
  async getAttendances(req, res, next) {
    try {
      const data = await AttendanceService.getAttendances(req.user, req.query);
      return res.status(200).json({
        success: true,
        message: 'Attendance logs retrieved successfully.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async checkIn(req, res, next) {
    try {
      const data = await AttendanceService.checkIn(req.user);
      return res.status(200).json({
        success: true,
        message: 'Clock-in completed and working session started.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async checkOut(req, res, next) {
    try {
      const data = await AttendanceService.checkOut(req.user);
      return res.status(200).json({
        success: true,
        message: 'Clock-out completed and working session completed.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async startBreak(req, res, next) {
    try {
      const data = await AttendanceService.startBreak(req.user);
      return res.status(200).json({
        success: true,
        message: 'Break session started successfully.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async endBreak(req, res, next) {
    try {
      const data = await AttendanceService.endBreak(req.user);
      return res.status(200).json({
        success: true,
        message: 'Break session ended and working session resumed.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async submitCorrectionRequest(req, res, next) {
    try {
      const data = await AttendanceService.submitCorrectionRequest(req.user, req.body);
      return res.status(201).json({
        success: true,
        message: 'Manual attendance correction request submitted successfully.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async getAttendanceRequests(req, res, next) {
    try {
      const data = await AttendanceService.getAttendanceRequests(req.user);
      return res.status(200).json({
        success: true,
        message: 'Attendance requests retrieved successfully.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async approveRequest(req, res, next) {
    try {
      const data = await AttendanceService.approveRequest(req.user, req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Attendance correction request approved and applied.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async rejectRequest(req, res, next) {
    try {
      const data = await AttendanceService.rejectRequest(req.user, req.params.id, req.body.rejectionReason);
      return res.status(200).json({
        success: true,
        message: 'Attendance correction request rejected.',
        data
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new AttendanceController();
