export class DashboardService {
  // Generates metrics card counters mapped to role contexts
  static async getOverview(role, userId) {
    if (role === 'ADMIN') {
      return {
        totalEmployees: 24,
        totalDepartments: 4,
        totalProjects: 8,
        activeProjects: 5,
        completedProjects: 3,
        totalTasks: 210,
        pendingTasks: 42,
        completedTasks: 168,
        overdueTasks: 3
      };
    } else if (role === 'MANAGER') {
      return {
        totalEmployees: 8, // Team size
        totalDepartments: 1,
        totalProjects: 3, // Projects managed
        activeProjects: 2,
        completedProjects: 1,
        totalTasks: 64,
        pendingTasks: 18,
        completedTasks: 46,
        overdueTasks: 1
      };
    } else {
      // EMPLOYEE role context
      return {
        totalEmployees: 0, // Not applicable
        totalDepartments: 0,
        totalProjects: 2, // Projects assigned to
        activeProjects: 2,
        completedProjects: 0,
        totalTasks: 12, // Tasks assigned
        pendingTasks: 4,
        completedTasks: 8,
        overdueTasks: 0
      };
    }
  }

  // Generates recent operations logs
  static async getActivityLogs(role, userId) {
    const allActivities = [
      { id: 'act_1', userId: 'usr_admin_1', user: 'Admin Operator', action: 'PROJECT_CREATED', details: "Project 'Task Management Portal' created", timestamp: new Date(Date.now() - 3600000).toISOString() },
      { id: 'act_2', userId: 'usr_manager_1', user: 'Jane Manager', action: 'TASK_ASSIGNED', details: "Task 'Database Migration' assigned to John Doe", timestamp: new Date(Date.now() - 7200000).toISOString() },
      { id: 'act_3', userId: 'usr_emp_1', user: 'John Doe', action: 'STATUS_UPDATED', details: "Task 'Setup Gitignore' changed from To-Do to Completed", timestamp: new Date(Date.now() - 10800000).toISOString() },
      { id: 'act_4', userId: 'usr_admin_1', user: 'Admin Operator', action: 'USER_REGISTERED', details: "New employee account created for 'Jane Doe'", timestamp: new Date(Date.now() - 86400000).toISOString() }
    ];

    if (role === 'ADMIN') {
      return allActivities;
    } else if (role === 'MANAGER') {
      // Filter manager-specific activities
      return allActivities.slice(1, 3);
    } else {
      // Filter employee-specific activities
      return allActivities.slice(2, 3);
    }
  }

  // Generates notification alerts
  static async getNotifications(userId) {
    return [
      { id: 'not_1', userId, message: "New task 'Secure JWT Handshake' assigned to you by Jane Manager", read: false, type: 'ASSIGNMENT', createdAt: new Date(Date.now() - 1800000).toISOString() },
      { id: 'not_2', userId, message: "Reminder: Task 'Prisma Configuration' is due tomorrow", read: false, type: 'DEADLINE', createdAt: new Date(Date.now() - 14400000).toISOString() },
      { id: 'not_3', userId, message: "Project 'Analytics Suite' status updated to Completed", read: true, type: 'STATUS_UPDATE', createdAt: new Date(Date.now() - 86400000).toISOString() }
    ];
  }

  // Generates structured datasets for Recharts graphics
  static async getChartData(role, userId) {
    const tasksByStatus = [
      { name: 'To-Do', value: 15, fill: '#64748b' },
      { name: 'In Progress', value: 25, fill: '#3b4ee0' },
      { name: 'Completed', value: 60, fill: '#10b981' }
    ];

    const tasksByPriority = [
      { name: 'Low', value: 45, fill: '#3b82f6' },
      { name: 'Medium', value: 35, fill: '#f59e0b' },
      { name: 'High', value: 20, fill: '#ef4444' }
    ];

    const projectsByStatus = [
      { name: 'To-Do', count: 2 },
      { name: 'In Progress', count: 4 },
      { name: 'Completed', count: 2 }
    ];

    const weeklyTaskCompletion = [
      { day: 'Mon', completed: 4 },
      { day: 'Tue', completed: 8 },
      { day: 'Wed', completed: 5 },
      { day: 'Thu', completed: 10 },
      { day: 'Fri', completed: 7 },
      { day: 'Sat', completed: 2 },
      { day: 'Sun', completed: 1 }
    ];

    const monthlyPerformance = [
      { month: 'Jan', score: 68 },
      { month: 'Feb', score: 75 },
      { month: 'Mar', score: 82 },
      { month: 'Apr', score: 78 },
      { month: 'May', score: 85 },
      { month: 'Jun', score: 92 }
    ];

    return {
      tasksByStatus,
      tasksByPriority,
      projectsByStatus,
      weeklyTaskCompletion,
      monthlyPerformance
    };
  }
}
