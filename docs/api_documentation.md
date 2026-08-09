# Task Management Portal - REST API Reference Manual (v1)

This documentation provides overview specifications for versioned REST API endpoints.

## Correlation & Tracing Headers
Every API response embeds trace metrics for request auditing:
- `X-Request-ID`: Generated for each transaction (correlation tracing).
- `X-Correlation-ID`: Tracks user sessions.

---

## Authentication Endpoints

### 1. User Registration
`POST /api/v1/auth/register`
- **Request Headers**:
  - `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "SecurePassword123"
  }
  ```
- **Response Example**:
  ```json
  {
    "success": true,
    "message": "User account registered successfully.",
    "requestId": "req_a1b2c3d4",
    "correlationId": "corr_f8e7d6c5",
    "data": {
      "user": {
        "id": "u-991283",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "role": "EMPLOYEE"
      }
    }
  }
  ```

### 2. User Authentication (Login)
`POST /api/v1/auth/login`
- **Rate Limit**: 10 requests / minute
- **Request Body**:
  ```json
  {
    "email": "jane@example.com",
    "password": "SecurePassword123"
  }
  ```
- **Response Example**:
  ```json
  {
    "success": true,
    "message": "Authentication successful.",
    "requestId": "req_738dd2",
    "correlationId": "corr_001a2b3c",
    "data": {
      "user": {
        "id": "u-991283",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "role": "EMPLOYEE"
      },
      "accessToken": "eyJhbGciOiJIUzI1NiIsIn..."
    }
  }
  ```

---

## Employee Management Endpoints

### 1. Create Employee (Admin/HR Only)
`POST /api/v1/employees`
- **Request Body**:
  ```json
  {
    "firstName": "John",
    "lastName": "Smith",
    "email": "john.smith@company.com",
    "phone": "5550199",
    "designation": "Software Engineer",
    "departmentId": "d-993a-22f",
    "hireDate": "2026-08-09T00:00:00Z"
  }
  ```
- **Response**: `200 OK` with employee record.

---

## Error Handling Standards
Errors are formatted using a standard structure:
```json
{
  "success": false,
  "message": "Validation verification checks failed.",
  "requestId": "req_88a99b",
  "correlationId": "corr_c1d2e3",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address format."
    }
  ]
}
```
- **400 Bad Request**: Validation failure or constraint conflict.
- **401 Unauthorized**: Missing or expired session tokens.
- **403 Forbidden**: Inadequate RBAC permissions.
- **429 Too Many Requests**: Rate limit limit exceeded.
