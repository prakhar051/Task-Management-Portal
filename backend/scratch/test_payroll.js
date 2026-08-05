import { prisma } from '../src/config/db.js';
import PayrollService from '../src/services/payroll.service.js';
import SalaryService from '../src/services/salary.service.js';
import TaxService from '../src/services/tax.service.js';
import fs from 'fs';

async function runVerification() {
  console.log('🧪 Starting Phase 13 Payroll & Salary Management verification checks...');

  try {
    // 0. Clean up pre-existing payroll for Aug 2026
    const oldPayroll = await prisma.payroll.findUnique({
      where: { month_year: { month: 8, year: 2026 } }
    });
    if (oldPayroll) {
      await prisma.payslip.deleteMany({
        where: { payrollItem: { payrollId: oldPayroll.id } }
      });
      await prisma.payrollItem.deleteMany({
        where: { payrollId: oldPayroll.id }
      });
      await prisma.payroll.delete({
        where: { id: oldPayroll.id }
      });
    }

    // 1. Setup mock records
    console.log('1. Setting up temporary verification records...');

    const deptSuffix = Date.now().toString().slice(-4);
    const mockDept = await prisma.department.create({
      data: {
        name: `Payroll QA Lab ${deptSuffix}`,
        code: `PQA${deptSuffix}`,
        location: 'Building C Room 4',
        email: `payroll_${deptSuffix}@test.local`,
        phone: '444-555'
      }
    });

    const mockUser = await prisma.user.create({
      data: {
        email: `pay_admin_${Date.now()}@test.local`,
        name: 'Payroll Admin Tester',
        role: 'ADMIN',
        passwordHash: 'dummy'
      }
    });

    const mockEmp = await prisma.employee.create({
      data: {
        employeeCode: `QA-P-${Date.now().toString().slice(-3)}`,
        firstName: 'Payroll',
        lastName: 'QA',
        email: `pay_qa_${Date.now()}@test.local`,
        phone: '888-888',
        designation: 'Payroll Tester',
        status: 'ACTIVE',
        hireDate: new Date(),
        userId: mockUser.id,
        departmentId: mockDept.id
      }
    });

    console.log('   Temporary verification records prepared successfully!');

    // 2. Setup Tax Rules
    console.log('2. Setting up Tax Rules...');
    await TaxService.clearRules(mockUser);

    await TaxService.createRule(mockUser, {
      name: 'Bracket 1',
      minIncome: 0,
      maxIncome: 5000,
      taxRate: 0.10,
      flatAmount: 0
    });

    await TaxService.createRule(mockUser, {
      name: 'Bracket 2',
      minIncome: 5000,
      maxIncome: 10000,
      taxRate: 0.15,
      flatAmount: 0
    });

    console.log('   Tax Rules setup complete.');

    // 3. Setup Salary Structure
    console.log('3. Configuring Salary Structure...');
    const struct = await SalaryService.createStructure(mockUser, {
      employeeId: mockEmp.id,
      baseSalary: 6000,
      currency: 'USD',
      effectiveFrom: new Date(),
      components: {
        create: [
          { name: 'Housing', type: 'ALLOWANCE', amount: 500, isPercentage: false },
          { name: 'Performance Bonus', type: 'BONUS', amount: 0.10, isPercentage: true },
          { name: 'Provident Fund', type: 'DEDUCTION', amount: 200, isPercentage: false }
        ]
      }
    });

    console.log(`   Salary Structure configured with ID: ${struct.id}`);

    // 4. Setup mock Attendance and Leaves for Month 8, Year 2026
    console.log('4. Creating mock Attendance and Leaves logs...');
    
    // Day 3 - Present
    await prisma.attendance.create({
      data: {
        employeeId: mockEmp.id,
        date: new Date(Date.UTC(2026, 7, 3)),
        status: 'PRESENT',
        clockIn: new Date(Date.UTC(2026, 7, 3, 9, 0, 0)),
        clockOut: new Date(Date.UTC(2026, 7, 3, 17, 0, 0))
      }
    });

    // Day 4 - Half Day
    await prisma.attendance.create({
      data: {
        employeeId: mockEmp.id,
        date: new Date(Date.UTC(2026, 7, 4)),
        status: 'HALF_DAY',
        clockIn: new Date(Date.UTC(2026, 7, 4, 9, 0, 0)),
        clockOut: new Date(Date.UTC(2026, 7, 4, 13, 0, 0))
      }
    });

    // Day 5 - Absent
    await prisma.attendance.create({
      data: {
        employeeId: mockEmp.id,
        date: new Date(Date.UTC(2026, 7, 5)),
        status: 'ABSENT'
      }
    });

    // Day 6 - Present with Overtime
    await prisma.attendance.create({
      data: {
        employeeId: mockEmp.id,
        date: new Date(Date.UTC(2026, 7, 6)),
        status: 'PRESENT',
        clockIn: new Date(Date.UTC(2026, 7, 6, 9, 0, 0)),
        clockOut: new Date(Date.UTC(2026, 7, 6, 21, 0, 0)), // 12 hours total
        overtimeHours: 4
      }
    });

    // Unpaid Leave (Aug 10 - Aug 11) = 2 days
    await prisma.leave.create({
      data: {
        employeeId: mockEmp.id,
        type: 'UNPAID',
        startDate: new Date(Date.UTC(2026, 7, 10)),
        endDate: new Date(Date.UTC(2026, 7, 11)),
        reason: 'Personal reason',
        status: 'APPROVED'
      }
    });

    console.log('   Mock Attendance and Leaves successfully configured.');

    // 5. Generate Payroll
    console.log('5. Testing Payroll Generation...');
    const generated = await PayrollService.generatePayroll(mockUser, 8, 2026);
    console.log(`   Generated payroll run for 08/2026 status: ${generated.status}`);

    const item = generated.items.find((i) => i.employeeId === mockEmp.id);
    if (!item) {
      throw new Error('Salary item not found in generated payroll run.');
    }

    console.log(`   Calculated Gross Salary: $${item.grossSalary.toFixed(2)} (Expected: ~$7314.28)`);
    console.log(`   Calculated Deductions: $${item.deductions.toFixed(2)} (Expected: ~$1200.00)`);
    console.log(`   Calculated Tax: $${item.tax.toFixed(2)} (Expected: ~$847.14)`);
    console.log(`   Calculated Net Salary: $${item.netSalary.toFixed(2)} (Expected: ~$5267.14)`);

    // Verify values:
    if (Math.abs(item.grossSalary - 7314.28) > 2) {
      throw new Error(`Gross Salary math discrepancy: ${item.grossSalary}`);
    }
    if (Math.abs(item.deductions - 1200.0) > 2) {
      throw new Error(`Deductions math discrepancy: ${item.deductions}`);
    }
    if (Math.abs(item.tax - 847.14) > 2) {
      throw new Error(`Tax math discrepancy: ${item.tax}`);
    }
    if (Math.abs(item.netSalary - 5267.14) > 2) {
      throw new Error(`Net Salary math discrepancy: ${item.netSalary}`);
    }

    console.log('   Calculation values matched successfully!');

    // 6. Approve Payroll Run
    console.log('6. Testing Payroll Approval and Snapshot generation...');
    const approved = await PayrollService.approvePayroll(mockUser, generated.id);
    console.log(`   Payroll status updated: ${approved.status}`);

    const approvedItem = approved.items.find((i) => i.employeeId === mockEmp.id);
    const pdfPath = await PayrollService.getPayslipPath(mockUser, approvedItem.id);
    console.log(`   Payslip PDF successfully verified at path: ${pdfPath}`);

    if (!fs.existsSync(pdfPath)) {
      throw new Error('Payslip PDF file was not created on the file system.');
    }

    // 7. Disburse Payments
    console.log('7. Testing Payroll Disburse Payment...');
    const paid = await PayrollService.payPayroll(mockUser, generated.id);
    console.log(`   Payroll run marked as: ${paid.status}`);

    // 8. Cleanup
    console.log('8. Cleaning up temporary files & database tables...');
    if (fs.existsSync(pdfPath)) {
      fs.unlinkSync(pdfPath);
    }

    await prisma.payslip.deleteMany({
      where: { payrollItem: { employeeId: mockEmp.id } }
    });
    await prisma.payrollItem.deleteMany({
      where: { employeeId: mockEmp.id }
    });
    await prisma.payroll.delete({
      where: { id: generated.id }
    });
    await prisma.leave.deleteMany({
      where: { employeeId: mockEmp.id }
    });
    await prisma.attendance.deleteMany({
      where: { employeeId: mockEmp.id }
    });
    await prisma.salaryComponent.deleteMany({
      where: { salaryStructureId: struct.id }
    });
    await prisma.salaryStructure.delete({
      where: { id: struct.id }
    });
    await prisma.employee.delete({
      where: { id: mockEmp.id }
    });
    await prisma.user.delete({
      where: { id: mockUser.id }
    });
    await prisma.department.delete({
      where: { id: mockDept.id }
    });
    await TaxService.clearRules(mockUser);

    console.log('   Cleanup completed successfully.');
    console.log('✅ All Phase 13 Payroll & Salary Management backend checks passed successfully!');
  } catch (err) {
    console.error('❌ Verification failed:', err);
    process.exit(1);
  }
}

runVerification();
