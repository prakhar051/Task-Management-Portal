import { prisma } from '../src/config/db.js';
import AnalyticsService from '../src/services/analytics.service.js';
import ReportService from '../src/services/report.service.js';

async function runTests() {
  console.log('🧪 Starting Phase 9 Backend verification tests...');

  try {
    // 1. Prisma database connection check
    console.log('1. Checking Prisma connection...');
    const userCount = await prisma.user.count();
    console.log(`   Connected! Total users in database: ${userCount}`);

    // 2. Setup mock data for verification
    console.log('2. Setting up temporary mock data in database...');
    
    // Create temporary department
    const mockDept = await prisma.department.create({
      data: {
        name: 'Temporary QA Dept',
        code: 'TEMPQA',
        location: 'QA Lab 102',
        email: 'qa@temp.local',
        phone: '123-456'
      }
    });

    // Create temporary admin user
    const mockAdminUser = await prisma.user.create({
      data: {
        email: `tempadmin_${Date.now()}@test.local`,
        name: 'Temp QA Admin',
        role: 'ADMIN',
        passwordHash: 'dummy'
      }
    });

    // Create temporary employee profile
    const mockEmp = await prisma.employee.create({
      data: {
        employeeCode: `QA-${Date.now().toString().slice(-4)}`,
        firstName: 'QA',
        lastName: 'Tester',
        email: `qa_${Date.now()}@test.local`,
        phone: '999-999',
        designation: 'Lead Engineer',
        status: 'ACTIVE',
        hireDate: new Date(),
        userId: mockAdminUser.id,
        departmentId: mockDept.id
      }
    });

    // Create temporary project
    const mockProj = await prisma.project.create({
      data: {
        code: `PRJ-${Date.now().toString().slice(-4)}`,
        name: 'Temporary Verification Project',
        departmentId: mockDept.id,
        managerId: mockEmp.id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000 * 30),
        status: 'ACTIVE',
        progress: 45
      }
    });

    // Create temporary task
    const mockTask = await prisma.task.create({
      data: {
        taskCode: `TSK-${Date.now().toString().slice(-4)}`,
        title: 'Task Exporter Testing Core',
        projectId: mockProj.id,
        reporterId: mockEmp.id,
        status: 'COMPLETED',
        priority: 'HIGH',
        completionPercentage: 100,
        dueDate: new Date(Date.now() + 86400000 * 5)
      }
    });

    // Create task assignment relationship
    await prisma.taskAssignee.create({
      data: {
        taskId: mockTask.id,
        employeeId: mockEmp.id
      }
    });

    console.log('   Temporary mock data created successfully!');
    console.log(`   Scoping queries for temporary ADMIN: ${mockAdminUser.email}`);

    // 3. Test Analytics Overview
    console.log('3. Fetching Analytics Overview...');
    const overview = await AnalyticsService.getOverview(mockAdminUser);
    console.log('   Overview KPIs fetched successfully:');
    console.log(`   - Total Employees: ${overview.employeeStats.totalEmployees}`);
    console.log(`   - Active Projects: ${overview.projectStats.activeProjects}`);
    console.log(`   - Completed Tasks: ${overview.taskStats.completedTasks}`);
    console.log(`   - Average Completion: ${overview.taskStats.averageCompletion}%`);

    // 4. Test Report Generation (CSV format)
    console.log('4. Testing CSV Report exporter...');
    const csvReport = await ReportService.getTaskReport(mockAdminUser, {}, 'csv');
    console.log(`   CSV Report created! Filename: ${csvReport.filename}, Size: ${csvReport.data.length} bytes`);

    // 5. Test Excel Generation (XLSX format)
    console.log('5. Testing Excel Report exporter...');
    const xlsxReport = await ReportService.getTaskReport(mockAdminUser, {}, 'xlsx');
    console.log(`   XLSX Report created! Filename: ${xlsxReport.filename}, Size: ${xlsxReport.data.length} bytes`);

    // 6. Test PDF Generation (PDF format)
    console.log('6. Testing PDF Report exporter...');
    const pdfReport = await ReportService.getTaskReport(mockAdminUser, {}, 'pdf');
    console.log(`   PDF Report created! Filename: ${pdfReport.filename}, Size: ${pdfReport.data.length} bytes`);

    // 7. Cleanup mock data
    console.log('7. Cleaning up temporary verification records...');
    await prisma.taskAssignee.deleteMany({ where: { taskId: mockTask.id } });
    await prisma.task.delete({ where: { id: mockTask.id } });
    await prisma.project.delete({ where: { id: mockProj.id } });
    await prisma.employee.delete({ where: { id: mockEmp.id } });
    await prisma.user.delete({ where: { id: mockAdminUser.id } });
    await prisma.department.delete({ where: { id: mockDept.id } });
    console.log('   Cleanup completed!');

    console.log('✅ All Phase 9 Backend verification checks passed successfully!');
  } catch (err) {
    console.error('❌ Phase 9 Verification test failed with error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
