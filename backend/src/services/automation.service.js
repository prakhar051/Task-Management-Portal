import AutomationRepository from '../repositories/automation.repository.js';
import NotificationService from './notification.service.js';
import { prisma } from '../config/db.js';
import { broadcastToAll } from '../utils/socket.js';

class AutomationService {
  async createRule(user, data) {
    return AutomationRepository.createRule({
      ...data,
      createdById: user.id
    });
  }

  async updateRule(user, id, data) {
    return AutomationRepository.updateRule(id, data);
  }

  async deleteRule(user, id) {
    return AutomationRepository.deleteRule(id);
  }

  async listRules(filters) {
    return AutomationRepository.listRules(filters);
  }

  async getRule(user, id) {
    return AutomationRepository.getRuleById(id);
  }

  async listHistory(filters) {
    return AutomationRepository.listExecutions(filters);
  }

  // Trigger evaluation engine
  async trigger(triggerType, payload) {
    const rules = await AutomationRepository.listRules({ trigger: triggerType, status: 'ACTIVE' });
    
    for (const rule of rules) {
      let isMatch = true;

      // 1. Conditions check (e.g. check status filter matches)
      if (rule.conditions) {
        try {
          const conditions = JSON.parse(rule.conditions);
          for (const [key, value] of Object.entries(conditions)) {
            if (payload[key] !== value) {
              isMatch = false;
              break;
            }
          }
        } catch (e) {
          isMatch = false;
        }
      }

      if (!isMatch) continue;

      // 2. Perform Action execution
      try {
        let actionDetails = '';
        if (rule.action === 'NOTIFY_MANAGER') {
          // Resolve manager id from payload or config
          const managerId = payload.managerId || payload.project?.managerId || payload.createdBy?.managerId;
          if (managerId) {
            const managerEmployee = await prisma.employee.findUnique({
              where: { id: managerId }
            });
            if (managerEmployee?.userId) {
              await NotificationService.createNotification({
                userId: managerEmployee.userId,
                type: 'TASK_ASSIGNED',
                title: 'Automation: Manager Alert',
                message: `Workflow Automation rule "${rule.title}" triggered: Action registered.`,
                priority: 'MEDIUM',
                entityType: 'AUTOMATION',
                entityId: rule.id
              });
              actionDetails = `Dispatched notification to manager userId ${managerEmployee.userId}`;
            }
          } else {
            actionDetails = 'No associated manager resolved. Skip notification.';
          }
        } else if (rule.action === 'NOTIFY_EMPLOYEE') {
          const userId = payload.userId || payload.currentEmployee?.userId || payload.employee?.userId;
          if (userId) {
            await NotificationService.createNotification({
              userId,
              type: 'TASK_COMPLETED',
              title: 'Automation Action Triggered',
              message: `Rule "${rule.title}" has processed successfully.`,
              priority: 'LOW',
              entityType: 'AUTOMATION',
              entityId: rule.id
            });
            actionDetails = `Dispatched notification to employee userId ${userId}`;
          } else {
            actionDetails = 'No associated employee resolved.';
          }
        } else if (rule.action === 'UPDATE_CALENDAR') {
          // Schedule calendar event
          const date = payload.date || payload.dueDate || new Date();
          const calendarEvent = await prisma.calendarEvent.create({
            data: {
              title: `Automation: ${rule.title}`,
              description: `Triggered by rule ${rule.id} execution workflow.`,
              type: 'MILESTONE',
              startDate: new Date(date),
              endDate: new Date(new Date(date).getTime() + 60 * 60 * 1000)
            }
          });
          actionDetails = `Scheduled calendar event: ${calendarEvent.id}`;
          broadcastToAll('calendar:update', { eventVersion: 1 });
        } else if (rule.action === 'CREATE_EMPLOYEE') {
          // Trigger candidate hired to employee onboarding
          const candidateId = payload.candidateId || payload.id;
          if (candidateId) {
            const candidate = await prisma.candidate.findUnique({
              where: { id: candidateId }
            });
            if (candidate) {
              const count = await prisma.employee.count();
              const employee = await prisma.employee.create({
                data: {
                  employeeCode: `EMP-AUTO-${count + 1}`,
                  firstName: candidate.firstName,
                  lastName: candidate.lastName,
                  email: candidate.email,
                  phone: candidate.phone || '0000000000',
                  designation: 'Hired Candidate',
                  hireDate: new Date(),
                  status: 'ACTIVE'
                }
              });
              actionDetails = `Transferred Candidate ${candidate.id} to Employee ${employee.id}`;
            }
          }
        }

        // Log successful run
        await AutomationRepository.logExecution({
          ruleId: rule.id,
          triggerPayload: JSON.stringify(payload),
          actionResult: actionDetails || 'Action executed successfully.',
          status: 'SUCCESS'
        });

      } catch (err) {
        // Log failure log
        await AutomationRepository.logExecution({
          ruleId: rule.id,
          triggerPayload: JSON.stringify(payload),
          errorMessage: err.message,
          status: 'FAILED'
        });
      }
    }
  }

  // Trigger manual rules execution
  async runRuleManually(user, id) {
    const rule = await AutomationRepository.getRuleById(id);
    if (!rule) throw new Error('Rule not found.');
    await this.trigger(rule.trigger, { manual: true, triggeredBy: user.name });
    return { success: true };
  }
}

export default new AutomationService();
