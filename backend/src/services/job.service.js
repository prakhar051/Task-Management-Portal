import JobRepository from '../repositories/job.repository.js';
import ActivityService from './activity.service.js';

class JobService {
  async createJob(user, data) {
    const job = await JobRepository.create(data);

    // Audit log
    await ActivityService.logActivity({
      userId: user.id,
      action: 'CREATE',
      entityType: 'JOB',
      entityId: job.id,
      description: `Created job opening "${job.title}" under Department ID: ${data.departmentId}`,
      metadata: { after: job }
    });

    return job;
  }

  async updateJob(user, id, data) {
    const job = await JobRepository.update(id, data);

    // Audit log
    await ActivityService.logActivity({
      userId: user.id,
      action: 'UPDATE',
      entityType: 'JOB',
      entityId: id,
      description: `Updated job opening details for "${job.title}"`,
      metadata: { after: job }
    });

    return job;
  }

  async getJobById(user, id) {
    return JobRepository.getById(id);
  }

  async listJobs(user) {
    return JobRepository.list();
  }

  async deleteJob(user, id) {
    return JobRepository.delete(id);
  }

  async setupDefaultStages(user) {
    const defaults = [
      { name: 'Applied', sequence: 1 },
      { name: 'Screening', sequence: 2 },
      { name: 'Shortlisted', sequence: 3 },
      { name: 'Interview', sequence: 4 },
      { name: 'Offered', sequence: 5 },
      { name: 'Hired', sequence: 6 }
    ];

    return Promise.all(defaults.map((stage) => JobRepository.createStage(stage)));
  }

  async listStages(user) {
    let stages = await JobRepository.listStages();
    if (stages.length === 0) {
      // Seed dynamically
      stages = await this.setupDefaultStages(user);
    }
    return stages;
  }
}

export default new JobService();
