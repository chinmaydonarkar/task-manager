# IndiaNIC Task Management System - API Testing Guide

## 🧪 Overview

This guide provides comprehensive testing examples for all API endpoints in the IndiaNIC Task Management System. Use these examples to test the functionality of each service and verify proper integration.

## 🚀 Quick Start

### Prerequisites
- All services running (auth-service, task-service, gateway, frontend)
- Postman or curl installed
- Test files ready (PDF, DOCX, JPG)

### Service URLs
- **Gateway**: `http://localhost:5050`
- **Auth Service**: `http://localhost:5001`
- **Task Service**: `http://localhost:5002`
- **Frontend**: `http://localhost:3000`

## 🔐 Authentication Testing

### 1. User Registration

```bash
curl -X POST http://localhost:5050/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Test User",
    "email": "test@example.com",
    "avatar": null,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. User Login

```bash
curl -X POST http://localhost:5050/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Test User",
    "email": "test@example.com",
    "avatar": null,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 3. Get User Profile

```bash
curl -X GET http://localhost:5050/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Test User",
  "email": "test@example.com",
  "avatar": null,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### 4. Update User Profile

```bash
curl -X PUT http://localhost:5050/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Test User",
    "email": "updated@example.com"
  }'
```

**Expected Response:**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Updated Test User",
    "email": "updated@example.com",
    "avatar": null,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:35:00.000Z"
  },
  "message": "Profile updated successfully"
}
```

### 5. Upload Avatar

```bash
curl -X POST http://localhost:5050/api/auth/profile/avatar \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "avatar=@/path/to/avatar.jpg"
```

**Expected Response:**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Updated Test User",
    "email": "updated@example.com",
    "avatar": "/uploads/avatars/507f1f77bcf86cd799439011_avatar.jpg",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:40:00.000Z"
  },
  "message": "Avatar uploaded successfully"
}
```

### 6. Change Password

```bash
curl -X PUT http://localhost:5050/api/auth/profile/password \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "password123",
    "newPassword": "newpassword123"
  }'
```

**Expected Response:**
```json
{
  "message": "Password changed successfully"
}
```

### 7. Logout

```bash
curl -X POST http://localhost:5050/api/auth/logout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "message": "Logged out successfully"
}
```

## 📋 Task Management Testing

### 1. Create Task (Without Files)

```bash
curl -X POST http://localhost:5050/api/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Task",
    "description": "This is a test task",
    "dueDate": "2024-01-20T10:00:00.000Z",
    "status": "Pending"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Test Task",
    "description": "This is a test task",
    "status": "Pending",
    "dueDate": "2024-01-20T10:00:00.000Z",
    "user": "507f1f77bcf86cd799439011",
    "files": [],
    "createdAt": "2024-01-15T10:45:00.000Z",
    "updatedAt": "2024-01-15T10:45:00.000Z"
  },
  "message": "Task created successfully"
}
```

### 2. Create Task (With Files)

```bash
curl -X POST http://localhost:5050/api/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "title=Task with Files" \
  -F "description=This task has attached files" \
  -F "dueDate=2024-01-25T10:00:00.000Z" \
  -F "status=Pending" \
  -F "files=@/path/to/document.pdf" \
  -F "files=@/path/to/image.jpg"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "title": "Task with Files",
    "description": "This task has attached files",
    "status": "Pending",
    "dueDate": "2024-01-25T10:00:00.000Z",
    "user": "507f1f77bcf86cd799439011",
    "files": [
      {
        "filename": "1705314300000_document.pdf",
        "originalname": "document.pdf",
        "mimetype": "application/pdf",
        "size": 1024000,
        "url": "/uploads/507f1f77bcf86cd799439011/507f1f77bcf86cd799439013/1705314300000_document.pdf"
      },
      {
        "filename": "1705314300001_image.jpg",
        "originalname": "image.jpg",
        "mimetype": "image/jpeg",
        "size": 512000,
        "url": "/uploads/507f1f77bcf86cd799439011/507f1f77bcf86cd799439013/1705314300001_image.jpg"
      }
    ],
    "createdAt": "2024-01-15T10:50:00.000Z",
    "updatedAt": "2024-01-15T10:50:00.000Z"
  },
  "message": "Task created successfully"
}
```

### 3. Get All Tasks

```bash
curl -X GET http://localhost:5050/api/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Test Task",
      "description": "This is a test task",
      "status": "Pending",
      "dueDate": "2024-01-20T10:00:00.000Z",
      "user": "507f1f77bcf86cd799439011",
      "files": [],
      "createdAt": "2024-01-15T10:45:00.000Z",
      "updatedAt": "2024-01-15T10:45:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439013",
      "title": "Task with Files",
      "description": "This task has attached files",
      "status": "Pending",
      "dueDate": "2024-01-25T10:00:00.000Z",
      "user": "507f1f77bcf86cd799439011",
      "files": [...],
      "createdAt": "2024-01-15T10:50:00.000Z",
      "updatedAt": "2024-01-15T10:50:00.000Z"
    }
  ],
  "message": "Tasks retrieved successfully"
}
```

### 4. Get Specific Task

```bash
curl -X GET http://localhost:5050/api/tasks/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Test Task",
    "description": "This is a test task",
    "status": "Pending",
    "dueDate": "2024-01-20T10:00:00.000Z",
    "user": "507f1f77bcf86cd799439011",
    "files": [],
    "createdAt": "2024-01-15T10:45:00.000Z",
    "updatedAt": "2024-01-15T10:45:00.000Z"
  },
  "message": "Task retrieved successfully"
}
```

### 5. Update Task

```bash
curl -X PUT http://localhost:5050/api/tasks/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Test Task",
    "description": "This task has been updated",
    "status": "In Progress",
    "dueDate": "2024-01-22T10:00:00.000Z"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Updated Test Task",
    "description": "This task has been updated",
    "status": "In Progress",
    "dueDate": "2024-01-22T10:00:00.000Z",
    "user": "507f1f77bcf86cd799439011",
    "files": [],
    "createdAt": "2024-01-15T10:45:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  },
  "message": "Task updated successfully"
}
```

### 6. Update Task with Additional Files

```bash
curl -X PUT http://localhost:5050/api/tasks/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "title=Updated Test Task" \
  -F "description=This task has been updated with new files" \
  -F "status=In Progress" \
  -F "files=@/path/to/new-document.pdf"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Updated Test Task",
    "description": "This task has been updated with new files",
    "status": "In Progress",
    "dueDate": "2024-01-22T10:00:00.000Z",
    "user": "507f1f77bcf86cd799439011",
    "files": [
      {
        "filename": "1705314600000_new-document.pdf",
        "originalname": "new-document.pdf",
        "mimetype": "application/pdf",
        "size": 2048000,
        "url": "/uploads/507f1f77bcf86cd799439011/507f1f77bcf86cd799439012/1705314600000_new-document.pdf"
      }
    ],
    "createdAt": "2024-01-15T10:45:00.000Z",
    "updatedAt": "2024-01-15T11:05:00.000Z"
  },
  "message": "Task updated successfully"
}
```

### 7. Delete Task

```bash
curl -X DELETE http://localhost:5050/api/tasks/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

### 8. Export Tasks to CSV

```bash
curl -X GET http://localhost:5050/api/tasks/export/csv \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  --output tasks.csv
```

**Expected Response:** CSV file download

## ⏰ Cron Job Testing

### 1. Get Cron Statistics

```bash
curl -X GET http://localhost:5050/api/tasks/cron/stats
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "isRunning": true,
    "lastRun": "2024-01-15T08:00:00.000Z",
    "nextRun": "2024-01-16T08:00:00.000Z",
    "totalRuns": 150,
    "successfulRuns": 148,
    "failedRuns": 2,
    "lastError": "Failed to send email to user@example.com"
  }
}
```

### 2. Manually Trigger Cron Job

```bash
curl -X POST http://localhost:5050/api/tasks/cron/trigger
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Cron job triggered successfully"
}
```

### 3. Get Today's Reminders

```bash
curl -X GET http://localhost:5050/api/tasks/cron/reminders/today
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "usersWithTasks": 3,
    "totalTasks": 8,
    "tasksByUser": {
      "507f1f77bcf86cd799439011": [
        {
          "_id": "507f1f77bcf86cd799439012",
          "title": "Test Task",
          "description": "This is a test task",
          "status": "Pending",
          "dueDate": "2024-01-15T10:00:00.000Z",
          "user": "507f1f77bcf86cd799439011"
        }
      ]
    }
  }
}
```

## 🔌 WebSocket Testing

### 1. Get WebSocket Statistics

```bash
curl -X GET http://localhost:5050/api/tasks/socket/stats
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "connectedClients": 5,
    "activeRooms": 3,
    "totalMessages": 150,
    "uptime": "2 hours, 30 minutes"
  }
}
```

### 2. Get Users in Task Room

```bash
curl -X GET http://localhost:5050/api/tasks/socket/users/507f1f77bcf86cd799439012
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "taskId": "507f1f77bcf86cd799439012",
    "connectedUsers": 2,
    "users": [
      {
        "userId": "507f1f77bcf86cd799439011",
        "socketId": "socket_123",
        "connectedAt": "2024-01-15T10:30:00.000Z"
      },
      {
        "userId": "507f1f77bcf86cd799439012",
        "socketId": "socket_456",
        "connectedAt": "2024-01-15T10:35:00.000Z"
      }
    ]
  }
}
```

## 🧪 JavaScript Testing Examples

### 1. Frontend API Integration

```javascript
// Test task creation
async function testCreateTask() {
  const token = localStorage.getItem('token');
  
  const formData = new FormData();
  formData.append('title', 'JavaScript Test Task');
  formData.append('description', 'Created via JavaScript');
  formData.append('dueDate', '2024-01-25T10:00:00.000Z');
  formData.append('status', 'Pending');
  
  // Add test file
  const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
  formData.append('files', file);
  
  try {
    const response = await fetch('http://localhost:5050/api/tasks', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    const result = await response.json();
    console.log('Task created:', result);
    return result;
  } catch (error) {
    console.error('Error creating task:', error);
  }
}

// Test WebSocket connection
function testWebSocket() {
  const socket = io('http://localhost:5050', {
    auth: { token: localStorage.getItem('token') }
  });
  
  socket.on('connect', () => {
    console.log('Connected to WebSocket');
    
    // Join task room
    socket.emit('join-task', { taskId: '507f1f77bcf86cd799439012' });
  });
  
  socket.on('task:updated', (data) => {
    console.log('Task updated:', data);
  });
  
  socket.on('task:created', (data) => {
    console.log('Task created:', data);
  });
  
  socket.on('task:deleted', (data) => {
    console.log('Task deleted:', data);
  });
  
  return socket;
}
```

### 2. Error Testing

```javascript
// Test invalid authentication
async function testInvalidAuth() {
  try {
    const response = await fetch('http://localhost:5050/api/tasks', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer invalid_token'
      }
    });
    
    const result = await response.json();
    console.log('Invalid auth response:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Test file upload validation
async function testInvalidFile() {
  const token = localStorage.getItem('token');
  
  const formData = new FormData();
  formData.append('title', 'Test Task');
  
  // Add invalid file type
  const invalidFile = new File(['test'], 'test.exe', { type: 'application/x-msdownload' });
  formData.append('files', invalidFile);
  
  try {
    const response = await fetch('http://localhost:5050/api/tasks', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    const result = await response.json();
    console.log('Invalid file response:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

## 📊 Postman Collection

### Import this collection into Postman:

```json
{
  "info": {
    "name": "IndiaNIC Task Management API",
    "description": "Complete API testing collection for IndiaNIC Task Management System"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5050"
    },
    {
      "key": "token",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Register User",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/auth/register",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Test User\",\n  \"email\": \"test@example.com\",\n  \"password\": \"password123\"\n}"
            }
          }
        },
        {
          "name": "Login User",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/auth/login",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"password123\"\n}"
            }
          }
        }
      ]
    },
    {
      "name": "Tasks",
      "item": [
        {
          "name": "Create Task",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/tasks",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "body": {
              "mode": "formdata",
              "formdata": [
                {
                  "key": "title",
                  "value": "Test Task"
                },
                {
                  "key": "description",
                  "value": "Test description"
                },
                {
                  "key": "dueDate",
                  "value": "2024-01-25T10:00:00.000Z"
                },
                {
                  "key": "status",
                  "value": "Pending"
                }
              ]
            }
          }
        },
        {
          "name": "Get All Tasks",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/tasks",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ]
          }
        }
      ]
    }
  ]
}
```

## 🚨 Common Error Scenarios

### 1. Authentication Errors

```bash
# Missing token
curl -X GET http://localhost:5050/api/tasks
# Response: 401 Unauthorized

# Invalid token
curl -X GET http://localhost:5050/api/tasks \
  -H "Authorization: Bearer invalid_token"
# Response: 401 Unauthorized
```

### 2. Validation Errors

```bash
# Missing required fields
curl -X POST http://localhost:5050/api/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description": "Missing title"}'
# Response: 400 Bad Request

# Invalid file type
curl -X POST http://localhost:5050/api/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "title=Test" \
  -F "files=@/path/to/invalid.exe"
# Response: 400 Bad Request
```

### 3. File Upload Errors

```bash
# File too large
curl -X POST http://localhost:5050/api/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "title=Test" \
  -F "files=@/path/to/large-file.pdf"
# Response: 413 Payload Too Large
```

## 📈 Performance Testing

### 1. Load Testing with Artillery

```yaml
# artillery-config.yml
config:
  target: 'http://localhost:5050'
  phases:
    - duration: 60
      arrivalRate: 10
  defaults:
    headers:
      Authorization: 'Bearer YOUR_JWT_TOKEN'

scenarios:
  - name: "Task CRUD Operations"
    weight: 100
    flow:
      - get:
          url: "/api/tasks"
      - post:
          url: "/api/tasks"
          json:
            title: "Load Test Task"
            description: "Created during load test"
            dueDate: "2024-01-25T10:00:00.000Z"
            status: "Pending"
```

### 2. Run Load Test

```bash
# Install Artillery
npm install -g artillery

# Run load test
artillery run artillery-config.yml
```

## 🔍 Monitoring and Debugging

### 1. Check Service Health

```bash
# Gateway health
curl http://localhost:5050/health

# Auth service health
curl http://localhost:5050/api/auth/health

# Task service health
curl http://localhost:5050/api/tasks/health
```

### 2. Monitor Logs

```bash
# Gateway logs
docker logs india-nic-gateway-1

# Auth service logs
docker logs india-nic-auth-service-1

# Task service logs
docker logs india-nic-task-service-1
```

### 3. Database Queries

```bash
# Connect to MongoDB
mongosh mongodb://localhost:27017/taskmanager

# Check collections
show collections

# Query tasks
db.tasks.find({})

# Query users
db.users.find({})
```

This comprehensive testing guide provides all the necessary examples and scenarios to thoroughly test the IndiaNIC Task Management System APIs. 