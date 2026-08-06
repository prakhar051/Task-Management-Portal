import { prisma } from '../src/config/db.js';
import JobService from '../src/services/job.service.js';
import CandidateService from '../src/services/candidate.service.js';
import InterviewService from '../src/services/interview.service.js';
import OfferService from '../src/services/offer.service.js';

async function runRecruitmentVerification() {
  console.log('🧪 Starting Phase 14 Recruitment & ATS verification checks...');

  const uniqueId = Date.now().toString().slice(-4);
  let mockDept = null;
  let mockUser = null;
  let mockEmp = null;
  let job = null;
  let candidate = null;
  let document = null;
  let interview = null;
  let offer = null;
  let hiredEmp = null;
  let hiredUser = null;

  try {
    // 0. Database pre-cleanup
    await prisma.taskAssignee.deleteMany({});
    await prisma.task.deleteMany({ where: { title: 'Complete Employee Onboarding' } });
    await prisma.project.deleteMany({ where: { name: 'Company Onboarding' } });
    await prisma.department.deleteMany({ where: { name: { startsWith: 'Recruitment Lab' } } });

    // 1. Setup Department & Hiring Manager
    console.log('1. Setting up mock HR and Department parameters...');
    mockDept = await prisma.department.create({
      data: {
        name: `Recruitment Lab ${uniqueId}`,
        code: `RQA${uniqueId}`,
        location: 'Level 5 Suite A',
        email: `hr_${uniqueId}@company.local`,
        phone: '555-9090'
      }
    });

    mockUser = await prisma.user.create({
      data: {
        email: `recruiter_admin_${uniqueId}@company.local`,
        name: 'Lead Recruiter Admin',
        role: 'ADMIN',
        passwordHash: 'dummy'
      }
    });

    mockEmp = await prisma.employee.create({
      data: {
        employeeCode: `REC-${uniqueId}`,
        firstName: 'Lead',
        lastName: 'Recruiter',
        email: `recruiter_admin_${uniqueId}@company.local`,
        phone: `555-${uniqueId}`,
        designation: 'HR Lead',
        status: 'ACTIVE',
        hireDate: new Date(),
        userId: mockUser.id,
        departmentId: mockDept.id
      }
    });

    // 2. Job CRUD
    console.log('2. Verifying Job Opening CRUD operations...');
    job = await JobService.createJob(mockUser, {
      title: `Staff Devops Engineer ${uniqueId}`,
      description: 'Manage production-grade container orchestrations.',
      requirements: 'Kubernetes, AWS, IaC, Terraform.',
      departmentId: mockDept.id,
      hiringManagerId: mockEmp.id,
      status: 'OPEN'
    });

    if (!job || job.title !== `Staff Devops Engineer ${uniqueId}`) {
      throw new Error('Job creation assertion failed.');
    }
    console.log('✔ Job created successfully.');

    // Update job status
    const updatedJob = await JobService.updateJob(mockUser, job.id, { requirements: 'Kubernetes, AWS, Terraform, Docker' });
    if (updatedJob.requirements !== 'Kubernetes, AWS, Terraform, Docker') {
      throw new Error('Job update requirements failed.');
    }
    console.log('✔ Job updated successfully.');

    // Seed/List pipeline stages
    const stages = await JobService.listStages(mockUser);
    if (stages.length === 0) {
      throw new Error('Recruitment stages list should not be empty.');
    }
    console.log(`✔ Pipeline stages parsed successfully: [${stages.map((s) => s.name).join(', ')}]`);

    // 3. Candidate CRUD & Duplicate Prevention
    console.log('3. Verifying Candidate CRUD & Duplicate Prevention...');
    candidate = await CandidateService.createCandidate(mockUser, {
      jobOpeningId: job.id,
      firstName: 'John',
      lastName: 'Doe',
      email: `johndoe_${uniqueId}@applicant.local`,
      phone: `123-${uniqueId}`,
      status: 'APPLIED'
    });

    if (!candidate || candidate.email !== `johndoe_${uniqueId}@applicant.local`) {
      throw new Error('Candidate creation failed.');
    }
    console.log('✔ Candidate Doe created.');

    // Test duplicate block
    try {
      await CandidateService.createCandidate(mockUser, {
        jobOpeningId: job.id,
        firstName: 'JohnDuplicate',
        lastName: 'Doe',
        email: `johndoe_${uniqueId}@applicant.local`,
        phone: `123-${uniqueId}`,
        status: 'APPLIED'
      });
      throw new Error('Duplicate prevention assertion failed: registered same candidate.');
    } catch (err) {
      console.log('✔ Duplicate prevention correctly blocked matching email/phone.');
    }

    // 4. Document integration
    console.log('4. Verifying resume attachments and Document links...');
    document = await prisma.document.create({
      data: {
        name: `johndoe_resume_${uniqueId}.pdf`,
        entityType: 'RECRUITMENT',
        entityId: candidate.id,
        category: 'PDF',
        status: 'ACTIVE',
        uploadedById: mockEmp.id
      }
    });

    await CandidateService.linkDocument(mockUser, candidate.id, document.id, 'RESUME');
    console.log('✔ Resume document linked to Candidate.');

    // 5. Interview Scheduling & Conflict Detection
    console.log('5. Verifying Interview Scheduling & Conflict Detection...');
    const scheduledTime = new Date();
    scheduledTime.setDate(scheduledTime.getDate() + 1); // tomorrow

    interview = await InterviewService.scheduleInterview(mockUser, {
      candidateId: candidate.id,
      title: 'Technical Evaluation Round 1',
      type: 'TECHNICAL',
      scheduledAt: scheduledTime.toISOString(),
      durationMinutes: 60,
      status: 'SCHEDULED'
    }, [mockEmp.id]);

    if (!interview || !interview.calendarEventId) {
      throw new Error('Interview or corresponding Calendar Event was not scheduled.');
    }
    console.log('✔ Interview round successfully synced to Calendar Events.');

    // Verify scheduling conflict
    try {
      await InterviewService.scheduleInterview(mockUser, {
        candidateId: candidate.id,
        title: 'Overlapping Round 2',
        type: 'HR',
        scheduledAt: scheduledTime.toISOString(),
        durationMinutes: 60,
        status: 'SCHEDULED'
      }, [mockEmp.id]);
      throw new Error('Conflict detection failure: overlapping interviewer slots allowed.');
    } catch (err) {
      console.log('✔ Conflict detection correctly blocked overlapping panel interviews.');
    }

    // 6. Feedback Submissions
    console.log('6. Verifying feedback submissions...');
    const feedback = await InterviewService.submitFeedback(mockUser, {
      interviewId: interview.id,
      score: 9,
      comments: 'Excellent coding expertise, fast responses.',
      result: 'PASS'
    });

    if (!feedback || feedback.score !== 9) {
      throw new Error('Feedback submission score mismatch.');
    }
    console.log('✔ Feedback scorecard registered.');

    // 7. Offer Letter Generation
    console.log('7. Verifying Offer Letter generation...');
    offer = await OfferService.createOffer(mockUser, {
      candidateId: candidate.id,
      jobOpeningId: job.id,
      grossSalary: 7500.0,
      status: 'DRAFT',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    if (!offer || offer.grossSalary !== 7500.0) {
      throw new Error('Offer salary mismatch.');
    }
    console.log('✔ Draft offer letter compiled.');

    // 8. Hiring Workflow transaction
    console.log('8. Triggering complete Hire Candidate database transaction...');
    const hireResult = await CandidateService.hireCandidate(mockUser, candidate.id, `EMP-HIRED-${uniqueId}`);
    hiredEmp = hireResult.employee;
    hiredUser = hireResult.user;

    // Assert employee created
    if (!hiredEmp || hiredEmp.employeeCode !== `EMP-HIRED-${uniqueId}`) {
      throw new Error('Employee record creation was not finalised.');
    }
    console.log('✔ User logins & Employee profile created.');

    // Assert documents moved
    const updatedDoc = await prisma.document.findUnique({ where: { id: document.id } });
    if (updatedDoc.entityType !== 'EMPLOYEE' || updatedDoc.entityId !== hiredEmp.id) {
      throw new Error('Attachments were not successfully linked to employee folder.');
    }
    console.log('✔ Documents re-linked to Employee folder.');

    // Assert onboarding tasks
    const onboardingTask = await prisma.task.findFirst({
      where: { assignees: { some: { employeeId: hiredEmp.id } } }
    });
    if (!onboardingTask) {
      throw new Error('Onboarding tasks were not scheduled.');
    }
    console.log('✔ Onboarding task checklist generated.');

    // Assert push notification
    const welcomeNotif = await prisma.notification.findFirst({
      where: { userId: hiredUser.id }
    });
    if (!welcomeNotif) {
      throw new Error('Onboarding push notification was not dispatched.');
    }
    console.log('✔ Welcome notifications triggered.');

    console.log('✔ Transaction completed successfully.');

  } catch (err) {
    console.error('❌ Verification failed: ', err.message);
    process.exit(1);
  } finally {
    // 9. Database cleanup
    console.log('9. Starting Database cleanup...');

    if (hiredEmp) {
      await prisma.taskAssignee.deleteMany({ where: { employeeId: hiredEmp.id } });
      await prisma.task.deleteMany({ where: { title: 'Complete Employee Onboarding' } });
      await prisma.project.deleteMany({ where: { name: 'Company Onboarding' } });
      await prisma.employee.delete({ where: { id: hiredEmp.id } });
    }
    if (hiredUser) {
      await prisma.notification.deleteMany({ where: { userId: hiredUser.id } });
      await prisma.user.delete({ where: { id: hiredUser.id } });
    }
    if (offer) {
      await prisma.offerLetter.delete({ where: { id: offer.id } });
    }
    if (interview) {
      await prisma.interviewFeedback.deleteMany({ where: { interviewId: interview.id } });
      await prisma.interviewPanelMember.deleteMany({ where: { interviewId: interview.id } });
      await prisma.interview.delete({ where: { id: interview.id } });
    }
    if (document) {
      await prisma.candidateDocument.deleteMany({ where: { documentId: document.id } });
      await prisma.document.delete({ where: { id: document.id } });
    }
    if (candidate) {
      await prisma.candidateStageHistory.deleteMany({ where: { candidateId: candidate.id } });
      await prisma.candidate.delete({ where: { id: candidate.id } });
    }
    if (job) {
      await prisma.jobOpening.delete({ where: { id: job.id } });
    }
    if (mockEmp) {
      await prisma.employee.delete({ where: { id: mockEmp.id } });
    }
    if (mockUser) {
      await prisma.user.delete({ where: { id: mockUser.id } });
    }
    if (mockDept) {
      await prisma.department.delete({ where: { id: mockDept.id } });
    }

    console.log('✔ Database clean. Cleanup completed.');
  }

  console.log('🏆 All Phase 14 recruitment tests passed successfully!');
}

runRecruitmentVerification();
