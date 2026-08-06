-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('DRAFT', 'OPEN', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CandidateStatus" AS ENUM ('APPLIED', 'SCREENING', 'SHORTLISTED', 'INTERVIEW', 'OFFERED', 'HIRED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED');

-- CreateEnum
CREATE TYPE "InterviewResult" AS ENUM ('PASS', 'FAIL', 'HOLD');

-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'DECLINED', 'EXPIRED');

-- AlterEnum
ALTER TYPE "DocumentEntityType" ADD VALUE 'RECRUITMENT';

-- CreateTable
CREATE TABLE "job_openings" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT,
    "departmentId" TEXT NOT NULL,
    "hiringManagerId" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_openings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidates" (
    "id" TEXT NOT NULL,
    "jobOpeningId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "status" "CandidateStatus" NOT NULL DEFAULT 'APPLIED',
    "resumeUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_documents" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidate_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interviews" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 60,
    "status" "InterviewStatus" NOT NULL DEFAULT 'SCHEDULED',
    "calendarEventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_panel_members" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interview_panel_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_feedbacks" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "interviewerId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "comments" TEXT NOT NULL,
    "result" "InterviewResult" NOT NULL DEFAULT 'HOLD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offer_letters" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "jobOpeningId" TEXT NOT NULL,
    "grossSalary" DOUBLE PRECISION NOT NULL,
    "status" "OfferStatus" NOT NULL DEFAULT 'DRAFT',
    "sentAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "documentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offer_letters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recruitment_stages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recruitment_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_stage_history" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "changedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidate_stage_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "candidates_email_phone_key" ON "candidates"("email", "phone");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_documents_documentId_key" ON "candidate_documents"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "interviews_calendarEventId_key" ON "interviews"("calendarEventId");

-- CreateIndex
CREATE UNIQUE INDEX "interview_panel_members_interviewId_employeeId_key" ON "interview_panel_members"("interviewId", "employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "offer_letters_documentId_key" ON "offer_letters"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "recruitment_stages_name_key" ON "recruitment_stages"("name");

-- CreateIndex
CREATE UNIQUE INDEX "recruitment_stages_sequence_key" ON "recruitment_stages"("sequence");

-- AddForeignKey
ALTER TABLE "job_openings" ADD CONSTRAINT "job_openings_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_openings" ADD CONSTRAINT "job_openings_hiringManagerId_fkey" FOREIGN KEY ("hiringManagerId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_jobOpeningId_fkey" FOREIGN KEY ("jobOpeningId") REFERENCES "job_openings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_documents" ADD CONSTRAINT "candidate_documents_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_documents" ADD CONSTRAINT "candidate_documents_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_calendarEventId_fkey" FOREIGN KEY ("calendarEventId") REFERENCES "calendar_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_panel_members" ADD CONSTRAINT "interview_panel_members_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "interviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_panel_members" ADD CONSTRAINT "interview_panel_members_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_feedbacks" ADD CONSTRAINT "interview_feedbacks_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "interviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_feedbacks" ADD CONSTRAINT "interview_feedbacks_interviewerId_fkey" FOREIGN KEY ("interviewerId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_feedbacks" ADD CONSTRAINT "interview_feedbacks_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_letters" ADD CONSTRAINT "offer_letters_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_letters" ADD CONSTRAINT "offer_letters_jobOpeningId_fkey" FOREIGN KEY ("jobOpeningId") REFERENCES "job_openings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_letters" ADD CONSTRAINT "offer_letters_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_stage_history" ADD CONSTRAINT "candidate_stage_history_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_stage_history" ADD CONSTRAINT "candidate_stage_history_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
