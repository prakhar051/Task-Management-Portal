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

## 🔗 Architecture & Security References

*   To understand how authentication tokens generated here are secured on the client: [docs/security-auth.md](file:///c:/Resume%20Project/Task%20Management%20Portal/docs/security-auth.md)
*   To trace where these endpoints connect inside the codebase: [docs/architecture-guide.md](file:///c:/Resume%20Project/Task%20Management%20Portal/docs/architecture-guide.md)
