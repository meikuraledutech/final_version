# API Quick Reference

## Base URL
```
http://localhost:3001
```

## Authentication Header
```
Authorization: Bearer {accessToken}
```

---

## Authentication (No Auth Required)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/register` | Register user (superadmin only) |

---

## Colleges (Superadmin Only)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/colleges` | Create college |
| GET | `/api/colleges` | Get all colleges |
| GET | `/api/colleges/{id}` | Get college by ID |
| PUT | `/api/colleges/{id}` | Update college |
| DELETE | `/api/colleges/{id}` | Delete college |

---

## Batches (Superadmin Only)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/batches` | Create batch |
| GET | `/api/batches` | Get all batches (with college_id filter) |
| GET | `/api/batches/college/{college_id}` | Get batches by college |
| GET | `/api/batches/{id}` | Get batch by ID |
| PUT | `/api/batches/{id}` | Update batch |
| DELETE | `/api/batches/{id}` | Delete batch |
| POST | `/api/batches/{batch_id}/tests/assign` | Assign test to batch |
| GET | `/api/batches/{batch_id}/tests` | Get tests assigned to batch |
| POST | `/api/batches/{batch_id}/tests/remove` | Remove test from batch |

---

## Batch Members (Superadmin Only)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/batch-members/students` | Add student to batch |
| GET | `/api/batch-members/{batch_id}/students` | Get students in batch |
| DELETE | `/api/batch-members/{batch_id}/students/{student_id}` | Remove student from batch |
| POST | `/api/batch-members/trainers` | Add trainer to batch |
| GET | `/api/batch-members/{batch_id}/trainers` | Get trainers in batch |
| DELETE | `/api/batch-members/{batch_id}/trainers/{trainer_id}` | Remove trainer from batch |

---

## Users (Superadmin Only)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/users` | Get all users (with filters) |
| GET | `/api/users?role=students&college_id={id}` | Filter users |
| GET | `/api/users/{id}` | Get user by ID |
| PUT | `/api/users/{id}` | Update user |
| DELETE | `/api/users/{id}` | Delete user |

---

## User Filters (Superadmin Only)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/users/filter/students` | Get all students |
| GET | `/api/users/filter/students?college_id={id}` | Get students by college |
| GET | `/api/users/filter/trainers` | Get all trainers |
| GET | `/api/users/filter/college-admins` | Get all college admins |
| GET | `/api/users/filter/college-admins?college_id={id}` | Get college admins by college |

---

## Questions (Superadmin Only)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/questions` | Create question |
| GET | `/api/questions` | Get all questions (with lang filter) |
| GET | `/api/questions/lang/{lang}` | Get questions by language |
| GET | `/api/questions/{id}` | Get question by ID |
| PUT | `/api/questions/{id}` | Update question |
| DELETE | `/api/questions/{id}` | Delete question |

---

## Test Cases (Superadmin Only)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/questions/{question_id}/testcases` | Add test case (validated) |
| GET | `/api/questions/{question_id}/testcases` | Get test cases by question |
| GET | `/api/questions/testcases/{id}` | Get test case by ID |
| PUT | `/api/questions/testcases/{id}` | Update test case |
| DELETE | `/api/questions/testcases/{id}` | Delete test case |

⚠️ **Test cases are validated before saving** - Solution code is executed with the test input and output must match expected_output exactly.

---

## Tests/Assignments (Superadmin Only)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/tests` | Create test |
| GET | `/api/tests` | Get all tests |
| GET | `/api/tests/{id}` | Get test with ordered questions |
| PUT | `/api/tests/{id}` | Update test |
| DELETE | `/api/tests/{id}` | Delete test |
| POST | `/api/tests/questions/add` | Add question to test |
| POST | `/api/tests/questions/remove` | Remove question from test |
| PUT | `/api/tests/{test_id}/reorder` | Reorder questions in test |

**Features:**
- Ordered list of questions (auto-numbered)
- No duplicate questions per test
- Auto-reordering when questions removed
- Each question includes test cases

---

## Code Execution (Authenticated Users)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/execute` | Execute code in Docker container |

Supports: Python 3.11, Java 17, C (GCC 11), C++ (G++ 11)

---

## Code Execution (Testing - No Auth)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/execute/test` | Execute code WITHOUT authentication |

⚠️ **For testing/development only** - Same as authenticated endpoint but no auth required

---

## User Roles

| Role | Requires College | Can Register | Special Notes |
|------|------------------|--------------|---------------|
| `superadmin` | No | No (Seeded only) | Only 1 allowed |
| `students` | ✅ Required | Yes | Via superadmin |
| `trainer` | No | Yes | Via superadmin |
| `college-admin` | ✅ Required | Yes | Via superadmin |

---

## Sample Requests

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@meikural.com",
    "password": "admin123"
  }'
```

### Create Student
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "name": "John Student",
    "email": "john@student.com",
    "password": "pass123",
    "role": "students",
    "college_id": "uuid"
  }'
```

### Create College
```bash
curl -X POST http://localhost:3001/api/colleges \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "name": "MIT",
    "description": "Massachusetts Institute of Technology"
  }'
```

### Get Students by College
```bash
curl -X GET "http://localhost:3001/api/users/filter/students?college_id=uuid" \
  -H "Authorization: Bearer {token}"
```

### Update User
```bash
curl -X PUT http://localhost:3001/api/users/uuid \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "name": "Updated Name",
    "email": "newemail@example.com"
  }'
```

### Create Question
```bash
curl -X POST http://localhost:3001/api/questions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "title": "Fibonacci Sequence",
    "description": "Write a function that returns the nth Fibonacci number",
    "solution_code": "def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)",
    "lang": "python"
  }'
```

### Get All Questions
```bash
curl -X GET "http://localhost:3001/api/questions" \
  -H "Authorization: Bearer {token}"
```

### Get Questions by Language
```bash
curl -X GET "http://localhost:3001/api/questions/lang/python" \
  -H "Authorization: Bearer {token}"
```

### Add Test Case
```bash
curl -X POST http://localhost:3001/api/questions/{question_id}/testcases \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "question_id": "uuid",
    "input": "5",
    "expected_output": "5"
  }'
```

### Get Test Cases by Question
```bash
curl -X GET "http://localhost:3001/api/questions/{question_id}/testcases" \
  -H "Authorization: Bearer {token}"
```

### Execute Code (Authenticated)
```bash
curl -X POST http://localhost:3001/api/execute \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "code": "print(5 + 3)",
    "language": "python"
  }'
```

### Execute Code (Test - No Auth Required)
```bash
curl -X POST http://localhost:3001/api/execute/test \
  -H "Content-Type: application/json" \
  -d '{
    "code": "print(5 + 3)",
    "language": "python"
  }'
```

### Execute Code with Input
```bash
curl -X POST http://localhost:3001/api/execute \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "code": "x = int(input())\nprint(x * 2)",
    "language": "python",
    "input": "10"
  }'
```

### Create Test
```bash
curl -X POST http://localhost:3001/api/tests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "title": "Python Basics Test",
    "description": "Test basic Python operations",
    "duration_minutes": 90
  }'
```

### Add Question to Test
```bash
curl -X POST http://localhost:3001/api/tests/questions/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "test_id": "test-uuid",
    "question_id": "question-uuid"
  }'
```

### Get Test with Ordered Questions
```bash
curl -X GET http://localhost:3001/api/tests/test-uuid \
  -H "Authorization: Bearer {token}"
```

### Remove Question from Test
```bash
curl -X POST http://localhost:3001/api/tests/questions/remove \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "test_id": "test-uuid",
    "question_id": "question-uuid"
  }'
```

### Reorder Questions in Test
```bash
curl -X PUT http://localhost:3001/api/tests/test-uuid/reorder \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "questions": ["q3-uuid", "q1-uuid", "q2-uuid"]
  }'
```

### Assign Test to Batch
```bash
curl -X POST http://localhost:3001/api/batches/batch-uuid/tests/assign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "batch_id": "batch-uuid",
    "test_id": "test-uuid"
  }'
```

### Get Tests for Batch
```bash
curl -X GET http://localhost:3001/api/batches/batch-uuid/tests \
  -H "Authorization: Bearer {token}"
```

### Remove Test from Batch
```bash
curl -X POST http://localhost:3001/api/batches/batch-uuid/tests/remove \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "batch_id": "batch-uuid",
    "test_id": "test-uuid"
  }'
```

---

## Response Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Server Error |

---

## Environment Setup

```bash
# Install dependencies
pnpm install

# Setup database
pnpm reset-db
pnpm migrate
pnpm seed

# Start development server
pnpm dev
```

---

## Test Credentials

- **Email:** admin@meikural.com
- **Password:** admin123

---

## Key Rules

1. **Superadmin only:** Only 1 superadmin can exist
2. **College requirement:** Students & college-admins must have college_id
3. **Batch requirement:** Batches must have college_id
4. **Batch name unique:** Batch names must be unique per college (same name allowed in different colleges)
5. **Batch members:** Add students & trainers to batches via junction tables
6. **Trainers flexible:** Trainers don't require a college
7. **Superadmin protection:** Cannot delete or modify superadmin via API
8. **Unique members:** Cannot add same student/trainer to batch twice
9. **Authentication:** All endpoints except login/refresh require valid token
10. **Authorization:** Only superadmin can access college, batch, and user management
11. **Supported languages:** Questions support python, java, c, cpp only
12. **Question title unique:** Question titles must be unique in the system
13. **Multiple test cases:** Multiple test cases can be added per question
14. **Cascade delete:** Deleting a question deletes all associated test cases
15. **Test case validation:** Test cases are validated before saving (must produce correct output)
16. **Code execution:** Any authenticated user can execute code
17. **Execution limits:** 3-second timeout, 128MB memory, isolated containers
18. **Docker containers:** Python 3.11, Java 17, C/C++ (GCC 11)
19. **Test title unique:** Test titles must be unique in the system
20. **No duplicate questions:** Same question cannot appear twice in a test
21. **Auto-ordered questions:** Questions in a test are automatically numbered 1, 2, 3...
22. **Auto-reordering:** Removing a question reorders remaining questions automatically
23. **Test to batch:** Multiple tests can be assigned to a batch
24. **No duplicate assignment:** Same test cannot be assigned twice to same batch
25. **Batch tests:** Each batch can have multiple tests for practice/assignments
26. **Test duration:** Default 60 minutes, configurable when creating/updating test
