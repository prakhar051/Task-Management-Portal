import { prisma } from '../config/db.js';

class AnalyticsRepository {
  /**
   * Fetches employee count statistics.
   */
  async getEmployeeStats(where) {
    const total = await prisma.employee.count({ where });
    const active = await prisma.employee.count({
      where: { ...where, status: 'ACTIVE' }
    });
    const inactive = await prisma.employee.count({
      where: { ...where, status: 'INACTIVE' }
    });
    const onLeave = await prisma.employee.count({
      where: { ...where, status: 'ON_LEAVE' }
    });

    // Count new employees hired in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newHires = await prisma.employee.count({
      where: {
        ...where,
        hireDate: { gte: thirtyDaysAgo }
      }
    });

    return {
      totalEmployees: total,
      activeEmployees: active,
      inactiveEmployees: inactive,
      onLeave,
      newEmployees: newHires
    };
  }

  /**
   * Fetches department stats and distribution.
   */
  async getDepartmentStats(where) {
    // Total active departments
    const total = await prisma.department.count({ where });

    // Employee count and manager count per department
    const departmentsData = await prisma.department.findMany({
      where,
      select: {
        id: true,
        name: true,
        managerId: true,
        _count: {
          select: { employees: { where: { isDeleted: false } } }
        }
      }
    });

    const employeeDistribution = departmentsData.map((d) => ({
      departmentId: d.id,
      departmentName: d.name,
      employeeCount: d._count.employees
    }));

    const managerDistribution = departmentsData.map((d) => ({
      departmentId: d.id,
      departmentName: d.name,
      hasManager: !!d.managerId
    }));

    return {
      totalDepartments: total,
      employeeDistribution,
      managerDistribution
    };
  }

  /**
   * Fetches project metrics.
   */
  async getProjectStats(where) {
    const total = await prisma.project.count({ where });
    const active = await prisma.project.count({
      where: { ...where, status: 'ACTIVE' }
    });
    const completed = await prisma.project.count({
      where: { ...where, status: 'COMPLETED' }
    });
    const cancelled = await prisma.project.count({
      where: { ...where, status: 'CANCELLED' }
    });

    const aggregate = await prisma.project.aggregate({
      _avg: { progress: true },
      where
    });

    return {
      totalProjects: total,
      activeProjects: active,
      completedProjects: completed,
      cancelledProjects: cancelled,
      averageProgress: Math.round(aggregate._avg.progress || 0)
    };
  }

  /**
   * Fetches task metrics.
   */
  async getTaskStats(where) {
    const total = await prisma.task.count({ where });
    const completed = await prisma.task.count({
      where: { ...where, status: 'COMPLETED' }
    });
    const blocked = await prisma.task.count({
      where: { ...where, status: 'BLOCKED' }
    });
    const pending = await prisma.task.count({
      where: {
        ...where,
        status: { in: ['TODO', 'IN_PROGRESS', 'IN_REVIEW'] }
      }
    });

    // Overdue tasks: status != COMPLETED/CANCELLED and dueDate < now
    const now = new Date();
    const overdue = await prisma.task.count({
      where: {
        ...where,
        status: { notIn: ['COMPLETED', 'CANCELLED'] },
        dueDate: { lt: now }
      }
    });

    const aggregate = await prisma.task.aggregate({
      _avg: { completionPercentage: true },
      where
    });

    return {
      totalTasks: total,
      completedTasks: completed,
      pendingTasks: pending,
      blockedTasks: blocked,
      overdueTasks: overdue,
      averageCompletion: Math.round(aggregate._avg.completionPercentage || 0)
    };
  }

  /**
   * Fetches productivity metrics.
   */
  async getProductivityStats(where) {
    // 1. Fetch completed tasks count per employee
    const completedTasks = await prisma.task.findMany({
      where: {
        ...where,
        status: 'COMPLETED'
      },
      select: {
        assignees: {
          select: {
            employee: {
              select: { id: true, firstName: true, lastName: true }
            }
          }
        }
      }
    });

    const userProductivityMap = {};
    completedTasks.forEach((task) => {
      task.assignees.forEach((a) => {
        if (!a.employee) return;
        const name = `${a.employee.firstName} ${a.employee.lastName}`;
        userProductivityMap[name] = (userProductivityMap[name] || 0) + 1;
      });
    });

    const topPerformers = Object.entries(userProductivityMap)
      .map(([name, count]) => ({ name, tasksCompleted: count }))
      .sort((a, b) => b.tasksCompleted - a.tasksCompleted)
      .slice(0, 10);

    // 2. Fetch completed tasks count per department
    const departmentTasks = await prisma.task.findMany({
      where: {
        ...where,
        status: 'COMPLETED'
      },
      select: {
        project: {
          select: {
            department: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });

    const deptProductivityMap = {};
    departmentTasks.forEach((task) => {
      if (task.project?.department) {
        const name = task.project.department.name;
        deptProductivityMap[name] = (deptProductivityMap[name] || 0) + 1;
      }
    });

    const departmentProductivity = Object.entries(deptProductivityMap).map(([name, count]) => ({
      name,
      tasksCompleted: count
    }));

    // 3. Trends based on Task.updatedAt where status == COMPLETED
    const trendsRaw = await prisma.task.findMany({
      where: {
        ...where,
        status: 'COMPLETED'
      },
      select: {
        updatedAt: true
      },
      orderBy: {
        updatedAt: 'asc'
      }
    });

    const dailyTrendMap = {};
    const weeklyTrendMap = {};
    const monthlyTrendMap = {};

    trendsRaw.forEach((t) => {
      const date = new Date(t.updatedAt);
      
      // Daily: YYYY-MM-DD
      const dailyKey = date.toISOString().split('T')[0];
      dailyTrendMap[dailyKey] = (dailyTrendMap[dailyKey] || 0) + 1;

      // Monthly: YYYY-MM
      const monthlyKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyTrendMap[monthlyKey] = (monthlyTrendMap[monthlyKey] || 0) + 1;

      // Weekly: YYYY-Wxx
      const oneJan = new Date(date.getFullYear(), 0, 1);
      const numberOfDays = Math.floor((date - oneJan) / (24 * 60 * 60 * 1000));
      const weekNumber = Math.ceil((date.getDay() + 1 + numberOfDays) / 7);
      const weeklyKey = `${date.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
      weeklyTrendMap[weeklyKey] = (weeklyTrendMap[weeklyKey] || 0) + 1;
    });

    const dailyTrend = Object.entries(dailyTrendMap).map(([date, count]) => ({ date, count }));
    const weeklyTrend = Object.entries(weeklyTrendMap).map(([week, count]) => ({ week, count }));
    const monthlyTrend = Object.entries(monthlyTrendMap).map(([month, count]) => ({ month, count }));

    return {
      topPerformers,
      departmentProductivity,
      dailyTrend,
      weeklyTrend,
      monthlyTrend
    };
  }
}

export default new AnalyticsRepository();
