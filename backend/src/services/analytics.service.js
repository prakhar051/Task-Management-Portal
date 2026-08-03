import AnalyticsRepository from '../repositories/analytics.repository.js';
import CacheService from '../utils/cache.js';
import { prisma } from '../config/db.js';

class AnalyticsService {
  /**
   * Helper method to map and build query parameters according to RBAC constraints.
   */
  async buildRbacWhere(user, entityType, filters = {}) {
    const where = { isDeleted: false };

    // Apply general Date Range (based on createdAt)
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }

    // Apply general Status
    if (filters.status && entityType !== 'EMPLOYEE' && entityType !== 'DEPARTMENT') {
      where.status = filters.status;
    }

    if (user.role === 'ADMIN') {
      if (filters.departmentId) {
        if (entityType === 'EMPLOYEE') where.departmentId = filters.departmentId;
        if (entityType === 'PROJECT') where.departmentId = filters.departmentId;
        if (entityType === 'TASK') where.project = { departmentId: filters.departmentId };
      }
      if (filters.projectId && entityType === 'TASK') {
        where.projectId = filters.projectId;
      }
      if (filters.employeeId) {
        if (entityType === 'TASK') {
          where.assignees = { some: { employeeId: filters.employeeId } };
        }
      }
    } else if (user.role === 'MANAGER') {
      const managerEmp = await prisma.employee.findUnique({
        where: { userId: user.id }
      });
      if (!managerEmp || !managerEmp.departmentId) {
        where.id = 'none';
        return where;
      }

      // Restrict scope to department
      if (entityType === 'EMPLOYEE') {
        where.departmentId = managerEmp.departmentId;
      } else if (entityType === 'DEPARTMENT') {
        where.id = managerEmp.departmentId;
      } else if (entityType === 'PROJECT') {
        where.departmentId = managerEmp.departmentId;
      } else if (entityType === 'TASK') {
        where.project = { departmentId: managerEmp.departmentId };
      }
    } else if (user.role === 'EMPLOYEE') {
      const emp = await prisma.employee.findUnique({
        where: { userId: user.id }
      });
      if (!emp) {
        where.id = 'none';
        return where;
      }

      // Restrict scope to personal
      if (entityType === 'EMPLOYEE') {
        where.id = emp.id;
      } else if (entityType === 'DEPARTMENT') {
        where.id = emp.departmentId || 'none';
      } else if (entityType === 'PROJECT') {
        where.OR = [
          { managerId: emp.id },
          { members: { some: { employeeId: emp.id } } }
        ];
      } else if (entityType === 'TASK') {
        where.assignees = { some: { employeeId: emp.id } };
      }
    }

    return where;
  }

  /**
   * Helper method to resolve cache values or trigger fallback.
   */
  async resolveCachedQuery(cacheKey, queryFn, ttlSeconds = 60) {
    const cached = await CacheService.get(cacheKey);
    if (cached) {
      return cached;
    }
    const fresh = await queryFn();
    await CacheService.set(cacheKey, fresh, ttlSeconds);
    return fresh;
  }

  async getOverview(user, filters = {}) {
    const cacheKey = `analytics_overview_${user.id}_${JSON.stringify(filters)}`;
    return this.resolveCachedQuery(cacheKey, async () => {
      const taskWhere = await this.buildRbacWhere(user, 'TASK', filters);
      const projectWhere = await this.buildRbacWhere(user, 'PROJECT', filters);
      const employeeWhere = await this.buildRbacWhere(user, 'EMPLOYEE', filters);
      const deptWhere = await this.buildRbacWhere(user, 'DEPARTMENT', filters);

      const taskStats = await AnalyticsRepository.getTaskStats(taskWhere);
      const projectStats = await AnalyticsRepository.getProjectStats(projectWhere);
      const employeeStats = await AnalyticsRepository.getEmployeeStats(employeeWhere);
      const deptStats = await AnalyticsRepository.getDepartmentStats(deptWhere);
      const productivityStats = await AnalyticsRepository.getProductivityStats(taskWhere);

      return {
        taskStats,
        projectStats,
        employeeStats,
        deptStats,
        productivityStats
      };
    });
  }

  async getEmployees(user, filters = {}) {
    const cacheKey = `analytics_employees_${user.id}_${JSON.stringify(filters)}`;
    return this.resolveCachedQuery(cacheKey, async () => {
      const where = await this.buildRbacWhere(user, 'EMPLOYEE', filters);
      return AnalyticsRepository.getEmployeeStats(where);
    });
  }

  async getDepartments(user, filters = {}) {
    const cacheKey = `analytics_departments_${user.id}_${JSON.stringify(filters)}`;
    return this.resolveCachedQuery(cacheKey, async () => {
      const where = await this.buildRbacWhere(user, 'DEPARTMENT', filters);
      return AnalyticsRepository.getDepartmentStats(where);
    });
  }

  async getProjects(user, filters = {}) {
    const cacheKey = `analytics_projects_${user.id}_${JSON.stringify(filters)}`;
    return this.resolveCachedQuery(cacheKey, async () => {
      const where = await this.buildRbacWhere(user, 'PROJECT', filters);
      return AnalyticsRepository.getProjectStats(where);
    });
  }

  async getTasks(user, filters = {}) {
    const cacheKey = `analytics_tasks_${user.id}_${JSON.stringify(filters)}`;
    return this.resolveCachedQuery(cacheKey, async () => {
      const where = await this.buildRbacWhere(user, 'TASK', filters);
      return AnalyticsRepository.getTaskStats(where);
    });
  }

  async getProductivity(user, filters = {}) {
    const cacheKey = `analytics_productivity_${user.id}_${JSON.stringify(filters)}`;
    return this.resolveCachedQuery(cacheKey, async () => {
      const where = await this.buildRbacWhere(user, 'TASK', filters);
      return AnalyticsRepository.getProductivityStats(where);
    });
  }
}

export default new AnalyticsService();
