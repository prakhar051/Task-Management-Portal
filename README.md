# 🎯 Task Management Portal

[![Production Build](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Backend Server](https://img.shields.io/badge/backend-Render-blue.svg)]()
[![Frontend Client](https://img.shields.io/badge/frontend-Vercel-black.svg)]()
[![Database](https://img.shields.io/badge/database-Neon%20Postgres-00e5a3.svg)]()
[![ORM](https://img.shields.io/badge/ORM-Prisma-2b2b2b.svg)]()
[![Security](https://img.shields.io/badge/security-OWASP%20Compliant-red.svg)]()

An enterprise-grade, high-performance **Task Management Portal** engineered to streamline team workflows, optimize task allocation, and provide real-time status reporting. Built using a modern full-stack architecture featuring a **React.js** frontend styled with **Tailwind CSS**, a resilient **Node.js/Express.js** API backend, and a serverless **Neon PostgreSQL** database layer managed via **Prisma ORM**.

---

## 🔗 Documentation Hub

Explore the deep technical implementation and design choices behind this project:

| Section | Focus Areas | Document |
| :--- | :--- | :--- |
| **🎓 Academic Evaluation** | Formal university-grade Software Engineering project report | [PROJECT_REPORT.md](file:///c:/Resume%20Project/Task%20Management%20Portal/PROJECT_REPORT.md) |
| **📐 System Design** | High-level architecture, Mermaid component diagrams, data flows | [docs/system-design.md](file:///c:/Resume%20Project/Task%20Management%20Portal/docs/system-design.md) |
| **🔌 API Specifications** | Complete endpoint guides, payloads, headers, HTTP status codes | [docs/api-documentation.md](file:///c:/Resume%20Project/Task%20Management%20Portal/docs/api-documentation.md) |
| **🗄️ Database Architecture** | Normalized schemas, relational ERD, Prisma schema, indexing | [docs/database-design.md](file:///c:/Resume%20Project/Task%20Management%20Portal/docs/database-design.md) |
| **🏗️ Codebase Structure** | Component folder structure, design patterns, separation of concerns | [docs/architecture-guide.md](file:///c:/Resume%20Project/Task%20Management%20Portal/docs/architecture-guide.md) |
| **🛡️ Security & Auth** | JWT workflows, bcrypt hashing, XSS/CSRF mitigations, rate limits | [docs/security-auth.md](file:///c:/Resume%20Project/Task%20Management%20Portal/docs/security-auth.md) |
| **🚀 Deploy & Install** | Setup commands for Windows/macOS/Linux, Neon/Vercel/Render guides | [docs/installation-deployment.md](file:///c:/Resume%20Project/Task%20Management%20Portal/docs/installation-deployment.md) |
| **🧪 Testing & Performance** | Postman scripts, database optimizations, code splitting, caching | [docs/testing-performance.md](file:///c:/Resume%20Project/Task%20Management%20Portal/docs/testing-performance.md) |
| **📋 Retrospective** | Challenges, engineering learnings, and 15+ future enhancements | [docs/post-mortem.md](file:///c:/Resume%20Project/Task%20Management%20Portal/docs/post-mortem.md) |

---

## ✨ Core Features

*   **🔒 Secure Role-Based Authentication**: Secure registration and login using short-lived in-memory JWT Access Tokens, secure HttpOnly cookie-based Refresh Tokens with rotation, and distinct ADMIN, MANAGER, and EMPLOYEE role authorization tiers.
*   **👥 Collaborative Employee Directory**: Complete employee profile management supporting soft deletes, restores, local Multer avatar uploads, paginated searches, bulk update status controls, and CSV/Excel roster exports.
*   **📋 Rich Task Lifecycle Management**: Complete CRUD operations on tasks. Filter tasks by category, priority (Low, Medium, High), status (To-Do, In-Progress, Completed), or search query.
*   **👥 Dynamic Collaborative Assignment**: Admin interface to dynamically assign tasks to team members with real-time logging of updates.
*   **📊 Interactive Dashboard Analytics**: Rich responsive Recharts visual components (Pie, Doughnut, Bar, Line, Area) presenting status distribution, priorities, performance graphs, and debounced search filters.
*   **📁 Custom Category Tagging**: Dynamic creation of task categories to isolate and group tasks by business initiatives.
*   **🛡️ Robust Audit Logging**: Immutable activity logs tracking every status transition and task reassignment for compliance.

---

## 🛠️ Technology Stack

```
+-----------------------------------------------------------------------------------+
|                                  React.js Frontend                                |
|                        (Tailwind CSS, React Router, Axios)                        |
+-----------------------------------------------------------------------------------+
                                         |
                                         | Secure REST API (JSON)
                                         v
+-----------------------------------------------------------------------------------+
|                               Node.js / Express Backend                           |
|                       (JWT, bcrypt, Helmet, Express-Rate-Limit)                   |
+-----------------------------------------------------------------------------------+
                                         |
                                         | Prisma ORM
                                         v
+-----------------------------------------------------------------------------------+
|                             Neon Serverless PostgreSQL                            |
|                          (Normalized Tables, Foreign Keys)                        |
+-----------------------------------------------------------------------------------+
```

### Frontend
*   **Library**: React.js (v18+) for dynamic, component-driven UI.
*   **Styling**: Tailwind CSS for a modern, responsive, and glassmorphic user interface.
*   **Routing**: React Router (v6+) for nested client-side route management and guard paths.
*   **Client API**: Axios with centralized interceptors for HTTP requests and token refreshes.

### Backend
*   **Runtime**: Node.js for scalable, asynchronous event-driven I/O.
*   **Framework**: Express.js for building a secure, RESTful middleware-driven controller pipeline.
*   **Validation**: Zod/Joi schema validation schemas verifying raw request data.
*   **ORM**: Prisma for type-safe database queries, migrations, and declarative modeling.

### Database
*   **Engine**: PostgreSQL hosting a normalized relational data model (3NF).
*   **Platform**: Neon PostgreSQL for serverless, autoscaling, and connection-pooled hosting.

---

## ⚡ Quick Start

Get the project running locally in less than 5 minutes.

### 1. Clone the Project
```bash
git clone https://github.com/your-username/task-management-portal.git
cd task-management-portal
```

### 2. Configure Environment Variables
Create a `.env` file in both the `/frontend` and `/backend` directories. Refer to [docs/installation-deployment.md](file:///c:/Resume%20Project/Task%20Management%20Portal/docs/installation-deployment.md#environment-variables) for the configuration guidelines.

### 3. Run Backend Setup
```bash
cd backend
npm install
npx prisma db push
npm run dev
```

### 4. Run Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:5173` and communicate with the backend API running on `http://localhost:5000`.

---

## 📸 UI Showcase

| Dashboard & Insights | Task Board & Board View |
| :---: | :---: |
| ![Dashboard Mockup](https://raw.githubusercontent.com/Antigravity-IDE/assets/main/dashboard_placeholder.png)<br>*Main analytics dashboard displaying team distribution, priorities, and timelines.* | ![Task Board Mockup](https://raw.githubusercontent.com/Antigravity-IDE/assets/main/board_placeholder.png)<br>*Kanban board showcasing smooth drag-and-drop task lifecycle management.* |

*(Note: Image assets are placeholders demonstrating the production client layout. Detailed interface mockups can be found within the [PROJECT_REPORT.md](file:///c:/Resume%20Project/Task%20Management%20Portal/PROJECT_REPORT.md) file).*

---

## 👨‍💻 Author & Contributions

Created by a Software Engineering Intern as a capstone project. Contributions, issue submissions, and feature proposals are welcome! For issues, please open a GitHub Issue in this repository.
