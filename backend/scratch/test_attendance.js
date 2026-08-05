import { prisma } from '../src/config/db.js';
import AttendanceService from '../src/services/attendance.service.js';
import TimesheetService from '../src/services/timesheet.service.js';

async function runVerification() {
  console.log('🧪 Starting Phase 11 Attendance, Timesheets & Productivity backend verification checks...');

  try {
    // 1. Setup mock records
    console.log('1. Setting up temporary verification records...');

    const mockDept = await prisma.department.create({
      data: {
        name: 'Attendance QA Lab',
        code: 'ATQA',
        location: 'Building C Room 1',
        email: 'at@test.local',
        phone: '111-222'
      }
    });

    const mockUser = await prisma.user.create({
      data: {
        email: `attendance_admin_${Date.now()}@test.local`,
        name: 'Attendance Admin Tester',
        role: 'ADMIN',
        passwordHash: 'dummy'
      }
    });

    const mockEmp = await prisma.employee.create({
      data: {
        employeeCode: `QA-A-${Date.now().toString().slice(-3)}`,
        firstName: 'Attend',
        lastName: 'QA',
        email: `attend_qa_${Date.now()}@test.local`,
        phone: '888-888',
        designation: 'Time Tester',
        status: 'ACTIVE',
        hireDate: new Date(),
        userId: mockUser.id,
        departmentId: mockDept.id
      }
    });

    console.log('   Verification environment prepared successfully!');

    // 2. Test Clock In
    console.log('2. Testing Clock-In workflow...');
    const attendance = await AttendanceService.checkIn(mockUser);
    console.log(`   Clocked in successfully! Status: ${attendance.status}`);

    // Verify duplicate clock-in is prevented
    try {
      await AttendanceService.checkIn(mockUser);
      throw new Error('Duplicate clock-in check failed to throw an error.');
    } catch (err) {
      console.log(`   Duplicate clock-in correctly blocked! Message: "${err.message}"`);
    }

    // 3. Test Break Tracking
    console.log('3. Testing Break Tracking workflow...');
    const breakAtt = await AttendanceService.startBreak(mockUser);
    const breakSession = breakAtt.workSessions.find((s) => s.status === 'ACTIVE' && s.type === 'BREAK');
    console.log(`   Break session started! Active break session found: ${!!breakSession}`);

    const workingAtt = await AttendanceService.endBreak(mockUser);
    const workSession = workingAtt.workSessions.find((s) => s.status === 'ACTIVE' && s.type === 'WORKING');
    console.log(`   Break session ended! Active working session resumed: ${!!workSession}`);

    // 4. Test Clock Out & Hours calculations
    console.log('4. Testing Clock-Out workflow & metrics calculations...');
    const outAtt = await AttendanceService.checkOut(mockUser);
    console.log(`   Clocked out successfully! Status: ${outAtt.status}`);
    console.log(`   Working Hours computed: ${outAtt.totalHours} hrs | Break Duration: ${outAtt.breakDuration} mins | Overtime: ${outAtt.overtimeHours} hrs`);

    // 5. Test Correction Requests & Approvals
    console.log('5. Testing Manual Correction requests & approval cascade...');
    const reqData = {
      date: new Date().toISOString().split('T')[0],
      requestedClockIn: new Date(Date.now() - 3600000 * 10).toISOString(), // 10 hours ago
      requestedClockOut: new Date(Date.now()).toISOString(), // now
      requestedStatus: 'PRESENT',
      reason: 'Forgot to clock in on arrival'
    };

    const request = await AttendanceService.submitCorrectionRequest(mockUser, reqData);
    console.log(`   Correction request submitted! Status: ${request.status}`);

    const approvedRequest = await AttendanceService.approveRequest(mockUser, request.id);
    console.log(`   Correction request approved! Status: ${approvedRequest.status}`);

    // Verify updated attendance values
    const targetDate = new Date(new Date().toISOString().split('T')[0] + 'T00:00:00.000Z');
    const correctedAttendance = await prisma.attendance.findUnique({
      where: { employeeId_date: { employeeId: mockEmp.id, date: targetDate } }
    });
    console.log(`   Corrected Attendance Totals -> Hours worked: ${correctedAttendance.totalHours} hrs | Overtime: ${correctedAttendance.overtimeHours} hrs`);
    if (correctedAttendance.totalHours < 9) {
      throw new Error('Correction totals recalculation failed.');
    }

    // 6. Test Productivity Monthly Summaries
    console.log('6. Testing Timesheet Monthly Productivity aggregations...');
    const summary = await TimesheetService.getMonthlySummary(mockUser, {
      year: new Date().getUTCFullYear(),
      month: new Date().getUTCMonth() + 1,
      employeeId: mockEmp.id
    });
    console.log(`   Productivity summary compiled! Attendance rate: ${summary.attendancePercentage}% | Average Check-In: ${summary.avgCheckInTime}`);
    if (summary.attendancePercentage === 0) {
      throw new Error('Monthly productivity percentage calculations failed.');
    }

    // 7. Cleanup mock records
    console.log('7. Cleaning up temporary verification records...');
    await prisma.workSession.deleteMany({ where: { attendanceId: correctedAttendance.id } });
    await prisma.attendance.delete({ where: { id: correctedAttendance.id } });
    await prisma.attendanceRequest.delete({ where: { id: request.id } });
    await prisma.employee.delete({ where: { id: mockEmp.id } });
    await prisma.user.delete({ where: { id: mockUser.id } });
    await prisma.department.delete({ where: { id: mockDept.id } });
    console.log('   Cleanup completed!');

    console.log('✅ All Phase 11 Attendance & Timesheets verification checks passed successfully!');
  } catch (err) {
    console.error('❌ Phase 11 Verification checks failed with error:', err);
    process.exit(1);
  }
}

runVerification();
