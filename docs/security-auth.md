# 🛡️ Security & Authentication Model
**Task Management Portal Security Configuration & Compliance Protocols**

---

## 🔒 1. Cryptographic Password Hashing & Bcrypt Setup

To secure account passwords against leakages or rainbow-table lookup vectors:
*   **Hash Function**: `bcrypt` is used for irreversible cryptographic hashing.
*   **Work Factor**: A round parameter of `12` is configured, generating a secure hash payload with ~250ms processing duration per login attempt to protect against brute-force attacks.
*   **Password Schema Requirement**: Enforced validation via schemas requires:
    *   Minimum 8 characters.
    *   At least one uppercase and one lowercase letter.
    *   At least one numeric digit and one special character (e.g. `!`, `@`, `#`).

---

## 🎟️ 2. Session Management & Dual-Token JWT Lifecycle

The system enforces a **Dual-Token Authentication Strategy** to limit exposure of credential contexts:
1.  **Access Token**:
    *   **Lifetime**: Short-lived (15 minutes).
    *   **Payload**: Encodes User ID, Email, and Role.
    *   **Storage**: Kept strictly in-memory (inside Zustand client store). It is never written to disk or local browser storage.
    *   **Transport**: Attached manually to the `Authorization: Bearer <accessToken>` request header for private API routes.
2.  **Refresh Token**:
    *   **Lifetime**: Long-lived (7 days).
    *   **Payload**: Encodes User ID.
    *   **Storage**: Persisted securely in the database `Session` table (enabling device tracking and revoke-on-logout features) and set on the client via a secure cookie:
    ```http
    Set-Cookie: refreshToken=eyJhbGciOiJIUzI1NiIsIn...; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800
    ```

### 🔁 Refresh Token Rotation Workflow
When an Access Token expires (resulting in HTTP 401), the React client automatically routes a handshake to `POST /api/auth/refresh` carrying the secure cookie. The backend executes the following rotation pipeline:
1.  **Validate Token Signature**: Verifies refresh token decodes and matches `JWT_REFRESH_SECRET`.
2.  **Validate Session Persistence**: Searches the database `Session` table matching the token value. If missing, blocks access.
3.  **Expiry Check**: Verifies `expiresAt` is in the future.
4.  **Token Rotation**: Generates a new Access Token and a new Refresh Token. Deletes the old database session and inserts a new session (or updates the token field and expiry), invalidating the single-use token.
5.  **Set Cookie & Return JSON**: Attaches the new Refresh Token in a secure HTTP-Only cookie and returns the new Access Token in the JSON payload body.

---

## 🗄️ 3. Session Persistence & Authentication Logs

### 3.1 Session Database Model
To support multi-device logins and dynamic session revocation, session contexts are mapped in the database:
```prisma
model Session {
  id           String   @id @default(uuid())
  refreshToken String   @unique
  userId       String
  userAgent    String
  ipAddress    String
  expiresAt    DateTime
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### 3.2 Authentication Logging Engine
Every authentication state transition is recorded in the database to prevent brute force patterns and compile audit logs:
*   **Tracked Operations**: `REGISTRATION`, `LOGIN` (success/failed), `LOGOUT`, `REFRESH_TOKEN` (success/failed), `PASSWORD_CHANGE`, `PROFILE_UPDATE`.
*   **Logged Metadata**: User ID, Timestamp, Request IP Address, User Agent (Browser details), Action Type, and Status (SUCCESS | FAILED).

---

## 👥 4. Role-Based Access Control (RBAC) Middleware

The system defines three authorization tiers: `ADMIN`, `MANAGER`, and `EMPLOYEE`.
*   **Employee**: Regular member scope. Can access dashboard stats and their own profile/tasks.
*   **Manager**: Middle-tier management. Can review department workloads and project assignments.
*   **Admin**: High-tier system operator. Can configure custom departments, delete data, and override settings.

Here is the Express routing middleware implementation validating authorization scopes:

```javascript
// src/middlewares/auth.middleware.js
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';

export const authenticateUser = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "Access token missing." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: "User account no longer exists." });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: "Access token has expired." });
    }
    return res.status(401).json({ success: false, message: "Access token credentials invalid." });
  }
};

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have permissions to perform this action."
      });
    }
    next();
  };
};
```


---

## 🧱 4. Web Server Shield Config (Helmet, CORS, Rate Limiting)

The Express backend configures key production safety libraries to secure the web server boundaries:

```javascript
// src/app.js
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

const app = express();

// 1. HTTP Security Headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://raw.githubusercontent.com"],
      connectSrc: ["'self'", "http://localhost:5000", "https://task-portal-backend.render.com"]
    }
  },
  xssFilter: true, // Header protection for older browsers
  noSniff: true,   // Block mime-sniffing
  frameguard: { action: 'deny' } // Clickjacking prevention
}));

// 2. Cross-Origin Requests Control
const allowedOrigins = [
  'http://localhost:5173',
  'https://task-portal-app.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy.'));
    }
  },
  credentials: true, // Enables client cookie handling
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. API Request Rate Limiting
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 100, // Limit each IP to 100 requests per window
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes."
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use('/api/', rateLimiter);
app.use(express.json({ limit: '10kb' })); // Prevents payload body-bloat DDoS
app.use(cookieParser());
```

---

## 🛡️ 5. Mitigation Policies for Key Vulnerability Vectors

### 5.1 SQL Injection Prevention
*   **Mechanism**: Prisma ORM maps database entities and enforces parameterized queries out of the box. Variables passed in query parameters are treated strictly as data parameters, never interpreted as raw executable SQL commands.
*   **Example safety**:
    ```javascript
    // Even if data.title contains: " ' OR '1'='1 "
    // Prisma executes safely as a parameterized variable:
    prisma.task.create({ data: { title: data.title } })
    ```

### 5.2 XSS (Cross-Site Scripting)
*   **Sanitization**: Input validation schemas (using Zod) strip HTML syntax tags from fields, preventing stored script injections.
*   **React Rendering**: React automatically escapes markup properties, ensuring data strings are output as plain text nodes, not executable HTML tags.

### 5.3 CSRF (Cross-Site Request Forgery)
*   **SameSite Cookie Flag**: The auth token is generated using the `SameSite=Strict` directive, blocking the browser from attaching the authentication cookie to third-party link requests.

---

## 🔗 Internal Directory Links

*   For endpoint request structures and response schemas: [docs/api-documentation.md](file:///c:/Resume%20Project/Task%20Management%20Portal/docs/api-documentation.md)
*   For the data models and relations setup: [docs/database-design.md](file:///c:/Resume%20Project/Task%20Management%20Portal/docs/database-design.md)
*   For deployment guidelines of keys and environment details: [docs/installation-deployment.md](file:///c:/Resume%20Project/Task%20Management%20Portal/docs/installation-deployment.md)
