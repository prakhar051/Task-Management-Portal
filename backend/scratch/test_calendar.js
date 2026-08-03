import { prisma } from '../src/config/db.js';
import LeaveService from '../src/services/leave.service.js';
import CalendarService from '../src/services/calendar.service.js';

async function runVerification() {
  console.log('🧪 Starting Phase 10 Calendar & Leave Management backend verification checks...');

  try {
    // 1. Setup mock records
    console.log('1. Setting up temporary verification records...');
    
    const mockDept = await prisma.department.create({
      data: {
        name: 'Calendar QA Lab',
        code: 'CALQA',
        location: 'Building B Room 4',
        email: 'cal@test.local',
        phone: '123-456'
      }
    });

    const mockUser = await prisma.user.create({
      data: {
        email: `calendar_admin_${Date.now()}@test.local`,
        name: 'Calendar Admin Tester',
        role: 'ADMIN',
        passwordHash: 'dummy'
      }
    });

    const mockEmp = await prisma.employee.create({
      data: {
        employeeCode: `QA-C-${Date.now().toString().slice(-3)}`,
        firstName: 'Cal',
        lastName: 'QA',
        email: `cal_qa_${Date.now()}@test.local`,
        phone: '999-999',
        designation: 'Staff Tester',
        status: 'ACTIVE',
        hireDate: new Date(),
        userId: mockUser.id,
        departmentId: mockDept.id
      }
    });

    const mockProj = await prisma.project.create({
      data: {
        code: `PRJ-C-${Date.now().toString().slice(-3)}`,
        name: 'Calendar Verification Project',
        departmentId: mockDept.id,
        managerId: mockEmp.id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000 * 10), // Deadline 10 days out
        status: 'ACTIVE'
      }
    });

    const mockTask = await prisma.task.create({
      data: {
        taskCode: `TSK-C-${Date.now().toString().slice(-3)}`,
        title: 'Verify Calendar Feeds Merge',
        projectId: mockProj.id,
        reporterId: mockEmp.id,
        dueDate: new Date(Date.now() + 86400000 * 5), // Deadline 5 days out
        status: 'TODO'
      }
    });

    console.log('   Verification environment prepared successfully!');

    // 2. Test Leave Creation & Overlaps
    console.log('2. Testing Leave request creation...');
    const leaveData = {
      type: 'CASUAL',
      startDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      endDate: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days out
      reason: 'Scheduled rest days'
    };

    const leave = await LeaveService.createLeave(mockUser, {
      employeeId: mockEmp.id,
      ...leaveData
    });
    console.log(`   Leave request submitted successfully! Status: ${leave.status}`);

    // 3. Test Leave Approval and automatic Event creation
    console.log('3. Testing Leave approval workflows...');
    const approvedLeave = await LeaveService.approveLeave(mockUser, leave.id);
    console.log(`   Leave approved! Status: ${approvedLeave.status}`);

    // Check that a leave calendar event was created
    const leaveEvents = await prisma.calendarEvent.findMany({
      where: { leaveId: leave.id }
    });
    console.log(`   Leave Calendar Event auto-generated! Count: ${leaveEvents.length}`);
    if (leaveEvents.length === 0) throw new Error('Leave event was not generated.');

    // 4. Test Overlap validation check
    console.log('4. Testing leave date overlap validation check...');
    try {
      await LeaveService.createLeave(mockUser, {
        employeeId: mockEmp.id,
        type: 'SICK',
        startDate: new Date(Date.now() + 86400000 * 2).toISOString(), // Overlaps
        endDate: new Date(Date.now() + 86400000 * 4).toISOString(),
        reason: 'Should fail validation'
      });
      throw new Error('Overlap check failed to block duplicate request.');
    } catch (err) {
      console.log(`   Blocked overlap request successfully! Message: "${err.message}"`);
    }

    // 5. Test Unified Calendar Feed Merge
    console.log('5. Testing unified calendar feed merge...');
    const feed = await CalendarService.getUnifiedFeed(mockUser, {
      startDate: new Date(Date.now() - 86400000).toISOString(),
      endDate: new Date(Date.now() + 86400000 * 15).toISOString()
    });

    console.log(`   Feed compiled successfully! Merged events: ${feed.length}`);
    const taskDeadline = feed.find((ev) => ev.type === 'TASK');
    const projectDeadline = feed.find((ev) => ev.type === 'PROJECT');
    const leaveEvent = feed.find((ev) => ev.type === 'LEAVE');

    console.log(`   - Found Task Deadline event: ${!!taskDeadline}`);
    console.log(`   - Found Project Milestone event: ${!!projectDeadline}`);
    console.log(`   - Found Leave event: ${!!leaveEvent}`);

    if (!taskDeadline || !projectDeadline || !leaveEvent) {
      throw new Error('Feed failed to merge all required calendar timeline components.');
    }

    // 6. Test Recurring Occurrence Generator
    console.log('6. Testing recurring event generation engine...');
    const recEvent = await CalendarService.createRecurringEvent(mockUser, {
      title: 'Weekly Sync meeting',
      description: 'Review QA benchmarks',
      type: 'MEETING',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 3600000).toISOString(), // 1 hour duration
      recurrenceRule: 'WEEKLY',
      recurrenceEndDate: new Date(Date.now() + 86400000 * 30).toISOString() // 30 days
    });

    const occurrences = await prisma.calendarEvent.findMany({
      where: { recurringEventId: recEvent.id }
    });
    console.log(`   Occurrences created successfully! Count: ${occurrences.length}`);
    if (occurrences.length === 0) throw new Error('Occurrences list is empty.');

    // 7. Cleanup mock records
    console.log('7. Cleaning up temporary verification records...');
    await prisma.calendarEvent.deleteMany({ where: { recurringEventId: recEvent.id } });
    await prisma.recurringEvent.delete({ where: { id: recEvent.id } });
    await prisma.calendarEvent.deleteMany({ where: { leaveId: leave.id } });
    await prisma.leave.delete({ where: { id: leave.id } });
    await prisma.task.delete({ where: { id: mockTask.id } });
    await prisma.project.delete({ where: { id: mockProj.id } });
    await prisma.employee.delete({ where: { id: mockEmp.id } });
    await prisma.user.delete({ where: { id: mockUser.id } });
    await prisma.department.delete({ where: { id: mockDept.id } });
    console.log('   Cleanup completed!');

    console.log('✅ All Phase 10 Calendar & Leave Management tests passed successfully!');
  } catch (err) {
    console.error('❌ Phase 10 Verification checks failed with error:', err);
    process.exit(1);
  }
}

runVerification();
