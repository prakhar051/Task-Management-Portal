# 🎯 Recruitment & Applicant Tracking System (ATS)

This document provides a technical guide to the Recruitment & Applicant Tracking System (ATS) implemented in Phase 14.

---

## 📂 1. Database Model Design

The recruitment module stores data in the following models:

*   **`JobOpening`**: Configures published positions, target department, and assigned hiring manager.
*   **`Candidate`**: Represents applicant personal details, linked documents, and stage indicators. Email and Phone have a compound unique index to prevent duplicate profiles.
*   **`CandidateDocument`**: Intermediate join table binding `Candidate` documents with the primary `Document` registry table.
*   **`Interview`**: Handles schedulers, timeslots, and calendar bindings.
*   **`InterviewPanelMember`**: Maps multiple employee interviewers to a single interview round.
*   **`InterviewFeedback`**: Houses interviewer evaluation scorecards, scores (1-10), recommendations (PASS, FAIL, HOLD), and comments.
*   **`OfferLetter`**: Tracks compensation proposals and contract statuses.
*   **`RecruitmentStage`**: Configurable database table containing pipeline stages.

---

## ⚡ 2. Core Business Logic

### 2.1 Double-Booking & Conflict Detection
Before scheduling or rescheduling an interview, `InterviewRepository.checkConflicts` queries existing `CalendarEvent` slots for the assigned panel members to verify availability. Overlapping schedules block creation with an error.

### 2.2 Onboarding Hiring Transaction
When a candidate is marked `HIRED`, `CandidateService.hireCandidate` runs a single database transaction:
1.  **User Credentials**: Provisions user credentials with default `EMPLOYEE` role.
2.  **Employee Directory**: Compiles name, phone, email, designation, manager, and department into the `Employee` model.
3.  **Document Re-linking**: Relinks all resume/portfolio candidate documents to the new employee folder.
4.  **Tasks Assignment**: Assigns the onboarding task checklists automatically under the Company Onboarding project.
5.  **Notifications**: Dispatches a welcome push notification.
6.  **Rollback**: Aborts and rolls back all database operations if a single step encounters an error.

---

## 🔗 3. REST API Endpoints

All endpoints require `authenticateUser` header validation.

### 3.1 Job Openings
*   `GET /api/jobs` — List positions
*   `POST /api/jobs` — Create position (Admin only)
*   `PATCH /api/jobs/:id` — Update position (Admin only)
*   `DELETE /api/jobs/:id` — Delete position (Admin only)

### 3.2 Candidate Pipeline
*   `GET /api/candidates` — Roster candidate list
*   `POST /api/candidates` — Register profile (Admin only)
*   `PATCH /api/candidates/:id/stage` — Advance stage (Admin only)
*   `POST /api/candidates/:id/hire` — Finalize hire transaction (Admin only)
*   `POST /api/candidates/:id/document` — Link attachments (Admin only)

### 3.3 Interview Rounds
*   `POST /api/interviews` — Schedule interview (Admin only)
*   `PATCH /api/interviews/:id` — Reschedule interview (Admin only)
*   `DELETE /api/interviews/:id` — Cancel interview (Admin only)
*   `POST /api/interviews/:id/feedback` — Submit scorecard feedback (Admin & Managers)
