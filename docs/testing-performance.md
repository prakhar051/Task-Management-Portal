# 🧪 Testing & Performance Tuning
**System Validation Suites & Application Optimization Strategies**

---

## 🔬 1. System Testing Strategy

Quality assurance for the Task Management Portal is structured around three distinct validation layers:
*   **Unit Tests**: Isolated function logic validation (e.g., helper functions validating date ranges, status filters, or string operations).
*   **Integration Tests**: Validating combined module cycles. For example, testing the Express routing pipeline to confirm request validators (Zod) correctly block malformed payloads before execution reaches the database.
*   **End-to-End (E2E) Tests**: Simulating actual browser paths (such as user login, dashboard navigation, and card status transitions on the Kanban board).

---

## 🔌 2. API Verification via Postman

The REST interface is monitored using a Postman Collection. To implement automated test runs, a **Postman Collection Schema** is configured with environment variable assertions.

### 2.1 Postman Authorization Environment Chaining
When the `POST /api/auth/login` endpoint is run, the authentication cookie is automatically handled by the client. For setups where Bearer token headers are preferred, the collection uses a **Postman Pre-request / Tests Script** to capture and inject variables:

```json
{
  "info": {
    "name": "Task Management Portal Test Suite",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Authentication Tasks",
      "item": [
        {
          "name": "Login Session",
          "request": {
            "method": "POST",
            "header": [
              { "key": "Content-Type", "value": "application/json" }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"jane.doe@example.com\",\n  \"password\": \"Password123!\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/auth/login"
            }
          },
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test('Status code is 200', function () {",
                  "    pm.response.to.have.status(200);",
                  "});",
                  "var jsonData = pm.response.json();",
                  "pm.test('User session returned details', function () {",
                  "    pm.expect(jsonData.success).to.eql(true);",
                  "    pm.expect(jsonData.data.user.role).to.eql('MEMBER');",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ]
        }
      ]
    },
    {
      "name": "Core Task Resource CRUD",
      "item": [
        {
          "name": "Create Task Validations",
          "request": {
            "method": "POST",
            "header": [
              { "key": "Content-Type", "value": "application/json" }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"title\": \"\",\n  \"description\": \"Blank title task\",\n  \"priority\": \"INVALID_PRIORITY\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/tasks"
            }
          },
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test('Status code is 400 Bad Request', function () {",
                  "    pm.response.to.have.status(400);",
                  "});",
                  "var response = pm.response.json();",
                  "pm.test('Validators triggered field validation logs', function () {",
                  "    pm.expect(response.success).to.eql(false);",
                  "    pm.expect(response.errors.some(e => e.field === 'title')).to.be.true;",
                  "    pm.expect(response.errors.some(e => e.field === 'priority')).to.be.true;",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ]
        }
      ]
    }
  ]
}
```

---

## ⚡ 3. Performance Tuning Strategies

To sustain high user traffic loads while retaining sub-second navigation and query rates, performance optimizations are implemented in both the client and server layers.

---

### 3.1 Frontend Optimization (React.js)

#### A. Code Splitting & Route-Level Lazy Loading
Instead of compiling the entire component codebase into a single large browser script bundle on launch, paths are dynamically imported. The web bundle is split, importing route modules only when a user navigates to them:

```javascript
// src/App.jsx
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import FullscreenLoader from './components/common/FullscreenLoader';

// Lazy load route pages
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ManageTasks = lazy(() => import('./pages/ManageTasks'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<FullscreenLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin/tasks" element={<ManageTasks />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
```

#### B. Component Render Memoization
*   **`useCallback`**: Memoizes function handlers passed down to child components (e.g. card selection actions) to prevent unnecessary re-renders of the task list when parent state updates.
*   **`useMemo`**: Memoizes intensive calculations (like filtering large lists or computing analytics metrics for the dashboard charts) so they only recalculate when their dependencies change.

---

### 3.2 Backend & Database Optimization

#### A. Database Query Pagination (Cursor-based vs. Offset-based)
*   **Offset-based Pagination**: Used for standard page navigation components where users jump to specific page offsets.
    ```javascript
    // Fetching page 3 with page limit 10:
    const tasks = await prisma.task.findMany({
      skip: 20,
      take: 10,
      orderBy: { createdAt: 'desc' }
    });
    ```
*   **Cursor-based Pagination**: Preferred for large task histories or infinite-scroll lists, preventing query delays on millions of records by querying relative to a unique anchor value:
    ```javascript
    const tasks = await prisma.task.findMany({
      take: 10,
      cursor: { id: lastFetchedTaskId },
      skip: 1, // Skip the cursor element itself
      orderBy: { id: 'asc' }
    });
    ```

#### B. Connection Pooling via Neon PgBouncer
*   Serverless functions can quickly exhaust PostgreSQL connections. The database connection string is split into pooled routes targeting `port 5432` with PgBouncer enabled (`&pgbouncer=true`). This keeps connection counts small and reusable.

#### C. Database Indexing
*   Targeted indices are applied to search and relational criteria (`assigneeId`, `categoryId`, `[status, priority]`) to ensure database queries utilize index scans instead of slow sequential table scans.

---

## 🔗 Internal Configuration References

To check the schemas, designs, and security policies configured for these setups:
*   **Relational Model Schemes & Index Syntax**: [docs/database-design.md](file:///c:/Resume%20Project/Task%20Management%20Portal/docs/database-design.md)
*   **API Route Structure & Response Profiles**: [docs/api-documentation.md](file:///c:/Resume%20Project/Task%20Management%20Portal/docs/api-documentation.md)
*   **Environment Settings & Dev Scripts**: [docs/installation-deployment.md](file:///c:/Resume%20Project/Task%20Management%20Portal/docs/installation-deployment.md)
