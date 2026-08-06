import InterviewRepository from '../repositories/interview.repository.js';
import CandidateRepository from '../repositories/candidate.repository.js';
import NotificationService from './notification.service.js';
import ActivityService from './activity.service.js';
import { prisma } from '../config/db.js';

class InterviewService {
  async scheduleInterview(user, data, panelEmployeeIds = []) {
    // 1. Get candidate details
    const cand = await CandidateRepository.getById(data.candidateId);
    if (!cand) throw new Error('Candidate not found.');

    const start = new Date(data.scheduledAt);
    const end = new Date(start.getTime() + (data.durationMinutes || 60) * 60 * 1000);

    // 2. Conflict Detection
    if (panelEmployeeIds.length > 0) {
      const hasConflict = await InterviewRepository.checkConflicts(panelEmployeeIds, start, end);
      if (hasConflict) {
        throw new Error('Scheduling Conflict: One or more panel members have overlapping calendar events at the specified time.');
      }
    }

    // 3. Create Calendar Event first
    const calendarEvent = await prisma.calendarEvent.create({
      data: {
        title: `Interview: ${cand.firstName} ${cand.lastName} (${data.type})`,
        description: `Scheduled interview: ${data.title}`,
        type: 'MEETING',
        startDate: start,
        endDate: end,
        employeeId: panelEmployeeIds[0] || null
      }
    });

    // 4. Create Interview record with calendar event ID
    const interviewData = {
      ...data,
      scheduledAt: start,
      calendarEventId: calendarEvent.id
    };

    const interview = await InterviewRepository.create(interviewData, panelEmployeeIds);

    // 5. Send push notifications
    if (panelEmployeeIds.length > 0) {
      const panelMembers = await prisma.employee.findMany({
        where: { id: { in: panelEmployeeIds } }
      });
      for (const member of panelMembers) {
        await NotificationService.createNotification({
          userId: member.userId,
          type: 'TASK_ASSIGNED',
          title: 'Interview Scheduled',
          message: `You are assigned to interview ${cand.firstName} ${cand.lastName} on ${start.toLocaleString()}.`,
          priority: 'MEDIUM',
          entityType: 'INTERVIEW',
          entityId: interview.id
        });
      }
    }

    // Log Activity
    await ActivityService.logActivity({
      userId: user.id,
      action: 'CREATE',
      entityType: 'INTERVIEW',
      entityId: interview.id,
      description: `Scheduled ${data.type} interview for candidate ${cand.firstName} ${cand.lastName}.`
    });

    return interview;
  }

  async updateInterview(user, id, data, panelEmployeeIds = null) {
    const start = data.scheduledAt ? new Date(data.scheduledAt) : null;
    const duration = data.durationMinutes || 60;

    const existing = await InterviewRepository.getById(id);
    if (!existing) throw new Error('Interview not found.');

    const updatedData = { ...data };
    if (start) {
      updatedData.scheduledAt = start;
    }

    // Update Calendar Event
    if (existing.calendarEventId && start) {
      const end = new Date(start.getTime() + duration * 60 * 1000);
      await prisma.calendarEvent.update({
        where: { id: existing.calendarEventId },
        data: {
          startDate: start,
          endDate: end,
          employeeId: panelEmployeeIds ? (panelEmployeeIds[0] || null) : undefined
        }
      });
    }

    const interview = await InterviewRepository.update(id, updatedData, panelEmployeeIds);

    // Log Activity
    await ActivityService.logActivity({
      userId: user.id,
      action: 'UPDATE',
      entityType: 'INTERVIEW',
      entityId: id,
      description: `Updated interview session specifications for Candidate Reference.`
    });

    return interview;
  }

  async cancelInterview(user, id) {
    const interview = await InterviewRepository.getById(id);
    if (!interview) throw new Error('Interview not found.');

    // Remove Calendar Event
    if (interview.calendarEventId) {
      await prisma.calendarEvent.delete({
        where: { id: interview.calendarEventId }
      });
    }

    const cancelled = await InterviewRepository.update(id, { status: 'CANCELLED' });

    // Notify Panel
    for (const member of interview.panelMembers) {
      await NotificationService.createNotification({
        userId: member.employee.userId,
        type: 'TASK_UPDATED',
        title: 'Interview Cancelled',
        message: `The interview session scheduled on ${new Date(interview.scheduledAt).toLocaleString()} has been cancelled.`,
        priority: 'LOW',
        entityType: 'INTERVIEW',
        entityId: id
      });
    }

    return cancelled;
  }

  async getInterviewById(user, id) {
    return InterviewRepository.getById(id);
  }

  async listInterviews(user) {
    return InterviewRepository.list();
  }

  async submitFeedback(user, feedbackData) {
    const emp = await prisma.employee.findUnique({ where: { userId: user.id } });
    if (!emp) throw new Error('Interviewer Employee profile not found.');

    const interview = await InterviewRepository.getById(feedbackData.interviewId);
    if (!interview) throw new Error('Interview not found.');

    const feedback = await InterviewRepository.submitFeedback({
      interviewId: feedbackData.interviewId,
      score: feedbackData.score,
      comments: feedbackData.comments,
      result: feedbackData.result,
      interviewerId: emp.id,
      candidateId: interview.candidate.id
    });

    // Log Activity
    await ActivityService.logActivity({
      userId: user.id,
      action: 'CREATE',
      entityType: 'INTERVIEW',
      entityId: feedback.interviewId,
      description: `Submitted interview round evaluation score: ${feedbackData.score}/10`
    });

    return feedback;
  }
}

export default new InterviewService();
