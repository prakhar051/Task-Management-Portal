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

## 🎟️ 2. Session Management & JWT Lifecycle

Sessions utilize stateless **JSON Web Tokens (JWT)**.
*   **Token Expiry**: Set to `24 hours` (`86400 seconds`).
*   **Storage Strategy**: Tokens are **never** stored in client-side storage (e.g. `localStorage` or `sessionStorage`) due to vulnerability to Cross-Site Scripting (XSS) attacks. Instead, the server issues JWTs via a **secure HTTP-Only cookie**:

```http
Set-Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400
```

### Cookie Directives Explained:
*   `HttpOnly`: Prevents client-side scripts from reading the cookie value (nullifying JavaScript `document.cookie` leaks).
*   `Secure`: Ensures the cookie is only transmitted over encrypted `HTTPS` connections.
*   `SameSite=Strict`: Restricts cookie attachments to same-domain page contexts, preventing Cross-Site Request Forgery (CSRF).

---

## 👥 3. Role-Based Access Control (RBAC) Middleware

The system defines two authorization tiers: `ADMIN` and `MEMBER`.
*   **Member**: Allowed to read all tasks, edit tasks assigned to them, and toggle task status.
*   **Admin**: Inherits all Member actions, plus permissions to assign tasks, manage custom categories, and delete task records.

Here is the Express routing middleware implementation validating authorization scopes:

```javascript
// src/middlewares/auth.middleware.js
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';

export const authenticate = async (req, res, next) => {
  try {
    // Extract token from secure cookie
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ success: false, message: "Access token missing." });
    }

    // Verify token validity
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user account remains valid in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: "User account no longer exists." });
    }

    // Attach active session contexts to HTTP request object
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Access session expired or invalid." });
  }
};

// Middleware restricting routes to specified roles (e.g. ADMIN)
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
