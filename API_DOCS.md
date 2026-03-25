# Meikural Backend API Documentation

## Base URL
```
http://localhost:3001
```

## Authentication
Most endpoints require JWT authentication via `Authorization` header:
```
Authorization: Bearer {accessToken}
```

### Token Expiration
- **Access Token**: 15 minutes
- **Refresh Token**: 7 days

---

## 📋 Table of Contents
1. [Authentication](#authentication-endpoints)
2. [Colleges](#college-endpoints)
3. [Batches](#batch-endpoints)
4. [Batch Members](#batch-members-endpoints)
5. [Users](#user-endpoints)
6. [User Filters](#user-filter-endpoints)
7. [Questions](#questions-endpoints)
8. [Test Cases](#test-cases-endpoints)
9. [Tests/Assignments](#testsassignments-endpoints)
10. [Code Execution](#code-execution-endpoints)

---

## Authentication Endpoints

### 1. User Login
**POST** `/api/auth/login`

Login with email and password to get access and refresh tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "name": "User Name",
    "email": "user@example.com",
    "role": "students|trainer|college-admin|superadmin",
    "college_id": "uuid|null"
  },
  "accessToken": "jwt_token",
  "refreshToken": "jwt_token"
}
```

**Roles:**
- `superadmin` - System administrator
- `trainer` - Course instructor
- `students` - Student
- `college-admin` - College administrator

---

### 2. User Registration
**POST** `/api/auth/register`

Register a new user. Only superadmin can access this endpoint.

**Required Headers:**
```
Authorization: Bearer {superadminToken}
```

**Request Body:**
```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "password123",
  "role": "students|trainer|college-admin",
  "college_id": "uuid (required for students and college-admin)"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "name": "User Name",
    "email": "user@example.com",
    "role": "students|trainer|college-admin",
    "college_id": "uuid|null"
  },
  "accessToken": "jwt_token",
  "refreshToken": "jwt_token"
}
```

**Rules:**
- `students` role requires `college_id`
- `college-admin` role requires `college_id`
- `trainer` role does NOT require `college_id`
- Cannot register as `superadmin`
- Email must be unique

**Error Responses:**
- `400` - Email already exists / All fields required / College not found / Missing college_id
- `403` - Cannot register as superadmin
- `401` - Access token required
- `403` - Only superadmin can access this

---

### 3. Refresh Access Token
**POST** `/api/auth/refresh`

Get a new access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**Response (200):**
```json
{
  "accessToken": "new_jwt_access_token"
}
```

**Error Responses:**
- `400` - Refresh token required
- `401` - Invalid or expired refresh token

---

## College Endpoints

### 1. Create College
**POST** `/api/colleges`

Create a new college. Only superadmin can access.

**Required Headers:**
```
Authorization: Bearer {superadminToken}
```

**Request Body:**
```json
{
  "name": "MIT",
  "description": "Massachusetts Institute of Technology",
  "is_active": true
}
```

**Response (201):**
```json
{
  "message": "College created successfully",
  "college": {
    "id": "uuid",
    "name": "MIT",
    "description": "Massachusetts Institute of Technology",
    "is_active": true,
    "created_at": "2026-03-23T08:22:50.773Z"
  }
}
```

**Error Responses:**
- `400` - College name already exists / College name required
- `401` - Access token required
- `403` - Only superadmin can access this

---

### 2. Get All Colleges
**GET** `/api/colleges`

Retrieve all colleges. Only superadmin can access.

**Required Headers:**
```
Authorization: Bearer {superadminToken}
```

**Response (200):**
```json
{
  "colleges": [
    {
      "id": "uuid",
      "name": "MIT",
      "description": "Massachusetts Institute of Technology",
      "is_active": true,
      "created_at": "2026-03-23T08:22:50.773Z",
      "updated_at": "2026-03-23T08:22:50.773Z"
    }
  ],
  "count": 1
}
```

---

### 3. Get College by ID
**GET** `/api/colleges/{id}`

Retrieve a specific college. Only superadmin can access.

**Required Headers:**
```
Authorization: Bearer {superadminToken}
```

**Response (200):**
```json
{
  "college": {
    "id": "uuid",
    "name": "MIT",
    "description": "Massachusetts Institute of Technology",
    "is_active": true,
    "created_at": "2026-03-23T08:22:50.773Z",
    "updated_at": "2026-03-23T08:22:50.773Z"
  }
}
```

**Error Responses:**
- `404` - College not found
- `401` - Access token required
- `403` - Only superadmin can access this

---

### 4. Update College
**PUT** `/api/colleges/{id}`

Update college details. Only superadmin can access.

**Required Headers:**
```
Authorization: Bearer {superadminToken}
```

**Request Body:**
```json
{
  "name": "MIT (Updated)",
  "description": "Updated description",
  "is_active": false
}
```

**Response (200):**
```json
{
  "message": "College updated successfully",
  "college": {
    "id": "uuid",
    "name": "MIT (Updated)",
    "description": "Updated description",
    "is_active": false,
    "created_at": "2026-03-23T08:22:50.773Z",
    "updated_at": "2026-03-23T08:23:10.123Z"
  }
}
```

**Error Responses:**
- `404` - College not found
- `400` - College name already exists
- `401` - Access token required
- `403` - Only superadmin can access this

---

### 5. Delete College
**DELETE** `/api/colleges/{id}`

Delete a college. Only superadmin can access.

**Required Headers:**
```
Authorization: Bearer {superadminToken}
```

**Response (200):**
```json
{
  "message": "College deleted successfully"
}
```

**Error Responses:**
- `404` - College not found
- `401` - Access token required
- `403` - Only superadmin can access this

---

## Batch Endpoints

### 0. Assign Test to Batch
**POST** `/api/batches/{batch_id}/tests/assign`

Assign a test to a batch. Only superadmin can access.

**Required Headers:**
```
Authorization: Bearer {superadminToken}
```

**Request Body:**
```json
{
  "batch_id": "uuid",
  "test_id": "uuid"
}
```

**Response (201):**
```json
{
  "message": "Test assigned to batch successfully",
  "batchTest": {
    "id": "uuid",
    "batch_id": "uuid",
    "test_id": "uuid",
    "created_at": "2026-03-23T21:27:29.682Z"
  }
}
```

**Rules:**
- Batch must exist
- Test must exist
- Same test cannot be assigned twice to same batch

**Error Responses:**
- `400` - batch_id and test_id required / Batch not found / Test not found / Test already assigned to this batch
- `401` - Access token required
- `403` - Only superadmin can access this

---

### 0.1 Get Tests for Batch
**GET** `/api/batches/{batch_id}/tests`

Retrieve all tests assigned to a batch. Only superadmin can access.

**Required Headers:**
```
Authorization: Bearer {superadminToken}
```

**Response (200):**
```json
{
  "tests": [
    {
      "id": "uuid",
      "batch_id": "uuid",
      "test_id": "uuid",
      "title": "Test 1",
      "description": "First test",
      "is_active": true,
      "created_at": "2026-03-23T21:27:29.664Z",
      "updated_at": "2026-03-23T21:27:29.664Z",
      "assigned_at": "2026-03-23T21:27:29.682Z",
      "questionCount": 5
    }
  ],
  "count": 1,
  "batch_id": "uuid"
}
```

**Notes:**
- Returns tests assigned to this batch
- Includes question count for each test
- `assigned_at` shows when test was assigned to batch

**Error Responses:**
- `404` - Batch not found
- `401` - Access token required
- `403` - Only superadmin can access this

---

### 0.2 Remove Test from Batch
**POST** `/api/batches/{batch_id}/tests/remove`

Remove a test from a batch. Only superadmin can access.

**Required Headers:**
```
Authorization: Bearer {superadminToken}
```

**Request Body:**
```json
{
  "batch_id": "uuid",
  "test_id": "uuid"
}
```

**Response (200):**
```json
{
  "message": "Test removed from batch successfully"
}
```

**Error Responses:**
- `400` - batch_id and test_id required
- `404` - Test not assigned to this batch
- `401` - Access token required
- `403` - Only superadmin can access this

---

### 1. Create Batch
**POST** `/api/batches`

Create a new batch. Only superadmin can access. Batch requires a college.

**Required Headers:**
```
Authorization: Bearer {superadminToken}
```

**Request Body:**
```json
{
  "name": "Batch A-2024",
  "description": "Spring 2024 Batch",
  "college_id": "uuid",
  "is_active": true
}
```

**Response (201):**
```json
{
  "message": "Batch created successfully",
  "batch": {
    "id": "uuid",
    "name": "Batch A-2024",
    "description": "Spring 2024 Batch",
    "college_id": "uuid",
    "is_active": true,
    "created_at": "2026-03-23T08:22:50.773Z"
  }
}
```

**Rules:**
- `college_id` is required
- College must exist
- **Batch name must be unique within the college** (cannot have duplicate names in same college)
- Same batch name can exist in different colleges

**Error Responses:**
- `400` - Batch name and college_id required / College not found / Batch name already exists in this college
- `401` - Access token required
- `403` - Only superadmin can access this

---

### 2. Get All Batches
**GET** `/api/batches`

Retrieve all batches. Only superadmin can access.

**Required Headers:**
```
Authorization: Bearer {superadminToken}
```

**Query Parameters:**
- `college_id` (optional) - Filter batches by college UUID

**Response (200):**
```json
{
  "batches": [
    {
      "id": "uuid",
      "name": "Batch A-2024",
      "description": "Spring 2024 Batch",
      "college_id": "uuid",
      "is_active": true,
      "created_at": "2026-03-23T08:22:50.773Z",
      "updated_at": "2026-03-23T08:22:50.773Z"
    }
  ],
  "count": 1,
  "filters": {
    "college_id": "uuid|null"
  }
}
```

---

### 3. Get Batches by College
**GET** `/api/batches/college/{college_id}`

Retrieve all batches for a specific college. Only superadmin can access.

**Required Headers:**
```
Authorization: Bearer {superadminToken}
```

**Response (200):**
```json
{
  "batches": [
    {
      "id": "uuid",
      "name": "Batch A-2024",
      "description": "Spring 2024 Batch",
      "college_id": "uuid",
      "is_active": true,
      "created_at": "2026-03-23T08:22:50.773Z",
      "updated_at": "2026-03-23T08:22:50.773Z"
    }
  ],
  "count": 1,
  "college_id": "uuid"
}
```

**Error Responses:**
- `404` - College not found
- `401` - Access token required
- `403` - Only superadmin can access this

---

### 4. Get Batch by ID
**GET** `/api/batches/{id}`

Retrieve a specific batch. Only superadmin can access.

**Required Headers:**
```
Authorization: Bearer {superadminToken}
```

**Response (200):**
```json
{
  "batch": {
    "id": "uuid",
    "name": "Batch A-2024",
    "description": "Spring 2024 Batch",
    "college_id": "uuid",
    "is_active": true,
    "created_at": "2026-03-23T08:22:50.773Z",
    "updated_at": "2026-03-23T08:22:50.773Z"
  }
}
```

**Error Responses:**
- `404` - Batch not found
- `401` - Access token required
- `403` - Only superadmin can access this

---

### 5. Update Batch
**PUT** `/api/batches/{id}`

Update batch details. Only superadmin can access.

**Required Headers:**
```
Authorization: Bearer {superadminToken}
```

**Request Body:**
```json
{
  "name": "Batch A-2024 (Updated)",
  "description": "Updated description",
  "college_id": "uuid",
  "is_active": false
}
```

**Response (200):**
```json
{
  "message": "Batch updated successfully",
  "batch": {
    "id": "uuid",
    "name": "Batch A-2024 (Updated)",
    "description": "Updated description",
    "college_id": "uuid",
    "is_active": false,
    "created_at": "2026-03-23T08:22:50.773Z",
    "updated_at": "2026-03-23T08:23:10.123Z"
  }
}
```

**Error Responses:**
- `404` - Batch not found
- `400` - College not found / Batch name already exists in this college
- `401` - Access token required
- `403` - Only superadmin can access this

---

### 6. Delete Batch
**DELETE** `/api/batches/{id}`

Delete a batch. Only superadmin can access.

**Required Headers:**
```
Authorization: Bearer {superadminToken}
```

**Response (200):**
```json
{
  "message": "Batch deleted successfully"
}
```

**Error Responses:**
- `404` - Batch not found
- `401` - Access token required
- `403` - Only superadmin can access this

---

## Batch Members Endpoints

### 1. Add Student to Batch
**POST** `/api/batch-members/students`

Add a student to a batch. Only superadmin can access.

**Required Headers:**
```
Authorization: Bearer {superadminToken}
```

**Request Body:**
```json
{
  "batch_id": "uuid",
  "student_id": "uuid"
}
```

**Response (201):**
```json
{
  "message": "Student added to batch successfully",
  "batchStudent": {
    "id": "uuid",
    "batch_id": "uuid",
    "student_id": "uuid",
    "created_at": "2026-03-23T08:22:50.773Z"
  }
}
```

**Rules:**
- Student must exist and have `students` role
- Batch must exist
- Cannot add same student twice (unique constraint)

**Error Responses:**
- `400` - batch_id and student_id required / Batch not found / Student not found / Student already in batch
- `401` - Access token required
- `403` - Only superadmin can access this

---

### 2. Get Students in Batch
**GET** `/api/batch-members/{batch_id}/students`

Retrieve all students in a batch. Only superadmin can access.

**Required Headers:**
```
Authorization: Bearer {superadminToken}
```

**Response (200):**
```json
{
  "students": [
    {
      "id": "uuid",
      "name": "Student Name",
      "email": "student@example.com",
      "role": "students",
      "college_id": "uuid",
      "created_at": "2026-03-23T08:22:50.773Z"
    }
  ],
  "count": 1,
  "batch_id": "uuid"
}
```

**Error Responses:**
- `404` - Batch not found
- `401` - Access token required
- `403` - Only superadmin can access this

---

### 3. Remove Student from Batch
**DELETE** `/api/batch-members/{batch_id}/students/{student_id}`

Remove a student from a batch. Only superadmin can access.

**Required Headers:**
```
Authorization: Bearer {superadminToken}
```

**Response (200):**
```json
{
  "message": "Student removed from batch successfully"
}
```

**Error Responses:**
- `404` - Student not in batch
- `401` - Access token required
- `403` - Only superadmin can access this

---

### 4. Add Trainer to Batch
**POST** `/api/batch-members/trainers`

Add a trainer to a batch. Only superadmin can access.

**Required Headers:**
```
Authorization: Bearer {superadminToken}
```

**Request Body:**
```json
{
  "batch_id": "uuid",
  "trainer_id": "uuid"
}
```

**Response (201):**
```json
{
  "message": "Trainer added to batch successfully",
  "batchTrainer": {
    "id": "uuid",
    "batch_id": "uuid",
    "trainer_id": "uuid",
    "created_at": "2026-03-23T08:22:50.773Z"
  }
}
```

**Rules:**
- Trainer must exist and have `trainer` role
- Batch must exist
- Cannot add same trainer twice (unique constraint)

**Error Responses:**
- `400` - batch_id and trainer_id required / Batch not found / Trainer not found / Trainer already in batch
- `401` - Access token required
- `403` - Only superadmin can access this

---

### 5. Get Trainers in Batch
**GET** `/api/batch-members/{batch_id}/trainers`

Retrieve all trainers in a batch. Only superadmin can access.

**Required Headers:**
```
Authorization: Bearer {superadminToken}
```

**Response (200):**
```json
{
  "trainers": [
    {
      "id": "uuid",
      "name": "Trainer Name",
      "email": "trainer@example.com",
      "role": "trainer",
      "college_id": null,
      "created_at": "2026-03-23T08:22:50.773Z"
    }
  ],
  "count": 1,
  "batch_id": "uuid"
}
```

**Error Responses:**
- `404` - Batch not found
- `401` - Access token required
- `403` - Only superadmin can access this

---

### 6. Remove Trainer from Batch
**DELETE** `/api/batch-members/{batch_id}/trainers/{trainer_id}`

Remove a trainer from a batch. Only superadmin can access.

**Required Headers:**
```
Authorization: Bearer {superadminToken}
```

**Response (200):**
```json
{
  "message": "Trainer removed from batch successfully"
}
```

**Error Responses:**
- `404` - Trainer not in batch
- `401` - Access token required
- `403` - Only superadmin can access this

---

## User Endpoints

### 1. Get All Users
**GET** `/api/users`

Retrieve all users with optional filters. Only superadmin can access.

**Required Headers:**
```
Authorization: Bearer {superadminToken}
```

**Query Parameters:**
- `role` (optional) - Filter by role: `superadmin|trainer|students|college-admin`
- `college_id` (optional) - Filter by college UUID

**Example:**
```
GET /api/users?role=trainer
GET /api/users?college_id=uuid
GET /api/users?role=students&college_id=uuid
```

**Response (200):**
```json
{
  "users": [
    {
      "id": "uuid",
      "name": "User Name",
      "email": "user@example.com",
      "role": "students",
      "college_id": "uuid|null",
      "created_at": "2026-03-23T08:20:33.934Z",
      "updated_at": "2026-03-23T08:20:33.934Z"
    }
  ],
  "count": 1,
  "filters": {
    "role": "trainer|null",
    "college_id": "uuid|null"
  }
}
```

---

### 2. Get User by ID
**GET** `/api/users/{id}`

Retrieve a specific user. Only superadmin can access.

**Required Headers:**
```
Authorization: Bearer {superadminToken}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "name": "User Name",
    "email": "user@example.com",
    "role": "students",
    "college_id": "uuid|null",
    "created_at": "2026-03-23T08:20:33.934Z",
    "updated_at": "2026-03-23T08:20:33.934Z"
  }
}
```

**Error Responses:**
- `404` - User not found
- `401` - Access token required
- `403` - Only superadmin can access this

---

### 3. Update User
**PUT** `/api/users/{id}`

Update user details. Only superadmin can access.

**Required Headers:**
```
Authorization: Bearer {superadminToken}
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "newemail@example.com",
  "password": "newpassword123",
  "role": "trainer"
}
```

**Response (200):**
```json
{
  "message": "User updated successfully",
  "user": {
    "id": "uuid",
    "name": "Updated Name",
    "email": "newemail@example.com",
    "role": "trainer",
    "created_at": "2026-03-23T08:20:33.934Z",
    "updated_at": "2026-03-23T08:24:30.410Z"
  }
}
```

**Error Responses:**
- `404` - User not found
- `400` - Email already exists
- `401` - Access token required
- `403` - Only superadmin can access this

---

### 4. Delete User
**DELETE** `/api/users/{id}`

Delete a user. Only superadmin can access. Superadmin cannot be deleted.

**Required Headers:**
```
Authorization: Bearer {superadminToken}
```

**Response (200):**
```json
{
  "message": "User deleted successfully"
}
```

**Error Responses:**
- `404` - User not found
- `403` - Cannot delete superadmin / Only superadmin can access this
- `401` - Access token required

---

## User Filter Endpoints

### 1. Get All Students
**GET** `/api/users/filter/students`

Retrieve all students. Only superadmin can access.

**Required Headers:**
```
Authorization: Bearer {superadminToken}
```

**Query Parameters:**
- `college_id` (optional) - Filter students by college

**Response (200):**
```json
{
  "students": [
    {
      "id": "uuid",
      "name": "Student Name",
      "email": "student@example.com",
      "role": "students",
      "college_id": "uuid",
      "created_at": "2026-03-23T08:20:33.934Z",
      "updated_at": "2026-03-23T08:20:33.934Z"
    }
  ],
  "count": 1,
  "filters": {
    "college_id": "uuid|null"
  }
}
```

---

### 2. Get All Trainers
**GET** `/api/users/filter/trainers`

Retrieve all trainers. Only superadmin can access.

**Required Headers:**
```
Authorization: Bearer {superadminToken}
```

**Response (200):**
```json
{
  "trainers": [
    {
      "id": "uuid",
      "name": "Trainer Name",
      "email": "trainer@example.com",
      "role": "trainer",
      "college_id": null,
      "created_at": "2026-03-23T08:20:33.934Z",
      "updated_at": "2026-03-23T08:20:33.934Z"
    }
  ],
  "count": 1
}
```

---

### 3. Get All College Admins
**GET** `/api/users/filter/college-admins`

Retrieve all college admins. Only superadmin can access.

**Required Headers:**
```
Authorization: Bearer {superadminToken}
```

**Query Parameters:**
- `college_id` (optional) - Filter college admins by college

**Response (200):**
```json
{
  "collegeAdmins": [
    {
      "id": "uuid",
      "name": "College Admin Name",
      "email": "admin@college.com",
      "role": "college-admin",
      "college_id": "uuid",
      "created_at": "2026-03-23T08:20:33.934Z",
      "updated_at": "2026-03-23T08:20:33.934Z"
    }
  ],
  "count": 1,
  "filters": {
    "college_id": "uuid|null"
  }
}
```

---

## Questions Endpoints

### 1. Create Question
**POST** `/api/questions`

Create a new programming question. Only superadmin can access.

**Required Headers:**
```
Authorization: Bearer {superadminToken}
```

**Request Body:**
```json
{
  "title": "Fibonacci Sequence",
  "description": "Write a function that returns the nth Fibonacci number",
  "solution_code": "def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)",
  "lang": "python",
  "is_active": true
}
```

**Response (201):**
```json
{
  "message": "Question created successfully",
  "question": {
    "id": "uuid",
    "title": "Fibonacci Sequence",
    "description": "Write a function that returns the nth Fibonacci number",
    "lang": "python",
    "is_active": true,
    "created_at": "2026-03-24T10:30:45.123Z"
  }
}
```

**Supported Languages:**
- `python`
- `java`
- `c`
- `cpp`

**Error Responses:**
- `400` - All fields required / Unsupported language
- `401` - Access token required
- `403` - Only superadmin can access this

---

### 2. Get All Questions
**GET** `/api/questions`

Retrieve all questions with optional language filter and associated test cases. Only superadmin can access.

**Required Headers:**
```
Authorization: Bearer {superadminToken}
```

**Query Parameters:**
- `lang` (optional) - Filter by language: `python|java|c|cpp`

**Example:**
```
GET /api/questions
GET /api/questions?lang=python
GET /api/questions?lang=java
```

**Response (200):**
```json
{
  "questions": [
    {
      "id": "uuid",
      "title": "Fibonacci Sequence",
      "description": "Write a function that returns the nth Fibonacci number",
      "lang": "python",
      "is_active": true,
      "created_at": "2026-03-24T10:30:45.123Z",
      "updated_at": "2026-03-24T10:30:45.123Z",
      "testCases": [
        {
          "id": "uuid",
          "question_id": "uuid",
          "input": "5",
          "expected_output": "5",
          "created_at": "2026-03-24T10:35:40.789Z"
        }
      ],
      "testCaseCount": 1
    }
  ],
  "count": 1,
  "filters": {
    "lang": "python|null"
  }
}
```

**Notes:**
- Each question includes its associated test cases
- `testCaseCount` shows the number of test cases
- If question has no test cases, `testCases` array is empty

---

### 3. Get Questions by Language
**GET** `/api/questions/lang/{lang}`

Retrieve all questions for a specific programming language with associated test cases. Only superadmin can access.

**Required Headers:**
```
Authorization: Bearer {superadminToken}
```

**Response (200):**
```json
{
  "questions": [
    {
      "id": "uuid",
      "title": "Fibonacci Sequence",
      "description": "Write a function that returns the nth Fibonacci number",
      "lang": "python",
      "is_active": true,
      "created_at": "2026-03-24T10:30:45.123Z",
      "updated_at": "2026-03-24T10:30:45.123Z",
      "testCases": [
        {
          "id": "uuid",
          "question_id": "uuid",
          "input": "5",
          "expected_output": "5",
          "created_at": "2026-03-24T10:35:40.789Z"
        }
      ],
      "testCaseCount": 1
    }
  ],
  "count": 1,
  "lang": "python"
}
```

**Notes:**
- Returns questions in the specified language
- Each question includes its associated test cases
- `testCaseCount` shows the number of test cases for each question

**Error Responses:**
- `400` - Unsupported language
- `401` - Access token required
- `403` - Only superadmin can access this

---

### 4. Get Question by ID
**GET** `/api/questions/{id}`

Retrieve a specific question with solution code and associated test cases. Only superadmin can access.

**Required Headers:**
```
Authorization: Bearer {superadminToken}
```

**Response (200):**
```json
{
  "question": {
    "id": "uuid",
    "title": "Fibonacci Sequence",
    "description": "Write a function that returns the nth Fibonacci number",
    "solution_code": "def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)",
    "lang": "python",
    "is_active": true,
    "created_at": "2026-03-24T10:30:45.123Z",
    "updated_at": "2026-03-24T10:30:45.123Z",
    "testCases": [
      {
        "id": "uuid",
        "question_id": "uuid",
        "input": "5",
        "expected_output": "5",
        "created_at": "2026-03-24T10:35:40.789Z"
      },
      {
        "id": "uuid",
        "question_id": "uuid",
        "input": "10",
        "expected_output": "55",
        "created_at": "2026-03-24T10:36:10.456Z"
      }
    ],
    "testCaseCount": 2
  }
}
```

**Notes:**
- Returns full question with solution code
- Includes all associated test cases
- `testCaseCount` shows total number of test cases

**Error Responses:**
- `404` - Question not found
- `401` - Access token required
- `403` - Only superadmin can access this

---

### 5. Update Question
**PUT** `/api/questions/{id}`

Update question details. Only superadmin can access.

**Required Headers:**
```
Authorization: Bearer {superadminToken}
```

**Request Body:**
```json
{
  "title": "Fibonacci Sequence (Updated)",
  "description": "Write an optimized function that returns the nth Fibonacci number",
  "solution_code": "def fibonacci(n, memo={}):\n    if n in memo:\n        return memo[n]\n    if n <= 1:\n        return n\n    memo[n] = fibonacci(n-1, memo) + fibonacci(n-2, memo)\n    return memo[n]",
  "lang": "python",
  "is_active": true
}
```

**Response (200):**
```json
{
  "message": "Question updated successfully",
  "question": {
    "id": "uuid",
    "title": "Fibonacci Sequence (Updated)",
    "description": "Write an optimized function that returns the nth Fibonacci number",
    "lang": "python",
    "is_active": true,
    "created_at": "2026-03-24T10:30:45.123Z",
    "updated_at": "2026-03-24T10:35:20.456Z"
  }
}
```

**Error Responses:**
- `404` - Question not found
- `400` - Unsupported language
- `401` - Access token required
- `403` - Only superadmin can access this

---

### 6. Delete Question
**DELETE** `/api/questions/{id}`

Delete a question. Only superadmin can access. Deleting a question will cascade delete all associated test cases.

**Required Headers:**
```
Authorization: Bearer {superadminToken}
```

**Response (200):**
```json
{
  "message": "Question deleted successfully"
}
```

**Error Responses:**
- `404` - Question not found
- `401` - Access token required
- `403` - Only superadmin can access this

---

## Test Cases Endpoints

### 1. Add Test Case
**POST** `/api/questions/{question_id}/testcases`

Add a test case to a question. Only superadmin can access. **Test cases are validated against the question's solution code before being saved.**

**Required Headers:**
```
Authorization: Bearer {superadminToken}
```

**Request Body:**
```json
{
  "question_id": "uuid",
  "input": "5\n3",
  "expected_output": "8"
}
```

**Validation Process:**
1. Fetches question's solution code and language
2. Executes solution code with the provided input
3. Compares actual output with expected_output
4. **Saves only if outputs match exactly** (whitespace normalized)

**Response (201) - Validation PASSED:**
```json
{
  "message": "Test case added successfully",
  "testCase": {
    "id": "uuid",
    "question_id": "uuid",
    "input": "5\n3",
    "expected_output": "8",
    "created_at": "2026-03-24T10:35:40.789Z"
  },
  "validation": {
    "status": "passed",
    "executionTime": 0.082
  }
}
```

**Response (400) - Validation FAILED - Output Mismatch:**
```json
{
  "error": "Test case validation failed",
  "details": "Output mismatch",
  "expected": "30",
  "actual": "24",
  "statusCode": 400
}
```

**Response (400) - Validation FAILED - Code Execution Error:**
```json
{
  "error": "Test case validation failed",
  "details": "Solution code execution error: SyntaxError: ...",
  "statusCode": 400
}
```

**Rules:**
- Question must exist
- Input and expected_output are required
- **Test case must produce correct output to be saved**
- Output is trimmed (whitespace normalized) before comparison
- Multiple test cases can be added per question

**Error Responses:**
- `400` - Validation failed (output mismatch or code execution error)
- `400` - question_id, input, and expected_output required / Question not found
- `401` - Access token required
- `403` - Only superadmin can access this
- `500` - Unable to validate test case / Database error

---

### 2. Get Test Cases by Question
**GET** `/api/questions/{question_id}/testcases`

Retrieve all test cases for a specific question. Only superadmin can access.

**Required Headers:**
```
Authorization: Bearer {superadminToken}
```

**Response (200):**
```json
{
  "testCases": [
    {
      "id": "uuid",
      "question_id": "uuid",
      "input": "5",
      "expected_output": "5",
      "created_at": "2026-03-24T10:35:40.789Z"
    },
    {
      "id": "uuid",
      "question_id": "uuid",
      "input": "10",
      "expected_output": "55",
      "created_at": "2026-03-24T10:36:10.456Z"
    }
  ],
  "count": 2,
  "question_id": "uuid"
}
```

**Error Responses:**
- `404` - Question not found
- `401` - Access token required
- `403` - Only superadmin can access this

---

### 3. Get Test Case by ID
**GET** `/api/questions/testcases/{id}`

Retrieve a specific test case. Only superadmin can access.

**Required Headers:**
```
Authorization: Bearer {superadminToken}
```

**Response (200):**
```json
{
  "testCase": {
    "id": "uuid",
    "question_id": "uuid",
    "input": "5",
    "expected_output": "5",
    "created_at": "2026-03-24T10:35:40.789Z"
  }
}
```

**Error Responses:**
- `404` - Test case not found
- `401` - Access token required
- `403` - Only superadmin can access this

---

### 4. Update Test Case
**PUT** `/api/questions/testcases/{id}`

Update test case input or expected output. Only superadmin can access.

**Required Headers:**
```
Authorization: Bearer {superadminToken}
```

**Request Body:**
```json
{
  "input": "5",
  "expected_output": "5"
}
```

**Response (200):**
```json
{
  "message": "Test case updated successfully",
  "testCase": {
    "id": "uuid",
    "question_id": "uuid",
    "input": "5",
    "expected_output": "5",
    "created_at": "2026-03-24T10:35:40.789Z"
  }
}
```

**Error Responses:**
- `404` - Test case not found
- `401` - Access token required
- `403` - Only superadmin can access this

---

### 5. Delete Test Case
**DELETE** `/api/questions/testcases/{id}`

Delete a test case. Only superadmin can access.

**Required Headers:**
```
Authorization: Bearer {superadminToken}
```

**Response (200):**
```json
{
  "message": "Test case deleted successfully"
}
```

**Error Responses:**
- `404` - Test case not found
- `401` - Access token required
- `403` - Only superadmin can access this

---

## Tests/Assignments Endpoints

### 1. Create Test
**POST** `/api/tests`

Create a new test/assignment with title and description. Only superadmin can access.

**Required Headers:**
```
Authorization: Bearer {superadminToken}
```

**Request Body:**
```json
{
  "title": "Python Basics Test",
  "description": "Test basic Python operations",
  "duration_minutes": 90,
  "is_active": true
}
```

**Response (201):**
```json
{
  "message": "Test created successfully",
  "test": {
    "id": "uuid",
    "title": "Python Basics Test",
    "description": "Test basic Python operations",
    "duration_minutes": 90,
    "is_active": true,
    "created_at": "2026-03-23T21:03:23.271Z",
    "updated_at": "2026-03-23T21:03:23.271Z"
  }
}
```

**Rules:**
- Title is required
- Title must be unique
- Description is optional
- duration_minutes is optional (defaults to 60 minutes if not specified)

**Error Responses:**
- `400` - Title is required / Title already exists
- `401` - Access token required
- `403` - Only superadmin can access this

---

### 2. Get All Tests
**GET** `/api/tests`

Retrieve all tests with question count. Only superadmin can access.

**Required Headers:**
```
Authorization: Bearer {superadminToken}
```

**Response (200):**
```json
{
  "tests": [
    {
      "id": "uuid",
      "title": "Python Basics Test",
      "description": "Test basic Python operations",
      "duration_minutes": 90,
      "is_active": true,
      "created_at": "2026-03-23T21:03:23.271Z",
      "updated_at": "2026-03-23T21:03:23.271Z",
      "questionCount": 3
    }
  ],
  "count": 1
}
```

---

### 3. Get Test by ID
**GET** `/api/tests/{id}`

Retrieve a specific test with all questions in order and their test cases. Only superadmin can access.

**Required Headers:**
```
Authorization: Bearer {superadminToken}
```

**Response (200):**
```json
{
  "test": {
    "id": "uuid",
    "title": "Python Basics Test",
    "description": "Test basic Python operations",
    "duration_minutes": 90,
    "is_active": true,
    "created_at": "2026-03-23T21:03:23.271Z",
    "updated_at": "2026-03-23T21:03:23.271Z",
    "questions": [
      {
        "id": "uuid",
        "question_order": 1,
        "question_id": "uuid",
        "title": "Q1: Python Sum",
        "description": "Add two numbers",
        "lang": "python",
        "is_active": true,
        "created_at": "2026-03-23T21:03:23.271Z",
        "updated_at": "2026-03-23T21:03:23.271Z",
        "testCases": [
          {
            "id": "uuid",
            "question_id": "uuid",
            "input": "5\n3",
            "expected_output": "8",
            "created_at": "2026-03-24T10:35:40.789Z"
          }
        ],
        "testCaseCount": 1
      }
    ],
    "questionCount": 1
  }
}
```

**Notes:**
- Questions are returned in order (question_order)
- Each question includes its test cases
- Returns full question details for test-taking
- `duration_minutes` specifies total time allowed to complete test

**Error Responses:**
- `404` - Test not found
- `401` - Access token required
- `403` - Only superadmin can access this

---

### 4. Update Test
**PUT** `/api/tests/{id}`

Update test title, description, duration, or active status. Only superadmin can access.

**Required Headers:**
```
Authorization: Bearer {superadminToken}
```

**Request Body:**
```json
{
  "title": "Python Basics Test (Updated)",
  "description": "Updated description",
  "duration_minutes": 120,
  "is_active": true
}
```

**Response (200):**
```json
{
  "message": "Test updated successfully",
  "test": {
    "id": "uuid",
    "title": "Python Basics Test (Updated)",
    "description": "Updated description",
    "duration_minutes": 120,
    "is_active": true,
    "created_at": "2026-03-23T21:03:23.271Z",
    "updated_at": "2026-03-23T21:03:30.456Z"
  }
}
```

**Error Responses:**
- `404` - Test not found
- `400` - Title already exists
- `401` - Access token required
- `403` - Only superadmin can access this

---

### 5. Delete Test
**DELETE** `/api/tests/{id}`

Delete a test and all associated question links. Only superadmin can access.

**Required Headers:**
```
Authorization: Bearer {superadminToken}
```

**Response (200):**
```json
{
  "message": "Test deleted successfully"
}
```

**Error Responses:**
- `404` - Test not found
- `401` - Access token required
- `403` - Only superadmin can access this

---

### 6. Add Question to Test
**POST** `/api/tests/questions/add`

Add a question to a test. Questions are automatically ordered. Only superadmin can access.

**Required Headers:**
```
Authorization: Bearer {superadminToken}
```

**Request Body:**
```json
{
  "test_id": "uuid",
  "question_id": "uuid"
}
```

**Response (201):**
```json
{
  "message": "Question added to test successfully",
  "testQuestion": {
    "id": "uuid",
    "test_id": "uuid",
    "question_id": "uuid",
    "question_order": 1,
    "created_at": "2026-03-23T21:03:32.021Z"
  }
}
```

**Rules:**
- Test must exist
- Question must exist
- Same question cannot be added twice to the same test
- Questions are automatically assigned next order number

**Error Responses:**
- `400` - test_id and question_id required / Test not found / Question not found / Question already in this test
- `401` - Access token required
- `403` - Only superadmin can access this

---

### 7. Remove Question from Test
**POST** `/api/tests/questions/remove`

Remove a question from a test. Remaining questions are automatically reordered. Only superadmin can access.

**Required Headers:**
```
Authorization: Bearer {superadminToken}
```

**Request Body:**
```json
{
  "test_id": "uuid",
  "question_id": "uuid"
}
```

**Response (200):**
```json
{
  "message": "Question removed from test successfully"
}
```

**Notes:**
- Automatically reorders remaining questions
- Example: If Q2 is removed from [Q1, Q2, Q3], result is [Q1 (order 1), Q3 (order 2)]

**Error Responses:**
- `400` - test_id and question_id required
- `404` - Question not in this test
- `401` - Access token required
- `403` - Only superadmin can access this

---

### 8. Reorder Questions in Test
**PUT** `/api/tests/{test_id}/reorder`

Reorder questions in a test by specifying new order. Only superadmin can access.

**Required Headers:**
```
Authorization: Bearer {superadminToken}
```

**Request Body:**
```json
{
  "questions": [
    "question_id_3",
    "question_id_1",
    "question_id_2"
  ]
}
```

**Response (200):**
```json
{
  "message": "Questions reordered successfully"
}
```

**Notes:**
- Array should contain all question IDs in the desired order
- Questions will be numbered 1, 2, 3, etc. in the order provided
- Must include all questions currently in the test

**Error Responses:**
- `400` - questions array required
- `404` - Test not found
- `401` - Access token required
- `403` - Only superadmin can access this

---

## Code Execution Endpoints

### Execute Code
**POST** `/api/execute`

Execute code in an isolated Docker container. Supports Python, Java, C, and C++. Requires authentication.

**Required Headers:**
```
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "code": "print('Hello, World!')",
  "language": "python",
  "input": "optional stdin",
  "timeout": 3
}
```

**Supported Languages:**
- `python` - Python 3.11
- `java` - Java 17
- `c` - C (GCC 11)
- `cpp` - C++ (G++ 11)

**Response (200) - Success:**
```json
{
  "output": "Hello, World!\n",
  "error": null,
  "executionTime": 0.082,
  "success": true,
  "language": "python",
  "statusCode": 200
}
```

**Response (200) - Execution Error:**
```json
{
  "output": "",
  "error": "SyntaxError: invalid syntax...",
  "executionTime": 0.05,
  "success": false,
  "language": "python",
  "statusCode": 200
}
```

**Response (408) - Timeout:**
```json
{
  "output": "",
  "error": "Execution timeout exceeded (3s)",
  "executionTime": 3.0,
  "success": false,
  "language": "python",
  "statusCode": 408
}
```

**Features:**
- Runs code in isolated Docker containers
- Captures stdout and stderr separately
- Supports stdin input
- Configurable timeout (default 3 seconds, max 5 seconds)
- Memory and CPU limits enforced
- Automatic cleanup of temporary files
- Execution time tracking

**Error Responses:**
- `400` - Code is required / Language is required / Unsupported language
- `401` - Access token required
- `408` - Execution timeout exceeded
- `500` - Execution failed

**Notes:**
- Any authenticated user can execute code
- No role restrictions
- Output is captured as-is (whitespace preserved)
- Compilation happens during execution for compiled languages
- Java code must have a Main class

---

### Execute Code (Test Endpoint - No Auth Required)
**POST** `/api/execute/test`

Execute code in an isolated Docker container **WITHOUT authentication**. For testing and development purposes only.

**Request Body:**
```json
{
  "code": "print('Hello, World!')",
  "language": "python",
  "input": "optional stdin",
  "timeout": 3
}
```

**Response (200) - Success:**
```json
{
  "output": "Hello, World!\n",
  "error": null,
  "executionTime": 0.082,
  "success": true,
  "language": "python",
  "statusCode": 200
}
```

**Features:**
- Same functionality as authenticated endpoint
- NO authentication required
- For testing code execution without auth tokens
- All supported languages: Python, Java, C, C++
- Same resource limits and timeouts apply

**⚠️ Warning:** This endpoint is for testing/development only. Use the authenticated `/api/execute` endpoint in production.

---

## Common Error Responses

### 401 - Unauthorized
```json
{
  "error": "Access token required"
}
```

### 403 - Forbidden
```json
{
  "error": "Only superadmin can access this"
}
```

### 404 - Not Found
```json
{
  "error": "User/College not found"
}
```

### 500 - Server Error
```json
{
  "error": "Failed to {action}"
}
```

---

## Test Credentials

### Superadmin
- **Email:** `admin@meikural.com`
- **Password:** `admin123`

---

## Environment Variables

The backend requires the following environment variables in `.env`:

```
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=meikural
DB_USER=postgres
DB_PASSWORD=postgres
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_here
SUPERADMIN_NAME=Admin
SUPERADMIN_EMAIL=admin@meikural.com
SUPERADMIN_PASSWORD=admin123
```

---

## Scripts

```bash
# Start development server with auto-reload
pnpm dev

# Start production server
pnpm start

# Run database migration
pnpm migrate

# Seed superadmin user
pnpm seed

# Reset database (drops and recreates)
pnpm reset-db
```

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role user_role NOT NULL (superadmin|trainer|students|college-admin),
  college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

### Colleges Table
```sql
CREATE TABLE colleges (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

### Batches Table
```sql
CREATE TABLE batches (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

### Batch Students Junction Table
```sql
CREATE TABLE batch_students (
  id UUID PRIMARY KEY,
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(batch_id, student_id)
)
```

### Batch Trainers Junction Table
```sql
CREATE TABLE batch_trainers (
  id UUID PRIMARY KEY,
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  trainer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(batch_id, trainer_id)
)
```

### Questions Table
```sql
CREATE TABLE questions (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  solution_code TEXT NOT NULL,
  lang programming_language NOT NULL (python|java|c|cpp),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

### Test Cases Table
```sql
CREATE TABLE test_cases (
  id UUID PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  input TEXT NOT NULL,
  expected_output TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- All IDs are UUIDs
- Only one superadmin is allowed in the system
- Students and college-admins must be assigned to a college
- Trainers do not require a college assignment
- Batches require a college assignment
- **Batch names must be unique per college** (same name allowed in different colleges)
- Deleting a college will cascade delete all associated users and batches
- **Questions support 4 programming languages:** python, java, c, cpp
- **Question titles must be unique** in the system
- **Multiple test cases** can be added per question
- Deleting a question will cascade delete all associated test cases
