import { prisma } from '../config/db.js';

class InterviewRepository {
  async create(data, panelEmployeeIds = []) {
    return prisma.$transaction(async (tx) => {
      const interview = await tx.interview.create({
        data,
        include: {
          candidate: true
        }
      });

      if (panelEmployeeIds.length > 0) {
        await Promise.all(
          panelEmployeeIds.map((employeeId) =>
            tx.interviewPanelMember.create({
              data: {
                interviewId: interview.id,
                employeeId
              }
            })
          )
        );
      }

      return tx.interview.findUnique({
        where: { id: interview.id },
        include: {
          candidate: { select: { firstName: true, lastName: true } },
          panelMembers: { include: { employee: { select: { id: true, firstName: true, lastName: true } } } }
        }
      });
    });
  }

  async update(id, data, panelEmployeeIds = null) {
    return prisma.$transaction(async (tx) => {
      const interview = await tx.interview.update({
        where: { id },
        data
      });

      if (panelEmployeeIds) {
        // Clear panel members
        await tx.interviewPanelMember.deleteMany({
          where: { interviewId: id }
        });

        // Add panel members
        await Promise.all(
          panelEmployeeIds.map((employeeId) =>
            tx.interviewPanelMember.create({
              data: {
                interviewId: id,
                employeeId
              }
            })
          )
        );
      }

      return tx.interview.findUnique({
        where: { id },
        include: {
          candidate: { select: { firstName: true, lastName: true } },
          panelMembers: { include: { employee: { select: { id: true, firstName: true, lastName: true } } } }
        }
      });
    });
  }

  async getById(id) {
    return prisma.interview.findUnique({
      where: { id },
      include: {
        candidate: { select: { id: true, firstName: true, lastName: true, email: true } },
        panelMembers: { include: { employee: { select: { id: true, firstName: true, lastName: true, email: true } } } },
        feedbacks: { include: { interviewer: { select: { firstName: true, lastName: true } } } },
        calendarEvent: true
      }
    });
  }

  async list() {
    return prisma.interview.findMany({
      include: {
        candidate: { select: { firstName: true, lastName: true } },
        panelMembers: { include: { employee: { select: { firstName: true, lastName: true } } } }
      }
    });
  }

  async delete(id) {
    return prisma.interview.delete({
      where: { id }
    });
  }

  async submitFeedback(data) {
    return prisma.interviewFeedback.create({
      data,
      include: {
        interviewer: { select: { firstName: true, lastName: true } }
      }
    });
  }

  /**
   * Conflict Detection checks:
   * Returns count of overlapping calendar events or interviews for the specified interviewers.
   */
  async checkConflicts(employeeIds, start, end) {
    const overlappingEvents = await prisma.calendarEvent.count({
      where: {
        employeeId: { in: employeeIds },
        OR: [
          { startDate: { lte: start }, endDate: { gte: start } },
          { startDate: { lte: end }, endDate: { gte: end } },
          { startDate: { gte: start }, endDate: { lte: end } }
        ]
      }
    });

    return overlappingEvents > 0;
  }
}

export default new InterviewRepository();
