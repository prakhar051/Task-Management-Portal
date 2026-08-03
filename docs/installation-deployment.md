# 🚀 Installation & Deployment Manual
**Local Development Setup and Production Cloud Provisioning**

---

## 💻 1. Local Machine Setup

### Prerequisites
Make sure your system has the following core runtimes installed:
*   **Node.js**: Version `18.0.0` or higher (LTS recommended).
*   **npm**: Version `9.0.0` or higher.
*   **PostgreSQL**: Version `14.0` or higher (if running database engine locally).

---

### Setup Command Workflows

Select the terminal guide matching your local operating system:

#### 🪟 Windows (PowerShell)
```powershell
# 1. Clone repository
git clone https://github.com/your-username/task-management-portal.git
cd task-management-portal

# 2. Setup backend api node dependencies
cd backend
npm install

# 3. Apply environment parameters and build database tables
Copy-Item .env.example .env
npx prisma db push

# 4. Start local developer server
npm run dev

# 5. Open new window to setup client dependencies
cd ../frontend
npm install
Copy-Item .env.example .env
npm run dev
```

#### 🍎 macOS (Zsh Terminal)
```zsh
# 1. Clone repository
git clone https://github.com/your-username/task-management-portal.git
cd task-management-portal

# 2. Setup backend dependencies
cd backend
npm install

# 3. Setup environments & run migrations
cp .env.example .env
npx prisma db push

# 4. Start API server
npm run dev

# 5. Open new shell, navigate and setup frontend
cd ../frontend
npm install
cp .env.example .env
npm run dev
```

#### 🐧 Linux (Bash Shell)
```bash
# 1. Clone repository
git clone https://github.com/your-username/task-management-portal.git
cd task-management-portal

# 2. Setup backend packages
cd backend
npm i

# 3. Setup configurations & migrate tables
cp .env.example .env
npx prisma db push

# 4. Launch backend daemon
npm run dev

# 5. Set up client package
cd ../frontend
npm i
cp .env.example .env
npm run dev
```

---

## 🗂️ 2. Environment Variables Specification

The application requires environment configuration files (`.env`) in the root of both directories.

### Backend Configurations (`backend/.env.example`)
```env
# 1. Server Configuration
PORT=5000
NODE_ENV=development

# 2. Relational Database URIs
# Direct connection for migrations (Neon direct pool)
DIRECT_URL="postgresql://[user]:[password]@[host]:5432/[db_name]?sslmode=require"
# Pooled connection URL for server instances (Neon connection pooler / PgBouncer)
DATABASE_URL="postgresql://[user]:[password]@[host]:5432/[db_name]?sslmode=require&pgbouncer=true"

# 3. Cryptographic Secret Keys
JWT_SECRET="generate_a_secure_random_256bit_hex_string_key_here"

# 4. Authorized Origins (CORS Settings)
CLIENT_URL="http://localhost:5173"
```

### Frontend Configurations (`frontend/.env.example`)
```env
# URL pointer to the API Server
VITE_API_URL="http://localhost:5000/api"
```

---

## 🚀 3. Cloud Production Deployment

The system is designed to build and deploy to modern cloud platforms:

```
                  +-------------------------------------------------+
                  |          Neon Serverless PostgreSQL             |
                  |                (Database Layer)                 |
                  +-------------------------------------------------+
                                           ^
                                           | Relational DB Links
                                           v
+------------------------------------+   +----------------------------------+
|           Vercel Hosting           |   |       Render Web Services        |
|          (Frontend SPA)            |   |          (Backend API)           |
+------------------------------------+   +----------------------------------+
```

---

### 3.1 Database: Neon Serverless PostgreSQL
1.  Log in to the [Neon Console](https://console.neon.tech/) and create a new project.
2.  Choose the **PostgreSQL 15+** version engine.
3.  Name the database (e.g. `task_portal`).
4.  Copy the connection string shown in the dashboard.
5.  Extract the connection string in two variations:
    *   **Pooled URL**: Toggle the "Connection Pooling" checkbox to append `?pgbouncer=true` parameters (assign this string as `DATABASE_URL`).
    *   **Direct URL**: Direct unpooled connection string (assign this string as `DIRECT_URL` for migration scripts).

---

### 3.2 Backend API Server: Render
1.  Create a Render account and navigate to the dashboard.
2.  Select **New Web Service** and authorize access to your code repository.
3.  Fill in the service details:
    *   **Runtime**: `Node`
    *   **Build Command**: `npm install && npx prisma generate`
    *   **Start Command**: `npm start`
4.  Under the **Environment Variables** menu, add the keys matching your backend `.env` variables:
    *   `DATABASE_URL`: *[Neon Connection Pooled URL string]*
    *   `DIRECT_URL`: *[Neon Connection Direct URL string]*
    *   `JWT_SECRET`: *[A cryptographically secure string]*
    *   `CLIENT_URL`: `https://task-portal-app.vercel.app`
    *   `NODE_ENV`: `production`
5.  Deploy the service and copy the generated Render URL (e.g., `https://task-portal-backend.render.com`).

---

### 3.3 Frontend SPA Client: Vercel
1.  Log in to [Vercel](https://vercel.com/) and create a project linking to the client repository.
2.  Configure the build directories:
    *   **Framework Preset**: `Vite` (or `Other` / `Create React App`)
    *   **Root Directory**: `frontend`
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `dist`
3.  Under **Environment Variables**, add the API endpoints configuration:
    *   `VITE_API_URL`: `https://task-portal-backend.render.com/api`
4.  **SPA Routing Rewrite Rule**:
    To prevent client-side routing routes (e.g., `/dashboard`) from producing HTTP 404 errors when pages refresh, create a `vercel.json` configuration file in the root of the `frontend` folder:
    ```json
    {
      "rewrites": [
        { "source": "/(.*)", "destination": "/index.html" }
      ]
    }
    ```
5.  Click **Deploy**.

---

## 🔗 Architecture & Schema Verification Links

*   To check folder hierarchies of backend and frontend directories: [docs/architecture-guide.md](file:///c:/Resume%20Project/Task%20Management%20Portal/docs/architecture-guide.md)
*   To review the database model setup with schema configurations: [docs/database-design.md](file:///c:/Resume%20Project/Task%20Management%20Portal/docs/database-design.md)
