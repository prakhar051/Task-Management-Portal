import { prisma } from '../config/db.js';

class PayrollRepository {
  async createPayroll(data) {
    return prisma.payroll.create({
      data,
      include: {
        items: {
          include: {
            employee: { select: { firstName: true, lastName: true } }
          }
        }
      }
    });
  }

  async updatePayroll(id, data) {
    return prisma.payroll.update({
      where: { id },
      data,
      include: {
        items: {
          include: {
            employee: { select: { firstName: true, lastName: true } }
          }
        }
      }
    });
  }

  async getPayrollById(id) {
    return prisma.payroll.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            employee: { select: { id: true, firstName: true, lastName: true, designation: true, departmentId: true, userId: true } },
            payslips: true
          }
        }
      }
    });
  }

  async getPayrollByPeriod(month, year) {
    return prisma.payroll.findUnique({
      where: {
        month_year: { month, year }
      },
      include: {
        items: {
          include: {
            employee: { select: { id: true, firstName: true, lastName: true, designation: true } }
          }
        }
      }
    });
  }

  async listPayrolls() {
    return prisma.payroll.findMany({
      orderBy: [
        { year: 'desc' },
        { month: 'desc' }
      ]
    });
  }

  async createPayrollItems(payrollId, items) {
    return prisma.$transaction(async (tx) => {
      // Clean existing draft items
      await tx.payrollItem.deleteMany({
        where: { payrollId }
      });

      return Promise.all(
        items.map((item) =>
          tx.payrollItem.create({
            data: {
              payrollId,
              ...item
            }
          })
        )
      );
    });
  }

  async getPayrollItemById(id) {
    return prisma.payrollItem.findUnique({
      where: { id },
      include: {
        payroll: true,
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            designation: true,
            department: { select: { name: true } }
          }
        },
        payslips: true
      }
    });
  }

  async getEmployeeHistory(employeeId) {
    return prisma.payrollItem.findMany({
      where: { employeeId },
      include: {
        payroll: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async createPayslip(data) {
    return prisma.payslip.create({
      data
    });
  }

  async updatePayslip(id, data) {
    return prisma.payslip.update({
      where: { id },
      data
    });
  }
}

export default new PayrollRepository();
