import JobService from '../services/job.service.js';

class JobController {
  async createJob(req, res, next) {
    try {
      const data = await JobService.createJob(req.user, req.body);
      return res.status(201).json({
        success: true,
        message: 'Job opening position published.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async updateJob(req, res, next) {
    try {
      const data = await JobService.updateJob(req.user, req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Job opening details updated.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async getJobById(req, res, next) {
    try {
      const data = await JobService.getJobById(req.user, req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Job opening details retrieved.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async listJobs(req, res, next) {
    try {
      const data = await JobService.listJobs(req.user);
      return res.status(200).json({
        success: true,
        message: 'Job openings catalogs.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteJob(req, res, next) {
    try {
      await JobService.deleteJob(req.user, req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Job opening record deleted.'
      });
    } catch (err) {
      next(err);
    }
  }

  async listStages(req, res, next) {
    try {
      const data = await JobService.listStages(req.user);
      return res.status(200).json({
        success: true,
        message: 'Hiring pipeline stages retrieved.',
        data
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new JobController();
