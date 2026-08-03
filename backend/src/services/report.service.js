import XLSX from 'xlsx';
import PDFDocument from 'pdfkit';
import ReportRepository from '../repositories/report.repository.js';
import { prisma } from '../config/db.js';

class ReportService {
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

    // Apply Search
    if (filters.search) {
      if (entityType === 'EMPLOYEE') {
        where.OR = [
          { firstName: { contains: filters.search, mode: 'insensitive' } },
          { lastName: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } }
        ];
      } else if (entityType === 'DEPARTMENT') {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { code: { contains: filters.search, mode: 'insensitive' } }
        ];
      } else if (entityType === 'PROJECT') {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { code: { contains: filters.search, mode: 'insensitive' } }
        ];
      } else if (entityType === 'TASK') {
        where.OR = [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { taskCode: { contains: filters.search, mode: 'insensitive' } }
        ];
      }
    }

    return where;
  }

  /**
   * Universal exporter formatting pipeline.
   */
  async formatExport(title, headers, rows, format) {
    const normFormat = String(format).toLowerCase();

    if (normFormat === 'csv') {
      let csv = headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(',') + '\n';
      rows.forEach((row) => {
        csv += row.map((cell) => {
          const str = cell !== null && cell !== undefined ? String(cell) : '';
          return `"${str.replace(/"/g, '""')}"`;
        }).join(',') + '\n';
      });
      return { mimeType: 'text/csv', data: Buffer.from(csv, 'utf-8'), filename: `${title.toLowerCase().replace(/\s+/g, '_')}_export_${Date.now()}.csv` };
    }

    if (normFormat === 'xlsx') {
      const wb = XLSX.utils.book_new();
      const wsData = [headers, ...rows];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, title.substring(0, 30));
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      return {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        data: buffer,
        filename: `${title.toLowerCase().replace(/\s+/g, '_')}_export_${Date.now()}.xlsx`
      };
    }

    if (normFormat === 'pdf') {
      const buffer = await this.generatePDF(title, headers, rows);
      return {
        mimeType: 'application/pdf',
        data: buffer,
        filename: `${title.toLowerCase().replace(/\s+/g, '_')}_export_${Date.now()}.pdf`
      };
    }

    throw new Error(`Unsupported export document format: ${format}`);
  }

  /**
   * PDF document table builder helper (Landscape layout).
   */
  generatePDF(title, headers, rows) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ layout: 'landscape', size: 'A4', margin: 30 });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // Draw Title and metadata
      doc.fillColor('#0f172a').fontSize(16).text(title, { align: 'center' });
      doc.fontSize(9).fillColor('#64748b').text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
      doc.moveDown(1.5);

      const tableTop = doc.y;
      const rowHeight = 22;
      const colWidth = Math.floor((doc.page.width - 60) / headers.length);

      // Header row
      doc.fillColor('#1e293b').rect(30, tableTop, doc.page.width - 60, rowHeight).fill();
      doc.fillColor('#ffffff').fontSize(9);
      headers.forEach((h, i) => {
        doc.text(h, 35 + i * colWidth, tableTop + 6, { width: colWidth - 10, align: 'left' });
      });

      let currentY = tableTop + rowHeight;

      // Data rows
      rows.forEach((row, rowIndex) => {
        if (currentY + rowHeight > doc.page.height - 40) {
          doc.addPage();
          currentY = 40;
          
          // Re-draw Header row
          doc.fillColor('#1e293b').rect(30, currentY, doc.page.width - 60, rowHeight).fill();
          doc.fillColor('#ffffff').fontSize(9);
          headers.forEach((h, i) => {
            doc.text(h, 35 + i * colWidth, currentY + 6, { width: colWidth - 10, align: 'left' });
          });
          currentY += rowHeight;
        }

        // Zebra striping
        if (rowIndex % 2 === 1) {
          doc.fillColor('#f8fafc').rect(30, currentY, doc.page.width - 60, rowHeight).fill();
        }

        // Draw cells text values
        doc.fillColor('#334155');
        headers.forEach((h, colIndex) => {
          const val = String(row[colIndex] ?? '');
          doc.text(val, 35 + colIndex * colWidth, currentY + 6, { width: colWidth - 10, align: 'left', lineBreak: false });
        });

        // Draw bottom cell separator line
        doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(30, currentY + rowHeight).lineTo(doc.page.width - 30, currentY + rowHeight).stroke();

        currentY += rowHeight;
      });

      doc.end();
    });
  }

  /**
   * Generates employee report.
   */
  async getEmployeeReport(user, filters = {}, format = 'csv') {
    const where = await this.buildRbacWhere(user, 'EMPLOYEE', filters);
    const data = await ReportRepository.getEmployeesData(where);

    const headers = ['Employee Code', 'First Name', 'Last Name', 'Email', 'Phone', 'Designation', 'Status', 'Hire Date'];
    const rows = data.map((emp) => [
      emp.employeeCode,
      emp.firstName,
      emp.lastName,
      emp.email,
      emp.phone,
      emp.designation,
      emp.status,
      new Date(emp.hireDate).toISOString().split('T')[0]
    ]);

    return this.formatExport('Employee Report', headers, rows, format);
  }

  /**
   * Generates department report.
   */
  async getDepartmentReport(user, filters = {}, format = 'csv') {
    const where = await this.buildRbacWhere(user, 'DEPARTMENT', filters);
    const data = await ReportRepository.getDepartmentsData(where);

    const headers = ['Department Name', 'Code', 'Manager', 'Employees Count', 'Status', 'Location'];
    const rows = data.map((d) => [
      d.name,
      d.code,
      d.manager ? `${d.manager.firstName} ${d.manager.lastName}` : 'Unassigned',
      String(d._count.employees),
      d.status,
      d.location
    ]);

    return this.formatExport('Department Report', headers, rows, format);
  }

  /**
   * Generates project report.
   */
  async getProjectReport(user, filters = {}, format = 'csv') {
    const where = await this.buildRbacWhere(user, 'PROJECT', filters);
    const data = await ReportRepository.getProjectsData(where);

    const headers = ['Project Code', 'Name', 'Department', 'Manager', 'Status', 'Priority', 'Progress (%)', 'Budget ($)', 'Members Count', 'Tasks Count'];
    const rows = data.map((p) => [
      p.code,
      p.name,
      p.department?.name || 'None',
      p.manager ? `${p.manager.firstName} ${p.manager.lastName}` : 'Unassigned',
      p.status,
      p.priority,
      `${p.progress}%`,
      p.budget ? `$${p.budget.toFixed(2)}` : '$0.00',
      String(p._count.members),
      String(p._count.tasks)
    ]);

    return this.formatExport('Project Report', headers, rows, format);
  }

  /**
   * Generates task report.
   */
  async getTaskReport(user, filters = {}, format = 'csv') {
    const where = await this.buildRbacWhere(user, 'TASK', filters);
    const data = await ReportRepository.getTasksData(where);

    const headers = ['Task Code', 'Title', 'Project', 'Reporter', 'Assignees', 'Status', 'Priority', 'Type', 'Progress (%)', 'Due Date'];
    const rows = data.map((t) => [
      t.taskCode,
      t.title,
      t.project?.name || 'None',
      t.reporter ? `${t.reporter.firstName} ${t.reporter.lastName}` : 'System',
      t.assignees?.map((a) => `${a.employee?.firstName} ${a.employee?.lastName}`).join('; ') || 'Unassigned',
      t.status,
      t.priority,
      t.type,
      `${t.completionPercentage}%`,
      t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : 'None'
    ]);

    return this.formatExport('Task Report', headers, rows, format);
  }

  /**
   * Generates productivity report.
   */
  async getProductivityReport(user, filters = {}, format = 'csv') {
    const where = await this.buildRbacWhere(user, 'TASK', filters);
    const data = await ReportRepository.getProductivityData(where);

    const headers = ['Task Code', 'Title', 'Project', 'Department', 'Completed Date', 'Assignees'];
    const rows = data.map((t) => [
      t.taskCode,
      t.title,
      t.project?.name || 'None',
      t.project?.department?.name || 'None',
      new Date(t.updatedAt).toISOString().split('T')[0],
      t.assignees?.map((a) => `${a.employee?.firstName} ${a.employee?.lastName}`).join('; ') || 'Unassigned'
    ]);

    return this.formatExport('Productivity Report', headers, rows, format);
  }
}

export default new ReportService();
