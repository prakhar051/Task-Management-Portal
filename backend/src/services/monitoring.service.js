import MonitoringRepository from '../repositories/monitoring.repository.js';
import ActivityService from './activity.service.js';

class MonitoringService {
  async listLogs(user, filters = {}) {
    return MonitoringRepository.listSystemLogs(filters);
  }

  async listErrors(user, filters = {}) {
    return MonitoringRepository.listErrorLogs(filters);
  }

  async resolveError(user, id) {
    const updated = await MonitoringRepository.updateErrorLog(id, {
      resolutionStatus: 'RESOLVED'
    });

    await ActivityService.logActivity({
      userId: user.id,
      action: 'UPDATE',
      entityType: 'ERROR_LOG',
      entityId: id,
      description: `Resolved system error: "${updated.message.slice(0, 50)}"`
    });

    return updated;
  }
}

export default new MonitoringService();
