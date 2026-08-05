import { prisma } from '../config/db.js';

class SalaryRepository {
  async createStructure(data) {
    return prisma.salaryStructure.create({
      data,
      include: {
        components: true,
        employee: { select: { firstName: true, lastName: true } }
      }
    });
  }

  async updateStructure(employeeId, data) {
    // Delete existing components if any are included in transaction
    const { components, ...structureData } = data;

    return prisma.$transaction(async (tx) => {
      const existing = await tx.salaryStructure.findUnique({
        where: { employeeId }
      });

      if (!existing) {
        throw new Error(`Salary structure for employee ${employeeId} does not exist.`);
      }

      if (components) {
        await tx.salaryComponent.deleteMany({
          where: { salaryStructureId: existing.id }
        });
      }

      return tx.salaryStructure.update({
        where: { employeeId },
        data: {
          ...structureData,
          components: components ? { create: components } : undefined
        },
        include: {
          components: true,
          employee: { select: { firstName: true, lastName: true } }
        }
      });
    });
  }

  async getByEmployeeId(employeeId) {
    return prisma.salaryStructure.findUnique({
      where: { employeeId },
      include: {
        components: true,
        employee: { select: { id: true, firstName: true, lastName: true, departmentId: true } }
      }
    });
  }

  async listStructures() {
    return prisma.salaryStructure.findMany({
      include: {
        components: true,
        employee: { select: { firstName: true, lastName: true, designation: true } }
      }
    });
  }

  async deleteStructure(id) {
    return prisma.salaryStructure.delete({
      where: { id }
    });
  }
}

export default new SalaryRepository();
