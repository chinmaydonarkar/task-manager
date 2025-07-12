# Task Management System - MERN Microservices

A comprehensive task management application built with MERN stack using microservices architecture, featuring real-time updates, file uploads, email notifications, and modern UI.

## 🚀 Features

### Authentication & User Management
- JWT-based authentication
- User registration and login
- Profile management with image upload
- Redis session storage
- Secure password handling

### Task Management (CRUD Operations)
- ✅ **Create Tasks**: Add new tasks with title, description, due date, status, and file attachments
- ✅ **Read Tasks**: View all tasks with filtering, sorting, and search functionality
- ✅ **Update Tasks**: Edit task details and update status
- ✅ **Delete Tasks**: Remove tasks with confirmation
- ✅ **File Upload**: Support for PDF, DOCX, and image files
- ✅ **Status Management**: Track task progress (Pending, In Progress, Completed, Cancelled)

### Advanced Features
- 🔄 **Real-time Updates**: Socket.io integration for live task updates
- 📧 **Email Notifications**: Automatic emails on task events
- 📊 **CSV Export**: Export task data to CSV format
- ⏰ **Cron Jobs**: Daily reminder system for overdue tasks
- 📱 **Responsive Design**: Modern UI with Tailwind CSS
- 🔍 **Search & Filter**: Advanced filtering and sorting options

### Technical Features
- 🏗️ **Microservices Architecture**: Separate services for auth, tasks, and gateway
- 🐳 **Docker Support**: Complete containerization with docker-compose
- 📚 **API Documentation**: Swagger/OpenAPI documentation
- 🔒 **Security**: JWT authentication, CORS, input validation
- 🎯 **DRY Principles**: Reusable components and services

## 🏗️ Architecture

```
IndiaNIC/
├── auth-service/          # Authentication & user management
├── task-service/          # Task CRUD operations & file handling
├── gateway/              # API gateway & routing
├── frontend/             # React application
└── docker-compose.yml    # Service orchestration
```

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** for data persistence
- **Redis** for session storage
- **Socket.io** for real-time communication
- **Multer** for file uploads
- **Sharp** for image processing
- **Nodemailer** for email notifications
- **Cron** for scheduled jobs
- **JWT** for authentication

### Frontend
- **React** with functional components and hooks
- **Tailwind CSS** for styling
- **Axios** for API communication
- **Socket.io-client** for real-time updates
- **Custom hooks** for state management

### DevOps
- **Docker** for containerization
- **Docker Compose** for service orchestration
- **Swagger** for API documentation

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- Docker and Docker Compose
- MongoDB (or use Docker)
- Redis (or use Docker)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd IndiaNIC
   ```

2. **Start all services with Docker**
   ```bash
   docker-compose up -d
   ```

3. **Or run services individually**
   ```bash
   # Install dependencies
   npm install
   cd auth-service && npm install
   cd ../task-service && npm install
   cd ../gateway && npm install
   cd ../frontend && npm install

   # Start services (in separate terminals)
   npm run dev:auth
   npm run dev:task
   npm run dev:gateway
   npm run dev:frontend
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Gateway API: http://localhost:5050
   - Auth Service: http://localhost:5001
   - Task Service: http://localhost:5002
   - Swagger Docs: http://localhost:5050/api-docs

## 📋 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update user profile
- `POST /auth/logout` - User logout

### Tasks
- `GET /tasks` - Get all tasks
- `POST /tasks` - Create new task
- `GET /tasks/:id` - Get specific task
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task
- `GET /tasks/export/csv` - Export tasks to CSV

## 🎯 DRY Principles Implementation

### Backend
- **Shared Middleware**: Authentication, validation, and error handling
- **Service Layer**: Reusable business logic
- **Utility Functions**: Common operations like file handling and email
- **Configuration**: Centralized environment and database configs

### Frontend
- **Custom Hooks**: `useTasks`, `useTaskSocket` for state management
- **Service Layer**: `taskService.js` for API communication
- **Reusable Components**: `TaskForm`, `TaskList`, `TaskCard`
- **Utility Functions**: Date formatting, validation, status management

### Key DRY Benefits
- ✅ **Single Source of Truth**: Centralized API calls and state management
- ✅ **Reusable Components**: TaskForm works for both create and edit
- ✅ **Consistent Error Handling**: Standardized error management across services
- ✅ **Shared Utilities**: Common functions for validation, formatting, etc.
- ✅ **Modular Architecture**: Each service has a specific responsibility

## 🔧 Configuration

### Environment Variables

Create `.env` files in each service directory:

**Gateway (.env)**
```
PORT=5050
AUTH_SERVICE_URL=http://localhost:5001
TASK_SERVICE_URL=http://localhost:5002
```

**Auth Service (.env)**
```
PORT=5001
MONGODB_URI=mongodb://localhost:27017/taskmanager
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
```

**Task Service (.env)**
```
PORT=5002
MONGODB_URI=mongodb://localhost:27017/taskmanager
REDIS_URL=redis://localhost:6379
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## 🧪 Testing

```bash
# Run backend tests
cd auth-service && npm test
cd ../task-service && npm test

# Run frontend tests
cd ../frontend && npm test
```

## 📦 Deployment

### Docker Deployment
```bash
# Build and start all services
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Considerations
- Use environment variables for sensitive data
- Set up proper SSL/TLS certificates
- Configure production databases
- Set up monitoring and logging
- Implement rate limiting
- Use CDN for static assets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following DRY principles
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation at `/api-docs`
- Review the service logs for debugging

---

**Built with ❤️ using MERN Stack and Microservices Architecture**
