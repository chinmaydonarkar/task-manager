# IndiaNIC Microservices MERN App

## Overview
This project is a fullstack MERN microservices application with the following modules:
- **API Gateway**: Central entry point, routing, authentication, Swagger docs
- **Auth Service**: User registration, login, JWT, Redis session, profile, image upload
- **Task Service**: Task CRUD, file upload, email notifications, CSV export, cron jobs, real-time updates
- **Frontend**: React app for user interaction

## Tech Stack
- Node.js, Express, MongoDB (Mongoose), ReactJS, JWT, Redis, Multer, Sharp, Socket.io, node-cron, json2csv, Swagger, Docker

## Running the App

1. **Build and start all services:**
   ```bash
   docker-compose up --build
   ```
2. **Access services:**
   - Gateway: http://localhost:5000/health
   - Auth Service: http://localhost:5001/health
   - Task Service: http://localhost:5002/health
   - Frontend: http://localhost:3000

## Development
- Each service is in its own folder with its own Dockerfile and dependencies.
- Use the health endpoints to verify each service is running.

---

Next steps: Implement authentication and gateway logic, then task service features.
