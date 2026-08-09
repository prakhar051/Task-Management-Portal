import { prisma } from '../config/db.js';

class RecommendationService {
  async generateRecommendations() {
    const list = [];

    // 1. Task workload recommendation checks
    const activeTasks = await prisma.task.findMany({
      where: { status: { in: ['TODO', 'IN_PROGRESS'] } },
      include: { assignees: { include: { employee: true } } }
    });

    const assigneeCounts = {};
    activeTasks.forEach((t) => {
      t.assignees.forEach((a) => {
        const name = `${a.employee?.firstName} ${a.employee?.lastName}`;
        assigneeCounts[name] = (assigneeCounts[name] || 0) + 1;
      });
    });

    // Flag overloaded employees (more than 3 active tasks)
    Object.entries(assigneeCounts).forEach(([name, count]) => {
      if (count > 3) {
        list.push({
          type: 'WORKLOAD',
          content: `Workload Alert: ${name} is assigned to ${count} active tasks. Consider reassigning priority tickets to avoid project bottlenecks.`
        });
      }
    });

    // 2. Risk warnings (Overdue tasks)
    const overdue = await prisma.task.findMany({
      where: {
        status: { in: ['TODO', 'IN_PROGRESS'] },
        dueDate: { lt: new Date() }
      },
      take: 3
    });

    overdue.forEach((t) => {
      list.push({
        type: 'RISK',
        content: `Deadline Warning: Task "${t.title}" was due on ${new Date(t.dueDate).toLocaleDateString()} but is still active.`
      });
    });

    // 3. Priority recommendations
    const highUnassigned = await prisma.task.findMany({
      where: {
        priority: 'HIGH',
        status: 'TODO',
        assignees: { none: {} }
      },
      take: 2
    });

    highUnassigned.forEach((t) => {
      list.push({
        type: 'PRIORITY',
        content: `Priority Alert: Task "${t.title}" is flagged HIGH priority but is currently unassigned.`
      });
    });

    if (list.length === 0) {
      list.push({
        type: 'PRIORITY',
        content: 'All task schedules are well balanced. No overloading or deadline delays flagged.'
      });
    }

    return list;
  }
}

export default new RecommendationService();
