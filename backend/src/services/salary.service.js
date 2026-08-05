import SalaryRepository from '../repositories/salary.repository.js';
import ActivityService from './activity.service.js';

class SalaryService {
  async createStructure(user, data) {
    const structure = await SalaryRepository.createStructure(data);

    // Audit Log
    await ActivityService.logActivity({
      userId: user.id,
      action: 'CREATE',
      entityType: 'SALARY',
      entityId: structure.id,
      description: `Created salary structure for Employee ID: ${data.employeeId}`,
      metadata: { after: structure }
    });

    return structure;
  }

  async updateStructure(user, employeeId, data) {
    const structure = await SalaryRepository.updateStructure(employeeId, data);

    // Audit Log
    await ActivityService.logActivity({
      userId: user.id,
      action: 'UPDATE',
      entityType: 'SALARY',
      entityId: structure.id,
      description: `Updated salary structure for Employee ID: ${employeeId}`,
      metadata: { after: structure }
    });

    return structure;
  }

  async getStructureByEmployeeId(user, employeeId) {
    return SalaryRepository.getByEmployeeId(employeeId);
  }

  async listStructures(user) {
    return SalaryRepository.listStructures();
  }
}

export default new SalaryService();
