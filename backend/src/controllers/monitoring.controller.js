import MonitoringService from '../services/monitoring.service.js';
import HealthService from '../services/health.service.js';
import EmailService from '../services/email.service.js';
import SchedulerService from '../services/scheduler.service.js';

class MonitoringController {
  async getHealthMetrics(req, res, next) {
    try {
      const data = await HealthService.getHealthMetrics();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getMetricsHistory(req, res, next) {
    try {
      const data = await HealthService.getMetricsHistory();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getLogs(req, res, next) {
    try {
      const filters = {
        level: req.query.level,
        module: req.query.module,
        userId: req.query.userId,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };
      const data = await MonitoringService.listLogs(req.user, filters);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getErrors(req, res, next) {
    try {
      const filters = {
        module: req.query.module,
        resolutionStatus: req.query.resolutionStatus
      };
      const data = await MonitoringService.listErrors(req.user, filters);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async resolveError(req, res, next) {
    try {
      const data = await MonitoringService.resolveError(req.user, req.params.id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async listJobs(req, res, next) {
    try {
      const data = await SchedulerService.listJobs();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async runJob(req, res, next) {
    try {
      const data = await SchedulerService.runJob(req.params.id, 'MANUAL');
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async updateJob(req, res, next) {
    try {
      const data = await SchedulerService.updateJob(req.user, req.params.id, req.body);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async listJobExecutions(req, res, next) {
    try {
      const filters = { jobId: req.query.jobId, status: req.query.status };
      const data = await SchedulerService.listExecutions(filters);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getSmtpConfig(req, res, next) {
    try {
      const data = await EmailService.getSmtpConfig(req.user);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async updateSmtpConfig(req, res, next) {
    try {
      const data = await EmailService.updateSmtpConfig(req.user, req.body);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getEmailTemplates(req, res, next) {
    try {
      const data = await EmailService.getTemplates();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async sendTestEmail(req, res, next) {
    try {
      const data = await EmailService.sendTestEmail(req.user, req.body);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getEmailHistory(req, res, next) {
    try {
      const data = await EmailService.getEmailHistory();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
}

export default new MonitoringController();
