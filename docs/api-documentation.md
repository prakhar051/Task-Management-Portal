# 🔌 REST API Documentation
**Task Management Portal API Specification**

---

## 🌐 1. Connection Configurations

### Base URLs
*   **Development**: `http://localhost:5000/api`
*   **Production**: `https://task-portal-backend.render.com/api`

### Global Content Schema
All request payloads and response bodies must adhere strictly to the JSON standard.
*   **Default Headers Required**:
    ```http
    Content-Type: application/json
    Accept: application/json
    ```

### Global Error Payload Format
If an API operation fails, a standardized JSON envelope is returned along with the matching HTTP status code:
```json
{
  "success": false,
  "message": "Invalid request parameters provided.",
  "errors": [
    {
      "field": "title",
      "issue": "Title cannot be empty"
    },
    {
      "field": "dueDate",
      "issue": "Must be a valid ISO-8601 date string"
    }
  ]
}
```

---

## 🔒 2. Authentication Endpoints

### 2.1 Register New User
Creates a new member account.
*   **Method**: `POST`
*   **Path**: `/auth/register`
*   **Access Control**: Public
*   **Request Body**:
    ```json
    {
      "name": "Jane Doe",
      "email": "jane.doe@example.com",
      "password": "Password123!",
      "role": "MEMBER"
    }
    ```
*   **Response Headers**: None
*   **Response Codes & Payloads**:
    *   `201 Created`
        ```json
        {
          "success": true,
          "message": "User registered successfully.",
          "data": {
            "id": "usr_90a1b2c3d4e5f6g7",
            "name": "Jane Doe",
            "email": "jane.doe@example.com",
            "role": "MEMBER",
            "createdAt": "2026-08-03T10:00:00.000Z"
          }
        }
        ```
    *   `400 Bad Request` (Email already registered or validation failed)
        ```json
        {
          "success": false,
          "message": "Email address already registered.",
          "errors": []
        }
        ```

---

### 2.2 Login User
Authenticates a user, sets an HTTP-only secure cookie session, and returns an access token.
*   **Method**: `POST`
*   **Path**: `/auth/login`
*   **Access Control**: Public
*   **Request Body**:
    ```json
    {
      "email": "jane.doe@example.com",
      "password": "Password123!"
    }
    ```
*   **Response Headers**:
    ```http
    Set-Cookie: refreshToken=eyJhbGciOiJIUzI1NiIsIn...; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800
    ```
*   **Response Codes & Payloads**:
    *   `200 OK`
        ```json
        {
          "success": true,
          "message": "Authentication successful.",
          "data": {
            "user": {
              "id": "usr_90a1b2c3d4e5f6g7",
              "name": "Jane Doe",
              "email": "jane.doe@example.com",
              "role": "EMPLOYEE"
            },
            "accessToken": "eyJhbGciOiJIUzI1NiIsIn..."
          }
        }
        ```
    *   `401 Unauthorized` (Invalid email or password)
        ```json
        {
          "success": false,
          "message": "Invalid email or password.",
          "errors": []
        }
        ```

---

### 2.3 Rotate Access Token
Rotates the session and returns a new Access Token.
*   **Method**: `POST`
*   **Path**: `/auth/refresh`
*   **Access Control**: Public (reads `refreshToken` cookie)
*   **Request Body**: None
*   **Response Headers**:
    ```http
    Set-Cookie: refreshToken=new_eyJhbGciOiJIUzI1NiIsIn...; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800
    ```
*   **Response Codes & Payloads**:
    *   `200 OK`
        ```json
        {
          "success": true,
          "message": "Token session rotated successfully.",
          "data": {
            "accessToken": "new_eyJhbGciOiJIUzI1NiIsIn..."
          }
        }
        ```
    *   `401 Unauthorized` (Session token invalid or expired)
        ```json
        {
          "success": false,
          "message": "Session token validation failed.",
          "errors": []
        }
        ```

---

### 2.4 Logout User
Invalidates the database session and clears cookies.
*   **Method**: `POST`
*   **Path**: `/auth/logout`
*   **Access Control**: Authenticated (Bearer Access Token + Refresh Cookie)
*   **Request Body**: None
*   **Response Headers**:
    ```http
    Set-Cookie: refreshToken=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0
    ```
*   **Response Codes & Payloads**:
    *   `200 OK`
        ```json
        {
          "success": true,
          "message": "Session logged out successfully."
        }
        ```

---

### 2.5 Get Current User Profile
Retrieves metadata details for the active session.
*   **Method**: `GET`
*   **Path**: `/auth/me`
*   **Access Control**: Authenticated (Bearer Access Token)
*   **Request Body**: None
*   **Response Codes & Payloads**:
    *   `200 OK`
        ```json
        {
          "success": true,
          "message": "Profile details retrieved successfully.",
          "data": {
            "user": {
              "id": "usr_90a1b2c3d4e5f6g7",
              "name": "Jane Doe",
              "email": "jane.doe@example.com",
              "role": "EMPLOYEE",
              "createdAt": "2026-08-03T10:00:00.000Z"
            }
          }
        }
        ```
    *   `401 Unauthorized` (Access token missing or expired)
        ```json
        {
          "success": false,
          "message": "Access token has expired."
        }
        ```

---

### 2.6 Update User Profile
Updates user name or email.
*   **Method**: `PATCH`
*   **Path**: `/auth/profile`
*   **Access Control**: Authenticated (Bearer Access Token)
*   **Request Body**:
    ```json
    {
      "name": "Jane Doe Updated",
      "email": "jane.updated@example.com"
    }
    ```
*   **Response Codes & Payloads**:
    *   `200 OK`
        ```json
        {
          "success": true,
          "message": "Profile attributes updated successfully.",
          "data": {
            "user": {
              "id": "usr_90a1b2c3d4e5f6g7",
              "name": "Jane Doe Updated",
              "email": "jane.updated@example.com",
              "role": "EMPLOYEE"
            }
          }
        }
        ```

---

### 2.7 Change Password
Modifies account password.
*   **Method**: `PATCH`
*   **Path**: `/auth/change-password`
*   **Access Control**: Authenticated (Bearer Access Token)
*   **Request Body**:
    ```json
    {
      "oldPassword": "Password123!",
      "newPassword": "NewStrongPassword123!"
    }
    ```
*   **Response Codes & Payloads**:
    *   `200 OK`
        ```json
        {
          "success": true,
          "message": "Password changed successfully.",
          "data": null
        }
        ```
    *   `400 Bad Request` (New password same as old or complexity check fails)
        ```json
        {
          "success": false,
          "message": "Validation verification checks failed.",
          "errors": [
            {
              "field": "newPassword",
              "message": "Password must be at least 8 characters long."
            }
          ]
        }
        ```

---


## 📋 3. Task Endpoints

### 3.1 List Tasks
Queries tasks with pagination, search, status, and priority filtering.
*   **Method**: `GET`
*   **Path**: `/tasks`
*   **Access Control**: Authenticated (Member, Admin)
*   **Query Parameters**:
    *   `page` (optional, default: `1`): Page number.
    *   `limit` (optional, default: `10`): Max tasks per response page.
    *   `status` (optional): Filter by `TODO`, `IN_PROGRESS`, `COMPLETED`.
    *   `priority` (optional): Filter by `LOW`, `MEDIUM`, `HIGH`.
    *   `search` (optional): Search string matching Title or Description fields.
    *   `categoryId` (optional): Filter tasks belonging to a specific category UUID.
*   **Response Codes & Payloads**:
    *   `200 OK`
        ```json
        {
          "success": true,
          "data": {
            "tasks": [
              {
                "id": "tsk_55b6c7d8e9f0a1b2",
                "title": "Database Schema Setup",
                "description": "Configure tables for relational normalization and write db migrations.",
                "status": "IN_PROGRESS",
                "priority": "HIGH",
                "dueDate": "2026-08-15T18:00:00.000Z",
                "assignee": {
                  "id": "usr_90a1b2c3d4e5f6g7",
                  "name": "Jane Doe",
                  "email": "jane.doe@example.com"
                },
                "category": {
                  "id": "cat_11a2b3c4d5e6f7g8",
                  "name": "Database Engineering"
                },
                "createdAt": "2026-08-03T10:30:00.000Z"
              }
            ],
            "pagination": {
              "totalItems": 1,
              "totalPages": 1,
              "currentPage": 1,
              "limit": 10
            }
          }
        }
        ```

---

### 3.2 Create New Task
Instantiates a new workflow task.
*   **Method**: `POST`
*   **Path**: `/tasks`
*   **Access Control**: Authenticated (Member, Admin)
*   **Request Body**:
    ```json
    {
      "title": "Setup Integration Tests",
      "description": "Establish a test script harness validating mock user auth flows.",
      "priority": "MEDIUM",
      "dueDate": "2026-08-20T17:00:00.000Z",
      "categoryId": "cat_11a2b3c4d5e6f7g8",
      "assigneeId": "usr_90a1b2c3d4e5f6g7"
    }
    ```
*   **Response Codes & Payloads**:
    *   `201 Created`
        ```json
        {
          "success": true,
          "message": "Task created successfully.",
          "data": {
            "id": "tsk_88c9d0e1f2a3b4c5",
            "title": "Setup Integration Tests",
            "description": "Establish a test script harness validating mock user auth flows.",
            "status": "TODO",
            "priority": "MEDIUM",
            "dueDate": "2026-08-20T17:00:00.000Z",
            "categoryId": "cat_11a2b3c4d5e6f7g8",
            "assigneeId": "usr_90a1b2c3d4e5f6g7",
            "creatorId": "usr_admin_master_1",
            "createdAt": "2026-08-03T10:45:00.000Z"
          }
        }
        ```
    *   `400 Bad Request` (Missing fields or invalid relationships)
        ```json
        {
          "success": false,
          "message": "Associated category or assignee user not found.",
          "errors": []
        }
        ```

---

### 3.3 Update Entire Task (Full Edit)
Performs complete field adjustments for the selected task.
*   **Method**: `PUT`
*   **Path**: `/tasks/:id`
*   **Access Control**: Authenticated (Member, Admin)
*   **Request Body**:
    ```json
    {
      "title": "Setup Integration Tests & Mock Data",
      "description": "Establish a test script harness and seed JSON schemas.",
      "priority": "HIGH",
      "status": "IN_PROGRESS",
      "dueDate": "2026-08-22T17:00:00.000Z",
      "categoryId": "cat_11a2b3c4d5e6f7g8",
      "assigneeId": "usr_90a1b2c3d4e5f6g7"
    }
    ```
*   **Response Codes & Payloads**:
    *   `200 OK`
        ```json
        {
          "success": true,
          "message": "Task updated successfully.",
          "data": {
            "id": "tsk_88c9d0e1f2a3b4c5",
            "title": "Setup Integration Tests & Mock Data",
            "description": "Establish a test script harness and seed JSON schemas.",
            "status": "IN_PROGRESS",
            "priority": "HIGH",
            "dueDate": "2026-08-22T17:00:00.000Z",
            "categoryId": "cat_11a2b3c4d5e6f7g8",
            "assigneeId": "usr_90a1b2c3d4e5f6g7",
            "updatedAt": "2026-08-03T11:00:00.000Z"
          }
        }
        ```
    *   `404 Not Found`
        ```json
        {
          "success": false,
          "message": "Task matching ID 'tsk_88c9d0e1f2a3b4c5' not found."
        }
        ```

---

### 3.4 Patch Task Status
Quick status transition endpoint (e.g., drag-and-drop on Kanban).
*   **Method**: `PATCH`
*   **Path**: `/tasks/:id/status`
*   **Access Control**: Authenticated (Member, Admin)
*   **Request Body**:
    ```json
    {
      "status": "COMPLETED"
    }
    ```
*   **Response Codes & Payloads**:
    *   `200 OK`
        ```json
        {
          "success": true,
          "message": "Task status transitioned successfully.",
          "data": {
            "id": "tsk_88c9d0e1f2a3b4c5",
            "status": "COMPLETED",
            "updatedAt": "2026-08-03T11:15:00.000Z"
          }
        }
        ```

---

### 3.5 Delete Task
Permanently deletes a task.
*   **Method**: `DELETE`
*   **Path**: `/tasks/:id`
*   **Access Control**: Admin Only
*   **Request Body**: None
*   **Response Codes & Payloads**:
    *   `200 OK`
        ```json
        {
          "success": true,
          "message": "Task successfully purged from persistent storage."
        }
        ```
    *   `403 Forbidden` (Member attempts deletion)
        ```json
        {
          "success": false,
          "message": "Administrator privileges required to execute delete actions."
        }
        ```

---

## 📁 4. Category Endpoints

### 4.1 List Categories
Gets all categories for task tags.
*   **Method**: `GET`
*   **Path**: `/categories`
*   **Access Control**: Authenticated (Member, Admin)
*   **Request Body**: None
*   **Response Codes & Payloads**:
    *   `200 OK`
        ```json
        {
          "success": true,
          "data": [
            {
              "id": "cat_11a2b3c4d5e6f7g8",
              "name": "Database Engineering",
              "description": "Relational schemes, migration steps, and ORM settings.",
              "createdAt": "2026-08-03T09:00:00.000Z"
            }
          ]
        }
        ```

### 4.2 Create Category
Creates a new task category.
*   **Method**: `POST`
*   **Path**: `/categories`
*   **Access Control**: Admin Only
*   **Request Body**:
    ```json
    {
      "name": "Frontend Engineering",
      "description": "Component layouts, styles, and routing structures."
    }
    ```
*   **Response Codes & Payloads**:
    *   `201 Created`
        ```json
        {
          "success": true,
          "message": "Category created successfully.",
          "data": {
            "id": "cat_22b3c4d5e6f7g8h9",
            "name": "Frontend Engineering",
            "description": "Component layouts, styles, and routing structures.",
            "createdAt": "2026-08-03T11:20:00.000Z"
          }
        }
        ```

---

## 👥 5. User Resource Endpoints

### 5.1 List All Users
Used by administrators to populate task assignee dropdown menus.
*   **Method**: `GET`
*   **Path**: `/users`
*   **Access Control**: Authenticated (Member, Admin)
*   **Request Body**: None
*   **Response Codes & Payloads**:
    *   `200 OK`
        ```json
        {
          "success": true,
          "data": [
            {
              "id": "usr_admin_master_1",
              "name": "Admin Operator",
              "email": "admin@taskportal.demo",
              "role": "ADMIN"
            },
            {
              "id": "usr_90a1b2c3d4e5f6g7",
              "name": "Jane Doe",
              "email": "jane.doe@example.com",
              "role": "MEMBER"
            }
          ]
        }
        ```

## 📊 6. Dashboard Endpoints

### 6.1 Get Overview Metrics
Returns aggregate statistics tailored to the authenticated user's role.
*   **Method**: `GET`
*   **Path**: `/dashboard/overview`
*   **Access Control**: Authenticated (ADMIN, MANAGER, EMPLOYEE)
*   **Request Body**: None
*   **Response Codes & Payloads**:
    *   `200 OK` (ADMIN response template example)
        ```json
        {
          "success": true,
          "message": "Dashboard overview statistics retrieved successfully.",
          "data": {
            "totalEmployees": 24,
            "totalDepartments": 4,
            "totalProjects": 8,
            "activeProjects": 5,
            "completedProjects": 3,
            "totalTasks": 210,
            "pendingTasks": 42,
            "completedTasks": 168,
            "overdueTasks": 3
          }
        }
        ```

---

### 6.2 Get Recent Activity Logs
Returns the latest workspace activities list (limit 10).
*   **Method**: `GET`
*   **Path**: `/dashboard/activity`
*   **Access Control**: Authenticated (ADMIN, MANAGER, EMPLOYEE)
*   **Request Body**: None
*   **Response Codes & Payloads**:
    *   `200 OK`
        ```json
        {
          "success": true,
          "message": "Recent dashboard activity logs retrieved successfully.",
          "data": [
            {
              "id": "act_1",
              "userId": "usr_admin_1",
              "user": "Admin Operator",
              "action": "PROJECT_CREATED",
              "details": "Project 'Task Management Portal' created",
              "timestamp": "2026-08-03T10:00:00.000Z"
            }
          ]
        }
        ```

---

### 6.3 Get Recent Notifications
Returns notifications alerts matching user credentials.
*   **Method**: `GET`
*   **Path**: `/dashboard/notifications`
*   **Access Control**: Authenticated (ADMIN, MANAGER, EMPLOYEE)
*   **Request Body**: None
*   **Response Codes & Payloads**:
    *   `200 OK`
        ```json
        {
          "success": true,
          "message": "Recent user notifications retrieved successfully.",
          "data": [
            {
              "id": "not_1",
              "userId": "usr_emp_1",
              "message": "New task 'Secure JWT Handshake' assigned to you by Jane Manager",
              "read": false,
              "type": "ASSIGNMENT",
              "createdAt": "2026-08-03T10:30:00.000Z"
            }
          ]
        }
        ```

---

### 6.4 Get Chart Datasets
Returns structured configurations suitable for responsive Recharts widgets.
*   **Method**: `GET`
*   **Path**: `/dashboard/charts`
*   **Access Control**: Authenticated (ADMIN, MANAGER, EMPLOYEE)
*   **Request Body**: None
*   **Response Codes & Payloads**:
    *   `200 OK`
        ```json
        {
          "success": true,
          "message": "Dashboard analytics chart datasets retrieved successfully.",
          "data": {
            "tasksByStatus": [
              { "name": "To-Do", "value": 15, "fill": "#64748b" },
              { "name": "In Progress", "value": 25, "fill": "#3b4ee0" },
              { "name": "Completed", "value": 60, "fill": "#10b981" }
            ],
            "tasksByPriority": [
              { "name": "Low", "value": 45, "fill": "#3b82f6" },
              { "name": "Medium", "value": 35, "fill": "#f59e0b" },
              { "name": "High", "value": 20, "fill": "#ef4444" }
            ],
            "projectsByStatus": [
              { "name": "To-Do", "count": 2 },
              { "name": "In Progress", "count": 4 },
              { "name": "Completed", "count": 2 }
            ],
            "weeklyTaskCompletion": [
              { "day": "Mon", "completed": 4 },
              { "day": "Tue", "completed": 8 }
            ],
            "monthlyPerformance": [
              { "month": "Jan", "score": 68 },
              { "month": "Feb", "score": 75 }
            ]
          }
        }
        ```

---

## 👥 7. Employee Endpoints

### 7.1 List Employees (Paginated & Filtered)
Queries employee roster cards.
*   **Method**: `GET`
*   **Path**: `/employees`
*   **Access Control**: Authenticated (ADMIN, MANAGER)
*   **Query Parameters**:
    *   `page` (optional, default: `1`)
    *   `limit` (optional, default: `10`)
    *   `search` (optional)
    *   `status` (optional: `ACTIVE | INACTIVE | ON_LEAVE`)
    *   `designation` (optional)
    *   `isDeleted` (optional, default: `false` - set to `true` to list trash items)
    *   `sortBy` (optional)
    *   `sortOrder` (optional, `asc` | `desc`)
*   **Response Codes & Payloads**:
    *   `200 OK`
        ```json
        {
          "success": true,
          "message": "Employees retrieved successfully.",
          "data": [
            {
              "id": "emp_01a02b03c04d05e0",
              "employeeCode": "EMP-2026-0001",
              "firstName": "John",
              "lastName": "Doe",
              "email": "john.doe@example.com",
              "phone": "555-019-2834",
              "designation": "Software Engineer",
              "status": "ACTIVE",
              "hireDate": "2026-08-01T00:00:00.000Z",
              "avatar": "/uploads/avatars/avatar-1234.png"
            }
          ],
          "pagination": {
            "page": 1,
            "limit": 10,
            "total": 1,
            "pages": 1
          }
        }
        ```

---

### 7.2 Get Employee By ID
Fetches details of a single employee.
*   **Method**: `GET`
*   **Path**: `/employees/:id`
*   **Access Control**: Authenticated (ADMIN, MANAGER, or Owner EMPLOYEE)
*   **Response Codes & Payloads**:
    *   `200 OK`
        ```json
        {
          "success": true,
          "message": "Employee details retrieved successfully.",
          "data": {
            "id": "emp_01a02b03c04d05e0",
            "employeeCode": "EMP-2026-0001",
            "firstName": "John",
            "lastName": "Doe",
            "email": "john.doe@example.com",
            "phone": "555-019-2834",
            "designation": "Software Engineer",
            "status": "ACTIVE",
            "hireDate": "2026-08-01T00:00:00.000Z",
            "avatar": "/uploads/avatars/avatar-1234.png"
          }
        }
        ```

---

### 7.3 Create Employee Profile
Creates a new profile record.
*   **Method**: `POST`
*   **Path**: `/employees`
*   **Access Control**: Admin Only
*   **Request Body**:
    ```json
    {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "555-019-2834",
      "designation": "Software Engineer",
      "hireDate": "2026-08-01T00:00:00.000Z",
      "status": "ACTIVE"
    }
    ```
*   **Response Codes & Payloads**:
    *   `201 Created`
        ```json
        {
          "success": true,
          "message": "Employee profile created successfully.",
          "data": {
            "id": "emp_01a02b03c04d05e0",
            "employeeCode": "EMP-2026-0001",
            "firstName": "John",
            "lastName": "Doe",
            "email": "john.doe@example.com"
          }
        }
        ```

---

### 7.4 Update Employee Profile
Updates metadata fields.
*   **Method**: `PATCH`
*   **Path**: `/employees/:id`
*   **Access Control**: Authenticated (ADMIN, MANAGER, or Profile Owner)
*   **Request Body**:
    ```json
    {
      "designation": "Senior Software Engineer"
    }
    ```
*   **Response Codes & Payloads**:
    *   `200 OK`
        ```json
        {
          "success": true,
          "message": "Employee profile updated successfully."
        }
        ```

---

### 7.5 Soft Delete Employee
Moves employee to trash.
*   **Method**: `DELETE`
*   **Path**: `/employees/:id`
*   **Access Control**: Admin Only
*   **Response Codes & Payloads**:
    *   `200 OK`
        ```json
        {
          "success": true,
          "message": "Employee profile soft deleted successfully."
        }
        ```

---

### 7.6 Restore Employee
Recovers soft-deleted employee record from trash.
*   **Method**: `PATCH`
*   **Path**: `/employees/:id/restore`
*   **Access Control**: Admin Only
*   **Response Codes & Payloads**:
    *   `200 OK`
        ```json
        {
          "success": true,
          "message": "Employee profile restored successfully."
        }
        ```

---

### 7.7 Upload Avatar Image
Uploads avatar image using multipart request.
*   **Method**: `PATCH`
*   **Path**: `/employees/:id/avatar`
*   **Access Control**: Authenticated (ADMIN or Profile Owner)
*   **Request Body**: Multipart form data with key `avatar` containing file.
*   **Response Codes & Payloads**:
    *   `200 OK`
        ```json
        {
          "success": true,
          "message": "Avatar uploaded successfully.",
          "data": {
            "avatar": "/uploads/avatars/avatar-1234.png"
          }
        }
        ```

---

### 7.8 Bulk Soft Delete
Deletes multiple employee records in a single call.
*   **Method**: `DELETE`
*   **Path**: `/employees/bulk`
*   **Access Control**: Admin Only
*   **Request Body**:
    ```json
    {
      "ids": ["emp_01a02b03c04d05e0", "emp_99z88y77x66w55v4"]
    }
    ```
*   **Response Codes & Payloads**:
    *   `200 OK`
        ```json
        {
          "success": true,
          "message": "Bulk soft delete operation completed successfully."
        }
        ```

---

### 7.9 Bulk Update Status
Modifies status for multiple records.
*   **Method**: `PATCH`
*   **Path**: `/employees/bulk-status`
*   **Access Control**: Admin Only
*   **Request Body**:
    ```json
    {
      "ids": ["emp_01a02b03c04d05e0"],
      "status": "ON_LEAVE"
    }
    ```
*   **Response Codes & Payloads**:
    *   `200 OK`
        ```json
        {
          "success": true,
          "message": "Bulk status update completed successfully."
        }
        ```

---

### 7.10 Bulk Restore
Restores multiple soft-deleted employees.
*   **Method**: `PATCH`
*   **Path**: `/employees/bulk-restore`
*   **Access Control**: Admin Only
*   **Request Body**:
    ```json
    {
      "ids": ["emp_01a02b03c04d05e0"]
    }
    ```
*   **Response Codes & Payloads**:
    *   `200 OK`
        ```json
        {
          "success": true,
          "message": "Bulk restore operation completed successfully."
        }
        ```

---

### 7.11 Export Employee List
Downloads employee records as file download blocks.
*   **Method**: `GET`
*   **Path**: `/employees/export`
*   **Access Control**: Authenticated (ADMIN, MANAGER)
*   **Query Parameters**:
    *   `format` (`csv` | `xlsx`)
*   **Response Headers**:
    *   `Content-Disposition: attachment; filename=employees_export.csv`
    *   `Content-Type: text/csv`
*   **Response Payload**: CSV Text string data.

---

## 🏢 8. Department Endpoints

### 8.1 List Departments (Paginated & Filtered)
Queries department roster directory.
*   **Method**: `GET`
*   **Path**: `/departments`
*   **Access Control**: Authenticated (ADMIN, MANAGER, or Owner EMPLOYEE)
*   **Query Parameters**:
    *   `page` (optional, default: `1`)
    *   `limit` (optional, default: `10`)
    *   `search` (optional)
    *   `status` (optional: `ACTIVE | INACTIVE`)
    *   `location` (optional)
    *   `isDeleted` (optional, default: `false` - set to `true` to view trash)
    *   `sortBy` (optional: `name | employeeCount | createdAt | updatedAt`)
    *   `sortOrder` (optional, `asc` | `desc`)
*   **Response Codes & Payloads**:
    *   `200 OK`
        ```json
        {
          "success": true,
          "message": "Departments retrieved successfully.",
          "data": [
            {
              "id": "dept_01a02b03c04d05e0",
              "name": "Engineering",
              "code": "ENG",
              "description": "Software products delivery",
              "location": "Building A, Floor 3",
              "email": "eng@company.com",
              "phone": "555-019-2834",
              "status": "ACTIVE",
              "manager": {
                "id": "emp_111",
                "firstName": "John",
                "lastName": "Doe"
              },
              "_count": {
                "employees": 12
              }
            }
          ],
          "pagination": {
            "page": 1,
            "limit": 10,
            "total": 1,
            "pages": 1
          }
        }
        ```

---

### 8.2 Get Department By ID
Fetches details of a single department.
*   **Method**: `GET`
*   **Path**: `/departments/:id`
*   **Access Control**: Authenticated (ADMIN, MANAGER, or Owner EMPLOYEE)
*   **Response Codes & Payloads**:
    *   `200 OK`
        ```json
        {
          "success": true,
          "message": "Department details retrieved successfully.",
          "data": {
            "id": "dept_01a02b03c04d05e0",
            "name": "Engineering",
            "code": "ENG",
            "description": "Software products delivery",
            "location": "Building A, Floor 3",
            "email": "eng@company.com",
            "phone": "555-019-2834",
            "status": "ACTIVE",
            "manager": {
              "id": "emp_111",
              "firstName": "John",
              "lastName": "Doe"
            },
            "_count": {
              "employees": 12
            }
          }
        }
        ```

---

### 8.3 Create Department
Creates a new department record.
*   **Method**: `POST`
*   **Path**: `/departments`
*   **Access Control**: Admin Only
*   **Request Body**:
    ```json
    {
      "name": "Engineering",
      "code": "ENG",
      "location": "Building A, Floor 3",
      "email": "eng@company.com",
      "phone": "555-019-2834",
      "status": "ACTIVE"
    }
    ```
*   **Response Codes & Payloads**:
    *   `201 Created`
        ```json
        {
          "success": true,
          "message": "Department created successfully.",
          "data": {
            "id": "dept_01a02b03c04d05e0",
            "name": "Engineering",
            "code": "ENG"
          }
        }
        ```

---

### 8.4 Update Department Details
Edits metadata attributes.
*   **Method**: `PATCH`
*   **Path**: `/departments/:id`
*   **Access Control**: Admin Only
*   **Request Body**:
    ```json
    {
      "location": "Building C, Floor 4"
    }
    ```
*   **Response Codes & Payloads**:
    *   `200 OK`
        ```json
        {
          "success": true,
          "message": "Department updated successfully."
        }
        ```

---

### 8.5 Soft Delete Department
Moves department to trash and dissociates active manager/employee department ids.
*   **Method**: `DELETE`
*   **Path**: `/departments/:id`
*   **Access Control**: Admin Only
*   **Response Codes & Payloads**:
    *   `200 OK`
        ```json
        {
          "success": true,
          "message": "Department soft deleted successfully."
        }
        ```

---

### 8.6 Restore Department
Restores a soft-deleted department.
*   **Method**: `PATCH`
*   **Path**: `/departments/:id/restore`
*   **Access Control**: Admin Only
*   **Response Codes & Payloads**:
    *   `200 OK`
        ```json
        {
          "success": true,
          "message": "Department restored successfully."
        }
        ```

---

### 8.7 Assign Department Manager
Maps managing employee to department, enforcing "one manager per department" rule.
*   **Method**: `PATCH`
*   **Path**: `/departments/:id/manager`
*   **Access Control**: Admin Only
*   **Request Body**:
    ```json
    {
      "managerId": "emp_111"
    }
    ```
*   **Response Codes & Payloads**:
    *   `200 OK`
        ```json
        {
          "success": true,
          "message": "Department manager assigned successfully."
        }
        ```

---

### 8.8 Get Department Employees
Lists employees mapped to department.
*   **Method**: `GET`
*   **Path**: `/departments/:id/employees`
*   **Access Control**: Authenticated (ADMIN, MANAGER, or Owner EMPLOYEE)
*   **Response Payload**: Array of Employee records.

---

### 8.9 Allocate Employees to Department
Assigns multiple employees to department (bulk mapping).
*   **Method**: `PATCH`
*   **Path**: `/departments/:id/employees`
*   **Access Control**: Admin Only
*   **Request Body**:
    ```json
    {
      "employeeIds": ["emp_111", "emp_222"]
    }
    ```
*   **Response Codes & Payloads**:
    *   `200 OK`
        ```json
        {
          "success": true,
          "message": "Employees assigned to department successfully."
        }
        ```

---

### 8.10 Get General Department Statistics
Generates overall roster statistics.
*   **Method**: `GET`
*   **Path**: `/departments/statistics`
*   **Access Control**: Authenticated (ADMIN, MANAGER)
*   **Response Codes & Payloads**:
    *   `200 OK`
        ```json
        {
          "success": true,
          "data": {
            "totalDepartments": 4,
            "activeDepartments": 3,
            "inactiveDepartments": 1,
            "totalEmployees": 40,
            "activeEmployees": 35,
            "largestDepartment": "Engineering",
            "smallestDepartment": "Marketing",
            "averageEmployeesPerDepartment": "10.0",
            "managerAssigned": 2,
            "departmentsWithoutManagers": 2,
            "openPositions": 15
          }
        }
        ```

---

### 8.11 Bulk Operations (Soft Delete, Status, Restore)
Admin tool actions:
*   `DELETE /departments/bulk` -> body `{ ids: [UUID] }`
*   `PATCH /departments/bulk-status` -> body `{ ids: [UUID], status: "ACTIVE" }`
*   `PATCH /departments/bulk-restore` -> body `{ ids: [UUID] }`

---

### 8.12 Export Departments
Downloads CSV or XLSX files.
*   **Method**: `GET`
*   **Path**: `/departments/export`
*   **Access Control**: Authenticated (ADMIN, MANAGER)
*   **Query Parameters**:
    *   `format` (`csv` | `xlsx`)
*   **Response Payload**: CSV Text string data.

---

## 📂 9. Project Endpoints

### 9.1 List Projects (Paginated & Filtered)
Queries projects directory with RBAC restrictions.
*   **Method**: `GET`
*   **Path**: `/projects`
*   **Access Control**: Authenticated (ADMIN: full, MANAGER: own dept/projects, EMPLOYEE: member only)
*   **Query Parameters**:
    *   `page` (optional, default: `1`)
    *   `limit` (optional, default: `10`)
    *   `search` (optional)
    *   `status` (optional)
    *   `priority` (optional)
    *   `departmentId` (optional)
    *   `managerId` (optional)
    *   `isDeleted` (optional, default: `false`)
    *   `sortBy` (optional, `name | progress | startDate | endDate | createdAt`)
    *   `sortOrder` (optional, `asc | desc`)
*   **Response Codes & Payloads**:
    *   `200 OK`
        ```json
        {
          "success": true,
          "message": "Projects retrieved successfully.",
          "data": [
            {
              "id": "proj_uuid",
              "code": "PROJ-101",
              "name": "Cloud Portal",
              "status": "ACTIVE",
              "priority": "HIGH",
              "progress": 45,
              "department": { "id": "dept_id", "name": "Engineering" },
              "manager": { "id": "emp_id", "firstName": "Alice", "lastName": "Smith" },
              "_count": { "members": 5 }
            }
          ],
          "pagination": { "page": 1, "limit": 10, "total": 1, "pages": 1 }
        }
        ```

---

### 9.2 Get Project By ID
Fetches details of a single project.
*   **Method**: `GET`
*   **Path**: `/projects/:id`
*   **Access Control**: Authenticated (RBAC protected)
*   **Response Payload**: Returns full project model including manager, department, and member list.

---

### 9.3 Create Project
Registers a new project track.
*   **Method**: `POST`
*   **Path**: `/projects`
*   **Access Control**: Admin Only
*   **Request Body**:
    ```json
    {
      "name": "Cloud Portal",
      "code": "PROJ-101",
      "departmentId": "dept_uuid",
      "startDate": "2026-08-01T00:00:00.000Z",
      "endDate": "2026-12-31T00:00:00.000Z",
      "priority": "HIGH",
      "status": "ACTIVE",
      "progress": 0,
      "budget": 75000
    }
    ```
*   **Response Codes & Payloads**:
    *   `201 Created`

---

### 9.4 Update Project Details
Edits project attributes.
*   **Method**: `PATCH`
*   **Path**: `/projects/:id`
*   **Access Control**: Admin Only
*   **Request Body**: `{ "progress": 50 }`

---

### 9.5 Soft Delete Project
Moves project to trash and clears active members list.
*   **Method**: `DELETE`
*   **Path**: `/projects/:id`
*   **Access Control**: Admin Only

---

### 9.6 Restore Project
Restores a soft-deleted project.
*   **Method**: `PATCH`
*   **Path**: `/projects/:id/restore`
*   **Access Control**: Admin Only

---

### 9.7 Assign Project Manager
Maps managing employee to project.
*   **Method**: `PATCH`
*   **Path**: `/projects/:id/manager`
*   **Access Control**: Admin Only
*   **Request Body**: `{ "managerId": "emp_uuid" }`

---

### 9.8 Assign Project Members (Bulk)
Allocates members with custom role assignments. Prevents duplicates.
*   **Method**: `PATCH`
*   **Path**: `/projects/:id/members`
*   **Access Control**: Admin Only
*   **Request Body**:
    ```json
    {
      "members": [
        { "employeeId": "emp_uuid_1", "role": "TEAM_LEAD" },
        { "employeeId": "emp_uuid_2", "role": "DEVELOPER" }
      ]
    }
    ```

---

### 9.9 Get Project Members
Lists workforce members assigned as project team.
*   **Method**: `GET`
*   **Path**: `/projects/:id/members`
*   **Access Control**: Authenticated

---

### 9.10 Get Project Statistics
Returns project-specific timeline stats.
*   **Method**: `GET`
*   **Path**: `/projects/:id/statistics`
*   **Access Control**: Authenticated

---

### 9.11 Get Global Projects Statistics
Aggregates overall directory metrics.
*   **Method**: `GET`
*   **Path**: `/projects/statistics`
*   **Access Control**: Authenticated (ADMIN, MANAGER)
*   **Response Payload**:
    ```json
    {
      "success": true,
      "data": {
        "totalProjects": 8,
        "activeProjects": 4,
        "completedProjects": 2,
        "onHoldProjects": 1,
        "cancelledProjects": 1,
        "overdueProjects": 1,
        "endingWithin7Days": 1,
        "averageProgress": 52,
        "averageDuration": 120,
        "totalMembers": 15,
        "departmentDistribution": { "Engineering": 4, "Marketing": 2 },
        "statusDistribution": { "PLANNING": 1, "ACTIVE": 4, "ON_HOLD": 1, "COMPLETED": 2 }
      }
    }
    ```

---

### 9.12 Bulk Operations (Soft Delete, Status, Restore)
Admin tool actions:
*   `DELETE /projects/bulk` -> body `{ ids: [UUID] }`
*   `PATCH /projects/bulk-status` -> body `{ ids: [UUID], status: "ACTIVE" }`
*   `PATCH /projects/bulk-restore` -> body `{ ids: [UUID] }`

---

### 9.13 Export Projects
Downloads CSV or XLSX files.
*   **Method**: `GET`
*   **Path**: `/projects/export`
*   **Access Control**: Authenticated (ADMIN, MANAGER)
*   **Query Parameters**:
    *   `format` (`csv` | `xlsx`)

---

## 📋 10. Task Endpoints

### 10.1 List Tasks (Paginated, Filtered & Searched)
Queries tasks directory under RBAC constraints.
*   **Method**: `GET`
*   **Path**: `/tasks`
*   **Access Control**: Authenticated (ADMIN: full, MANAGER: own dept/projects, EMPLOYEE: assigned, reported, or project-member tasks)
*   **Query Parameters**:
    *   `page` (default: `1`), `limit` (default: `10`), `search`
    *   `status` (`TODO | IN_PROGRESS | IN_REVIEW | BLOCKED | COMPLETED | CANCELLED`)
    *   `priority` (`LOW | MEDIUM | HIGH | URGENT`)
    *   `type` (`FEATURE | BUG | IMPROVEMENT | DOCUMENTATION | RESEARCH`)
    *   `projectId`, `assigneeId`, `reporterId`, `dueDate`
    *   `sortBy` (`dueDate | priority | status | createdAt | updatedAt`)
    *   `sortOrder` (`asc | desc`)
*   **Response Payload**:
    ```json
    {
      "success": true,
      "message": "Tasks retrieved successfully.",
      "tasks": [
        {
          "id": "task_uuid",
          "taskCode": "PRJ-001",
          "title": "Setup db indices",
          "status": "IN_PROGRESS",
          "priority": "HIGH",
          "completionPercentage": 40,
          "project": { "id": "proj_uuid", "name": "API Service" },
          "reporter": { "id": "emp_uuid", "firstName": "Alice", "lastName": "Smith" },
          "assignees": [
            { "employee": { "id": "emp_uuid_2", "firstName": "Bob", "avatar": null } }
          ],
          "labels": []
        }
      ],
      "pagination": { "page": 1, "limit": 10, "total": 1, "pages": 1 }
    }
    ```

---

### 10.2 Get Task By ID
Retrieves single task details including hierarchy nodes and blocker arrays.
*   **Method**: `GET`
*   **Path**: `/tasks/:id`
*   **Access Control**: Authenticated (RBAC protected)

---

### 10.3 Create Task
Registers a new project task track.
*   **Method**: `POST`
*   **Path**: `/tasks`
*   **Access Control**: Admin Only
*   **Request Body**:
    ```json
    {
      "title": "Integrate OAuth",
      "projectId": "proj_uuid",
      "parentTaskId": null,
      "status": "TODO",
      "priority": "HIGH",
      "type": "FEATURE",
      "estimatedHours": 8,
      "dueDate": "2026-09-01T00:00:00.000Z"
    }
    ```
*   **Response Payload**: Yields task details with auto-generated sequential `taskCode`.

---

### 10.4 Update Task Details
Edits task attributes. Enforces parent-hierarchy loop checks.
*   **Method**: `PATCH`
*   **Path**: `/tasks/:id`
*   **Access Control**: Admin (Full), Assigned/Reporter Employees (Write-level metadata only)

---

### 10.5 Soft Delete Task
Soft deletes a task and purges its assignees and dependency mappings.
*   **Method**: `DELETE`
*   **Path**: `/tasks/:id`
*   **Access Control**: Admin Only

---

### 10.6 Restore Task
Restores a soft-deleted task.
*   **Method**: `PATCH`
*   **Path**: `/tasks/:id/restore`
*   **Access Control**: Admin Only

---

### 10.7 Update Task Status
Transition task status. Enforces valid status workflows.
*   **Method**: `PATCH`
*   **Path**: `/tasks/:id/status`
*   **Request Body**: `{ "status": "IN_PROGRESS" }`

---

### 10.8 Update Task Progress
Directly update completion percentage (0 - 100).
*   **Method**: `PATCH`
*   **Path**: `/tasks/:id/progress`
*   **Request Body**: `{ "completionPercentage": 50 }`

---

### 10.9 Assign Task Assignees
Syncs task assignees. Rejects if task's project is CANCELLED.
*   **Method**: `PATCH`
*   **Path**: `/tasks/:id/assignees`
*   **Access Control**: Admin Only
*   **Request Body**: `{ "employeeIds": ["emp_uuid_1", "emp_uuid_2"] }`

---

### 10.10 Sync Blocker Dependencies
Assign blocker dependencies. Enforces BFS cycle loop checking.
*   **Method**: `PATCH`
*   **Path**: `/tasks/:id/dependencies`
*   **Request Body**: `{ "dependsOnTaskIds": ["blocker_uuid_1"] }`

---

### 10.11 Post Comment
Appends a conversation comment.
*   **Method**: `POST`
*   **Path**: `/tasks/:id/comments`
*   **Request Body**: `{ "comment": "Review requested." }`

---

### 10.12 Update Comment
*   **Method**: `PATCH`
*   **Path**: `/tasks/comments/:commentId`
*   **Access Control**: Comment Creator only

---

### 10.13 Soft Delete Comment
*   **Method**: `DELETE`
*   **Path**: `/tasks/comments/:commentId`
*   **Access Control**: Comment Creator or Admin

---

### 10.14 List Comments
*   **Method**: `GET`
*   **Path**: `/tasks/:id/comments`

---

### 10.15 Upload Attachment
*   **Method**: `POST`
*   **Path**: `/tasks/:id/attachments`
*   **Payload**: FormData with file field `attachment` (Max 10MB)

---

### 10.16 Delete Attachment
*   **Method**: `DELETE`
*   **Path**: `/tasks/attachments/:attachmentId`

---

### 10.17 Bulk Operations (Admin Only)
*   `DELETE /tasks/bulk` -> body `{ ids: [UUID] }`
*   `PATCH /tasks/bulk-status` -> body `{ ids: [UUID], status: "COMPLETED" }`
*   `PATCH /tasks/bulk-priority` -> body `{ ids: [UUID], priority: "URGENT" }`
*   `PATCH /tasks/bulk-restore` -> body `{ ids: [UUID] }`

---

### 10.18 Export Tasks
*   **Method**: `GET`
*   **Path**: `/tasks/export?format=csv`

---

## 📊 11. Analytics Endpoints

All endpoints are protected by `authenticateUser`. Query visibility is restricted strictly by user roles (ADMIN: all, MANAGER: department, EMPLOYEE: personal).

### 11.1 Get Overview Analytics
*   **Method**: `GET`
*   **Path**: `/analytics/overview`
*   **Response Payload**: Returns total counts, averages, and trend arrays for tasks, projects, employees, and departments.

### 11.2 Get Employee Analytics
*   **Method**: `GET`
*   **Path**: `/analytics/employees`

### 11.3 Get Department Analytics
*   **Method**: `GET`
*   **Path**: `/analytics/departments`

### 11.4 Get Project Analytics
*   **Method**: `GET`
*   **Path**: `/analytics/projects`

### 11.5 Get Task Analytics
*   **Method**: `GET`
*   **Path**: `/analytics/tasks`

### 11.6 Get Productivity Analytics
*   **Method**: `GET`
*   **Path**: `/analytics/productivity`

---

## 📥 12. Reports Endpoints

All endpoints support `format=csv`, `format=xlsx`, and `format=pdf` query parameters.

### 12.1 Get Employee Report
*   **Method**: `GET`
*   **Path**: `/reports/employees`

### 12.2 Get Department Report
*   **Method**: `GET`
*   **Path**: `/reports/departments`

### 12.3 Get Project Report
*   **Method**: `GET`
*   **Path**: `/reports/projects`

### 12.4 Get Task Report
*   **Method**: `GET`
*   **Path**: `/reports/tasks`

### 12.5 Get Productivity Report
*   **Method**: `GET`
*   **Path**: `/reports/productivity`

---

## 🌴 13. Leaves Endpoints

All endpoints are protected by `authenticateUser`.

### 13.1 List Leaves
*   **Method**: `GET`
*   **Path**: `/leaves`
*   **Access Control**: Authenticated (ADMIN: all, MANAGER: department, EMPLOYEE: personal)

### 13.2 Create Leave Request
*   **Method**: `POST`
*   **Path**: `/leaves`

### 13.3 Cancel Leave Request
*   **Method**: `PATCH`
*   **Path**: `/leaves/:id`

### 13.4 Delete Leave Request
*   **Method**: `DELETE`
*   **Path**: `/leaves/:id`
*   **Access Control**: Admin Only

### 13.5 Approve Leave
*   **Method**: `PATCH`
*   **Path**: `/leaves/:id/approve`
*   **Access Control**: Admin or Manager (if same department)

### 13.6 Reject Leave
*   **Method**: `PATCH`
*   **Path**: `/leaves/:id/reject`
*   **Access Control**: Admin or Manager (if same department)

---

## 📅 14. Calendar Endpoints

All endpoints are protected by `authenticateUser`.

### 14.1 Get Unified Calendar Feed
*   **Method**: `GET`
*   **Path**: `/calendar`
*   **Query Parameters**: `startDate`, `endDate`, `departmentId`, `employeeId`, `projectId`, `type`

### 14.2 Get Team Calendar Feed
*   **Method**: `GET`
*   **Path**: `/calendar/team`

### 14.3 Get Upcoming Events List
*   **Method**: `GET`
*   **Path**: `/calendar/upcoming`

### 14.4 Create Event
*   **Method**: `POST`
*   **Path**: `/calendar/events`

### 14.5 Update Event
*   **Method**: `PATCH`
*   **Path**: `/calendar/events/:id`
*   **Query Parameters**: `drag=true` for drag-drop date coordinates adjustments

### 14.6 Delete Event
*   **Method**: `DELETE`
*   **Path**: `/calendar/events/:id`

---

## ⏰ 15. Attendance Endpoints

All endpoints are protected by `authenticateUser`.

### 15.1 List Attendance Logs
*   **Method**: `GET`
*   **Path**: `/attendance`
*   **Query Parameters**: `startDate`, `endDate`, `employeeId`
*   **Access Control**: Scoped (ADMIN: all, MANAGER: department, EMPLOYEE: personal)

### 15.2 Clock-In
*   **Method**: `POST`
*   **Path**: `/attendance/check-in`

### 15.3 Clock-Out
*   **Method**: `POST`
*   **Path**: `/attendance/check-out`

### 15.4 Start Break
*   **Method**: `POST`
*   **Path**: `/attendance/break/start`

### 15.5 End Break
*   **Method**: `POST`
*   **Path**: `/attendance/break/end`

### 15.6 Submit Correction Request
*   **Method**: `POST`
*   **Path**: `/attendance/request`

### 15.7 Approve Correction Request
*   **Method**: `PATCH`
*   **Path**: `/attendance/request/:id/approve`
*   **Access Control**: Admin or Manager (if same department)

### 15.8 Reject Correction Request
*   **Method**: `PATCH`
*   **Path**: `/attendance/request/:id/reject`
*   **Access Control**: Admin or Manager (if same department)

---

## 📝 16. Timesheets Endpoints

All endpoints are protected by `authenticateUser`.

### 16.1 List Timesheets
*   **Method**: `GET`
*   **Path**: `/timesheets`

### 16.2 Get Timesheet By ID
*   **Method**: `GET`
*   **Path**: `/timesheets/:id`

### 16.3 Get Monthly Productivity Summary
*   **Method**: `GET`
*   **Path**: `/timesheets/monthly`
*   **Query Parameters**: `year`, `month`, `employeeId`

### 16.4 Export Timesheets CSV
*   **Method**: `GET`
*   **Path**: `/timesheets/export`

---

## 📂 17. Documents Endpoints

All endpoints are protected by `authenticateUser`.

### 17.1 List Documents
*   **Method**: `GET`
*   **Path**: `/documents`
*   **Query Parameters**: `search`, `category`, `entityType`, `entityId`, `page`, `limit`

### 17.2 Get Document Details
*   **Method**: `GET`
*   **Path**: `/documents/:id`

### 17.3 Upload Document
*   **Method**: `POST`
*   **Path**: `/documents`
*   **Headers**: `Content-Type: multipart/form-data`
*   **Body Form Data**: `file` (binary), `name`, `category`, `entityType`, `entityId`

### 17.4 Upload New Document Revision
*   **Method**: `POST`
*   **Path**: `/documents/:id/version`
*   **Headers**: `Content-Type: multipart/form-data`
*   **Body Form Data**: `file` (binary)

### 17.5 Download Document
*   **Method**: `GET`
*   **Path**: `/documents/:id/download`
*   **Query Parameters**: `version` (optional version number)

### 17.6 Preview Document Inline
*   **Method**: `GET`
*   **Path**: `/documents/:id/preview`
*   **Query Parameters**: `version` (optional version number)

### 17.7 Bulk Download ZIP
*   **Method**: `POST`
*   **Path**: `/documents/bulk-download`
*   **Body JSON**: `{ "documentIds": ["uuid-1", "uuid-2"] }`

### 17.8 Archive Document
*   **Method**: `PATCH`
*   **Path**: `/documents/:id/archive`

### 17.9 Restore Document
*   **Method**: `PATCH`
*   **Path**: `/documents/:id/restore`

### 17.10 Soft Delete Document
*   **Method**: `DELETE`
*   **Path**: `/documents/:id`

---

## 🔗 Architecture & Security References

*   To understand how authentication tokens generated here are secured on the client: [docs/security-auth.md](file:///c:/Resume%20Project/Task%20Management%20Portal/docs/security-auth.md)
*   To trace where these endpoints connect inside the codebase: [docs/architecture-guide.md](file:///c:/Resume%20Project/Task%20Management%20Portal/docs/architecture-guide.md)
