# TaskPortal - Enterprise Task Management & SaaS Portal

TaskPortal is a production-ready, feature-complete enterprise SaaS platform built on a decoupled Layered Architecture (Repository → Service → Controller) using Express, Prisma ORM, PostgreSQL, React, Zustand, and Tailwind CSS.

## 🚀 Key Features Matrix
- **Authentication & MFA**: Secure JWT sessions, HttpOnly cookies, and multi-factor auth checks.
- **Enterprise Modules**: Integrated HRM, Department Org Trees, Kanban Projects, Attendance logs, and Payroll calculations.
- **ATS Recruitment**: ATS Candidate screening pipeline, interviews calendar scheduling, and automatic employee conversion.
- **DevOps, Health & Backups Monitoring**: Real-time CPU usage, system error logs resolver, and manual/scheduled zip backups.
- **Docker Compose Orchestration**: Out-of-the-box support for PostgreSQL database, Redis caches, Nginx proxy, and Node/Vite runtimes.

---

## 🛠️ Tech Stack & Layers
- **Frontend**: React (Vite), Zustand Stores, Tailwind CSS, Lucide icons.
- **Backend API**: Node.js, Express, Socket.io, Zod.
- **ORM & DB**: Prisma ORM, PostgreSQL, Redis.
- **Containerization**: Docker, Docker Compose, Nginx.
- **CI/CD**: GitHub Actions.

---

## 📦 Docker Compose Deployment

Spin up the entire PostgreSQL database, Redis caches, Nginx proxy, and application runtimes with a single command:
```bash
docker-compose up -d --build
```
The stack mounts:
- **Frontend SPA**: `http://localhost`
- **REST API Gateway**: `http://localhost/api`
- **WebSocket Server**: `http://localhost/socket.io`

---

## 💻 Manual Installation & Test Run

### 1. Database Migrations
Inside the `backend` folder, set up environment credentials:
```bash
cp .env.example .env
npm install
npx prisma migrate dev
```

### 2. Launch Development Servers
- Backend API Server:
  ```bash
  cd backend
  npm run dev
  ```
- Frontend SPA client:
  ```bash
  cd frontend
  npm install
  npm run dev
  ```

---

## 🧪 Integration Verification Tests
Validate the E2E lifecycle (create candidate, convert to employee, clock attendance, generate payroll, assign asset, trigger notification, clear database logs) by running:
```bash
cd backend
node scratch/test_final_system.js
```

---

## 🏥 Health Check

Validate and monitor the system status (runtimes, database connection health) using the following public, non-rate-limited endpoints:

* **GET** `/health`
* **GET** `/api/health`
* **GET** `/api/v1/health`

### Example Response (HTTP 200)
```json
{
  "success": true,
  "status": "UP",
  "service": "Task Management Portal API",
  "version": "1.0.0",
  "environment": "production",
  "timestamp": "2026-08-13T10:25:53.000Z",
  "uptime": 1234.56,
  "database": "CONNECTED"
}
```
