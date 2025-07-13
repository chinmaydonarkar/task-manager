# 🕐 Daily Task Reminder Cron Job Implementation

## **Overview**

This implementation provides a comprehensive daily task reminder system that runs at 8:00 AM every day, checking for tasks due today and sending personalized reminder emails to users.

## **🔄 Features**

### **Core Functionality**
- ✅ **Daily Execution**: Runs every day at 8:00 AM (Indian timezone)
- ✅ **Task Detection**: Finds all tasks due today across all users
- ✅ **User Notification**: Sends personalized reminder emails to users
- ✅ **Error Handling**: Robust error handling with detailed logging
- ✅ **Performance Monitoring**: Tracks execution statistics and performance
- ✅ **Manual Trigger**: API endpoint to manually trigger the job for testing

### **Best Practices Implemented**
- ✅ **DRY Principle**: Reusable service classes and utilities
- ✅ **Separation of Concerns**: Separate services for different responsibilities
- ✅ **Error Resilience**: Graceful handling of failures
- ✅ **Logging**: Comprehensive logging with Winston
- ✅ **Monitoring**: Statistics and health checks
- ✅ **Configuration**: Environment-based configuration

## **🏗️ Architecture**

### **Service Structure**
```
task-service/
├── src/
│   ├── services/
│   │   ├── cronService.js      # Main cron job orchestrator
│   │   ├── emailService.js     # Email templates and sending
│   │   └── userService.js      # User data fetching
│   ├── utils/
│   │   └── logger.js           # Winston logging utility
│   ├── models/
│   │   └── Task.js             # Task data model
│   └── routes/
│       └── task.js             # API endpoints
```

### **Data Flow**
1. **Cron Trigger** → `cronService.executeDailyReminders()`
2. **Task Query** → `getAllTasksDueToday()` → Database
3. **User Fetch** → `userService.getUsersByIds()` → Auth Service
4. **Email Generation** → `emailService.sendTaskReminderNotification()`
5. **Email Delivery** → SMTP via Nodemailer

## **📋 API Endpoints**

### **Cron Job Management**

#### **Get Cron Statistics**
```bash
GET /api/tasks/cron/stats
```
**Response:**
```json
{
  "success": true,
  "data": {
    "totalRuns": 5,
    "successfulRuns": 4,
    "failedRuns": 1,
    "totalEmailsSent": 12,
    "totalUsersNotified": 8,
    "lastRun": "2024-01-15T08:00:00.000Z",
    "isRunning": false,
    "nextRun": "2024-01-16T08:00:00.000Z"
  }
}
```

#### **Manually Trigger Cron Job**
```bash
POST /api/tasks/cron/trigger
```
**Response:**
```json
{
  "success": true,
  "message": "Cron job triggered successfully"
}
```

#### **Get Today's Reminders**
```bash
GET /api/tasks/cron/reminders/today
```
**Response:**
```json
{
  "success": true,
  "data": {
    "usersWithTasks": 3,
    "totalTasks": 7,
    "tasksByUser": {
      "user_id_1": [
        {
          "_id": "task_id_1",
          "title": "Complete project proposal",
          "description": "Finish the quarterly project proposal",
          "dueDate": "2024-01-15T17:00:00.000Z",
          "status": "Pending"
        }
      ]
    }
  }
}
```

## **🔧 Configuration**

### **Environment Variables**

#### **Task Service**
```env
# Database
MONGODB_URI=mongodb://localhost:27017/taskdb

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@gmail.com

# Auth Service Communication
AUTH_SERVICE_URL=http://localhost:5001
INTER_SERVICE_TOKEN=internal-service-token

# Logging
LOG_LEVEL=info
NODE_ENV=development
```

#### **Auth Service**
```env
# Add to auth service for inter-service communication
INTER_SERVICE_TOKEN=internal-service-token
```

## **📧 Email Templates**

### **Reminder Email Structure**
- **Subject**: "Task Reminder: You have X task(s) due today"
- **HTML Template**: Professional design with task details
- **Text Version**: Plain text fallback
- **Personalization**: User name and task-specific details

### **Email Features**
- ✅ **Responsive Design**: Works on all email clients
- ✅ **Task Details**: Shows title, description, due date, status
- ✅ **Professional Styling**: Branded with IndiaNIC colors
- ✅ **Error Handling**: Non-blocking email failures

## **📊 Monitoring & Logging**

### **Log Files**
```
task-service/logs/
├── combined.log    # All application logs
├── error.log       # Error logs only
└── cron.log        # Cron job specific logs
```

### **Log Levels**
- **INFO**: Normal operations, job execution
- **WARN**: Non-critical issues (user not found)
- **ERROR**: Critical failures (database, email)

### **Statistics Tracking**
- Total job runs
- Successful vs failed runs
- Emails sent
- Users notified
- Execution time
- Next scheduled run

## **🚀 Usage Examples**

### **1. Check Cron Job Status**
```bash
curl http://localhost:5050/api/tasks/cron/stats
```

### **2. Manually Trigger Job**
```bash
curl -X POST http://localhost:5050/api/tasks/cron/trigger
```

### **3. View Today's Reminders**
```bash
curl http://localhost:5050/api/tasks/cron/reminders/today
```

### **4. Monitor Logs**
```bash
# View cron-specific logs
tail -f task-service/logs/cron.log

# View all logs
tail -f task-service/logs/combined.log
```

## **🔍 Testing**

### **Manual Testing**
1. **Create test tasks** with today's due date
2. **Trigger manually**: `POST /api/tasks/cron/trigger`
3. **Check logs**: Monitor execution in logs
4. **Verify emails**: Check email delivery

### **Automated Testing**
```javascript
// Test cron service
const cronService = require('./services/cronService');

// Test task fetching
const tasks = await cronService.getAllTasksDueToday();
console.log('Tasks due today:', tasks);

// Test manual trigger
await cronService.triggerManually();
```

## **🛡️ Error Handling**

### **Graceful Failures**
- ✅ **Database Errors**: Logged, job continues
- ✅ **Email Failures**: Individual emails don't block others
- ✅ **User Service Errors**: Skip users with fetch failures
- ✅ **Network Issues**: Timeout handling and retries

### **Recovery Mechanisms**
- **Concurrent Execution**: Prevents multiple job instances
- **Partial Success**: Continues processing even with some failures
- **Detailed Logging**: Full error context for debugging

## **⚡ Performance Optimizations**

### **Database Queries**
- **Efficient Filtering**: Date range and status filtering
- **Indexed Fields**: Proper MongoDB indexes on dueDate and status
- **Batch Processing**: Process users in parallel

### **Email Delivery**
- **Parallel Sending**: All emails sent concurrently
- **Non-blocking**: Email failures don't stop the job
- **Template Caching**: Email templates generated once

## **🔧 Maintenance**

### **Log Rotation**
- **File Size**: 5MB max per log file
- **File Count**: Keep last 5 log files
- **Automatic Cleanup**: Old logs automatically removed

### **Monitoring**
- **Health Checks**: `/api/tasks/cron/stats`
- **Performance Metrics**: Execution time tracking
- **Error Tracking**: Failed job monitoring

## **🎯 Success Criteria**

### **✅ Job Execution**
- [ ] Runs daily at 8:00 AM
- [ ] Finds all tasks due today
- [ ] Sends emails to all users with tasks
- [ ] Handles errors gracefully
- [ ] Logs all activities

### **✅ Email Delivery**
- [ ] Professional email templates
- [ ] Personalized content
- [ ] Task details included
- [ ] Responsive design
- [ ] Error handling

### **✅ Monitoring**
- [ ] Statistics tracking
- [ ] Health check endpoints
- [ ] Manual trigger capability
- [ ] Detailed logging
- [ ] Performance metrics

## **🚀 Deployment**

### **Docker Compose**
```yaml
task-service:
  environment:
    - AUTH_SERVICE_URL=http://auth-service:5001
    - INTER_SERVICE_TOKEN=internal-service-token
    - LOG_LEVEL=info
```

### **Production Considerations**
- **Timezone**: Set to Asia/Kolkata
- **Logging**: Configure log rotation
- **Monitoring**: Set up alerts for job failures
- **Backup**: Ensure task data is backed up

This implementation provides a robust, scalable, and maintainable daily task reminder system following best practices and the DRY principle! 🎉 