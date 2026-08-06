import CandidateRepository from '../repositories/candidate.repository.js';
import NotificationService from './notification.service.js';
import ActivityService from './activity.service.js';
import { prisma } from '../config/db.js';

/**
 * AI-Ready Resume Parser Interface.
 * Allows plug-in implementation later without modifying recruitment workflow code.
 */
class ResumeParserInterface {
  async parseResume(filePath) {
    // Stub implementation for future AI integration
    return {
      skills: [],
      experienceYears: 0,
      education: null
    };
  }
}

class CandidateService {
  constructor() {
    this.resumeParser = new ResumeParserInterface();
  }

  async createCandidate(user, data) {
    // Duplicate prevention checks
    const exists = await CandidateRepository.getByEmailAndPhone(data.email, data.phone);
    if (exists) {
      throw new Error(`Candidate with email ${data.email} or phone ${data.phone} already exists.`);
    }

    const candidate = await CandidateRepository.create(data);

    // Initial stage history
    const emp = await prisma.employee.findUnique({ where: { userId: user.id } });
    if (emp) {
      await CandidateRepository.addStageHistory({
        candidateId: candidate.id,
        stage: 'Applied',
        changedById: emp.id
      });
    }

    // Log Activity
    await ActivityService.logActivity({
      userId: user.id,
      action: 'CREATE',
      entityType: 'CANDIDATE',
      entityId: candidate.id,
      description: `Candidate profile registered for ${candidate.firstName} ${candidate.lastName}.`
    });

    return candidate;
  }

  async updateCandidate(user, id, data) {
    const candidate = await CandidateRepository.update(id, data);
    return candidate;
  }

  async changeStage(user, id, stage) {
    const emp = await prisma.employee.findUnique({ where: { userId: user.id } });
    if (!emp) throw new Error('HR or Manager Employee record not resolved.');

    const candidate = await CandidateRepository.update(id, { status: stage });

    // Track stage log
    await CandidateRepository.addStageHistory({
      candidateId: id,
      stage,
      changedById: emp.id
    });

    // Notify uploader/hiring manager
    await NotificationService.createNotification({
      userId: user.id,
      type: 'TASK_UPDATED',
      title: 'Candidate Pipeline Moved',
      message: `Applicant "${candidate.firstName} ${candidate.lastName}" transitioned to ${stage}.`,
      priority: 'LOW',
      entityType: 'CANDIDATE',
      entityId: id
    });

    return candidate;
  }

  async getCandidateById(user, id) {
    return CandidateRepository.getById(id);
  }

  async listCandidates(user, jobOpeningId = null) {
    return CandidateRepository.list(jobOpeningId);
  }

  async deleteCandidate(user, id) {
    return CandidateRepository.delete(id);
  }

  async linkDocument(user, candidateId, documentId, type) {
    return CandidateRepository.addDocument({
      candidateId,
      documentId,
      type
    });
  }

  /**
   * Complete candidate hiring pipeline workflow.
   * Executed within a single database transaction.
   */
  async hireCandidate(user, candidateId, employeeCode) {
    return prisma.$transaction(async (tx) => {
      // 1. Get candidate details
      const cand = await tx.candidate.findUnique({
        where: { id: candidateId },
        include: {
          job: true,
          documents: true
        }
      });
      if (!cand) throw new Error('Candidate details not found.');
      if (cand.status === 'HIRED') throw new Error('Candidate has already been hired.');

      // 2. Provision new User credentials profile
      const name = `${cand.firstName} ${cand.lastName}`;
      const newUser = await tx.user.create({
        data: {
          email: cand.email,
          name,
          role: 'EMPLOYEE',
          passwordHash: '$2b$10$H8yQZ9D7v5J2nS3lE4mF5oG6pQ7rR8sS9tT0uU1vV2wW3xX4yY5zZ' // Dummy secure hash
        }
      });

      // 3. Create Employee profile record
      const newEmp = await tx.employee.create({
        data: {
          employeeCode: employeeCode || `EMP-${Date.now().toString().slice(-4)}`,
          firstName: cand.firstName,
          lastName: cand.lastName,
          email: cand.email,
          phone: cand.phone,
          designation: cand.job.title,
          status: 'ACTIVE',
          hireDate: new Date(),
          userId: newUser.id,
          departmentId: cand.job.departmentId,
          managerId: cand.job.hiringManagerId
        }
      });

      // 4. Move attachments (e.g. resumes, portfolios) to new Employee scope
      for (const docRef of cand.documents) {
        await tx.document.update({
          where: { id: docRef.documentId },
          data: {
            entityType: 'EMPLOYEE',
            entityId: newEmp.id
          }
        });
      }

      // Find any active project in the database
      let project = await tx.project.findFirst({
        where: { isDeleted: false }
      });

      // Fallback Company Onboarding project
      if (!project) {
        project = await tx.project.create({
          data: {
            name: 'Company Onboarding',
            code: `ONB-${Date.now().toString().slice(-4)}`,
            description: 'Employee onboarding operations and activities',
            status: 'ACTIVE',
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            departmentId: cand.job.departmentId
          }
        });
      }

      // 5. Assign employee welcome welcome checklist onboarding tasks
      await tx.task.create({
        data: {
          taskCode: `TSK-ONB-${Date.now().toString().slice(-4)}`,
          title: 'Complete Employee Onboarding',
          description: `Setup workflow credentials and verify handbook guidelines policy documents for new employee hire ${name}.`,
          status: 'TODO',
          priority: 'HIGH',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          projectId: project.id,
          createdById: newEmp.id,
          assignees: {
            create: { employeeId: newEmp.id }
          }
        }
      });

      // 6. Update candidate status to HIRED
      await tx.candidate.update({
        where: { id: candidateId },
        data: { status: 'HIRED' }
      });

      // 7. Track stage history log
      await tx.candidateStageHistory.create({
        data: {
          candidateId,
          stage: 'HIRED',
          changedById: newEmp.id
        }
      });

      // 8. Welcome alert notification
      await tx.notification.create({
        data: {
          userId: newUser.id,
          title: 'Welcome Aboard!',
          message: `Welcome to the team, ${name}! Your onboarding checklists have been set up.`,
          type: 'TASK_ASSIGNED',
          priority: 'HIGH',
          entityType: 'EMPLOYEE',
          entityId: newEmp.id
        }
      });

      // 9. Activity Log entries
      await tx.activityLog.create({
        data: {
          userId: user.id,
          action: 'CREATE',
          entityType: 'EMPLOYEE',
          entityId: newEmp.id,
          description: `Onboarding initiated for newly hired candidate: ${name}`,
          metadata: {},
          ipAddress: '127.0.0.1',
          userAgent: 'System/Recruitment'
        }
      });

      return { user: newUser, employee: newEmp };
    });
  }
}

export default new CandidateService();
