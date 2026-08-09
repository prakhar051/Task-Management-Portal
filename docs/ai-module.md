# AI Assistant, Knowledge Base & Enterprise Automation Module (Phase 18)

The AI Assistant, Knowledge Base, and Enterprise Automation Module provides team members with conversational helpers, structured company guidelines databases, and rule-based workflow automations.

## 🤖 1. AI Assistant & Search
*   **LLM Connection**: Integrates with `@google/genai` model `gemini-2.5-flash` using `process.env.GEMINI_API_KEY`.
*   **Local Query Engine Fallback**: If the api key is omitted, it falls back to a semantic keyword-based local search engine that queries tasks, active projects, employee directories, and categories articles, producing contextual answers.
*   **Global Search**: Semantic rank query matching objects across Tasks, Projects, KB Articles, and Employees.

## 📚 2. Company Knowledge Base
*   **Markdown Articles**: Articles support rich text and markdown. Category directory trees partition articles by subjects (e.g. IT support or HR policies).
*   **History Logs Versions**: Editing published articles increments version numbers and stores snapshot backups in the version repository database.
*   **View Count**: Increments views count on every fetch.

## ⚙️ 3. Workflow Automations
Rules link service triggers to outcomes using configurations:
*   **Triggers**:
    *   `TASK_COMPLETED`: Task card transitions to Completed status.
    *   `EMPLOYEE_JOINED`: Employee profile registers.
    *   `PAYROLL_APPROVED`: Monthly payroll approved.
    *   `LEAVE_APPROVED`: Leave request reviewer approval logged.
    *   `CANDIDATE_HIRED`: Recruitment hired status registered.
*   **Actions**:
    *   `NOTIFY_MANAGER`: Dispatch notification to hiring manager or project manager.
    *   `GENERATE_DOCUMENTS`: Placeholder trigger for file templates.
    *   `NOTIFY_EMPLOYEE`: Private in-app notification.
    *   `UPDATE_CALENDAR`: Schedules milestone calendars check event.
    *   `CREATE_EMPLOYEE`: Automatic applicant onboarding credentials generator.
