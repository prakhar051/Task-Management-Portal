import JobRepository from '../repositories/job.repository.js';
import NotificationService from './notification.service.js';
import ActivityService from './activity.service.js';
import { prisma } from '../config/db.js';

class SchedulerService {
  constructor() {
    this.timers = new Map();
  }

  async initializeJobs() {
    // Register default scheduled jobs
    const defaultJobs = [
      { name: 'Payroll Generation', cronExpr: '0 0 1 * *', status: 'ENABLED' },
      { name: 'Attendance Summary', cronExpr: '0 23 * * *', status: 'ENABLED' },
      { name: 'File Cleanup', cronExpr: '0 2 * * *', status: 'ENABLED' },
      { name: 'Daily Backup Run', cronExpr: '0 3 * * *', status: 'ENABLED' }
    ];

    for (const def of defaultJobs) {
      let job = await JobRepository.getJobByName(def.name);
      if (!job) {
        await JobRepository.createJob(def);
      }
    }

    // Schedule active timers (simulated using runtime intervals to represent cron triggers)
    const jobs = await JobRepository.listJobs();
    for (const job of jobs) {
      if (job.status === 'ENABLED') {
        this.scheduleJobTimer(job);
      }
    }
  }

  scheduleJobTimer(job) {
    if (this.timers.has(job.id)) {
      clearInterval(this.timers.get(job.id));
    }

    // Run every 10 minutes to verify triggers (simulated cron interval)
    const intervalId = setInterval(async () => {
      try {
        await this.runJob(job.id, 'SYSTEM');
      } catch (err) {
        console.error(`Automatic cron run failed for ${job.name}:`, err.message);
      }
    }, 10 * 60 * 1000);

    this.timers.set(job.id, intervalId);
  }

  async runJob(id, triggerSource = 'MANUAL') {
    const job = await JobRepository.getJobById(id);
    if (!job) throw new Error('Target scheduled job not found.');

    const startTime = Date.now();
    const execution = await JobRepository.createExecution({
      jobId: job.id,
      status: 'RUNNING'
    });

    let logs = `Initiating execution for job: "${job.name}". Trigger source: ${triggerSource}.\n`;
    let status = 'SUCCESS';
    let errorMsg = null;

    // Retry configurations
    const maxRetries = 3;
    let attempt = 0;
    let success = false;

    while (attempt < maxRetries && !success) {
      attempt++;
      if (attempt > 1) {
        const backoffMs = Math.pow(2, attempt) * 1000; // Exponential backoff (e.g. 4s, 8s)
        logs += `Attempt ${attempt - 1} failed. Retrying in ${backoffMs / 1000}s...\n`;
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }

      try {
        // Simulate/trigger active tasks based on job name
        if (job.name === 'Daily Backup Run') {
          const BackupService = (await import('./backup.service.js')).default;
          await BackupService.triggerBackup(null, 'SCHEDULED', 'ALL');
          logs += 'Backup task dispatched to async queue.\n';
        } else {
          logs += `Executing routine task code logs for job: ${job.name}\n`;
        }
        logs += 'Job completed successfully.\n';
        success = true;
      } catch (err) {
        errorMsg = err.message;
        logs += `Attempt ${attempt} failed with error: ${err.message}\n`;
      }
    }

    if (!success) {
      status = 'FAILED';
      logs += `Dead Letter Queue: Job failed permanently after ${maxRetries} retry attempts.\n`;

      // Dispatch failure notifications to system administrators
      const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
      if (adminUser) {
        await NotificationService.createNotification({
          userId: adminUser.id,
          title: `Job Failure: ${job.name} (DLQ)`,
          message: `Cron Job ${job.name} execution failed permanently (Moved to DLQ). Last error: ${errorMsg}`,
          type: 'TASK_UPDATED',
          priority: 'HIGH',
          entityType: 'SCHEDULED_JOB',
          entityId: job.id
        });
      }
    }

    const durationMs = Date.now() - startTime;
    await JobRepository.updateExecution(execution.id, {
      status,
      durationMs,
      logs,
      error: errorMsg
    });

    await JobRepository.updateJob(job.id, {
      lastRun: new Date(),
      nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000) // Next run + 24h
    });

    return { ...job, execution };
  }

  async updateJob(user, id, data) {
    const job = await JobRepository.updateJob(id, data);
    
    // Refresh active timer triggers
    if (job.status === 'ENABLED') {
      this.scheduleJobTimer(job);
    } else {
      if (this.timers.has(job.id)) {
        clearInterval(this.timers.get(job.id));
        this.timers.delete(job.id);
      }
    }

    await ActivityService.logActivity({
      userId: user.id,
      action: 'UPDATE',
      entityType: 'SCHEDULED_JOB',
      entityId: job.id,
      description: `Job "${job.name}" settings updated to ${job.status}`
    });

    return job;
  }

  async listJobs() {
    return JobRepository.listJobs();
  }

  async listExecutions(filters = {}) {
    return JobRepository.listExecutions(filters);
  }
}

export default new SchedulerService();
