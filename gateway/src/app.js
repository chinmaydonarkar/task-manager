const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const axios = require('axios');
const multer = require('multer');
const swaggerDocument = require('../swagger.json');
require('dotenv').config();
const auth = require('./middlewares/auth');

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

const app = express();

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check
app.get('/health', (req, res) => res.json({ status: 'Gateway running' }));

// Service URLs from environment variables (for Docker/local flexibility)
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';
const TASK_SERVICE_URL = process.env.TASK_SERVICE_URL || 'http://localhost:5002';

// DRY proxy handler
const proxy = (serviceUrl, basePath) => async (req, res) => {
  try {
    // For auth routes, forward to the auth service with the correct path
    let targetPath;
    if (basePath.startsWith('/api/auth')) {
      // Extract the specific auth route (register, login, profile, etc.)
      const authRoute = req.originalUrl.replace('/api/auth', '');
      targetPath = `/api/auth${authRoute}`;
    } else {
      // For task routes, forward as-is
      targetPath = req.originalUrl;
    }
    
    const url = serviceUrl + targetPath;
    const method = req.method.toLowerCase();
    const headers = { ...req.headers };
    
    // Handle multipart form data for file uploads
    let data;
    if (req.file) {
      const formData = new FormData();
      formData.append('avatar', req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype
      });
      data = formData;
      headers['Content-Type'] = 'multipart/form-data';
    } else {
      data = req.body;
    }
    
    const response = await axios({ url, method, headers, data, responseType: 'json' });
    res.status(response.status).json(response.data);
  } catch (err) {
    if (err.response) {
      res.status(err.response.status).json(err.response.data);
    } else {
      res.status(500).json({ message: 'Gateway error', error: err.message });
    }
  }
};

// Public auth routes
app.post('/api/auth/register', proxy(AUTH_SERVICE_URL, '/api/auth/register'));
app.post('/api/auth/login', proxy(AUTH_SERVICE_URL, '/api/auth/login'));

// Protected auth routes
app.get('/api/auth/profile', auth, proxy(AUTH_SERVICE_URL, '/api/auth/profile'));
app.put('/api/auth/profile', auth, proxy(AUTH_SERVICE_URL, '/api/auth/profile'));
app.post('/api/auth/profile/avatar', auth, upload.single('avatar'), proxy(AUTH_SERVICE_URL, '/api/auth/profile/avatar'));

// Proxy /api/tasks routes to task-service (all require auth)
app.use('/api/tasks', auth, proxy(TASK_SERVICE_URL, '/api/tasks'));

module.exports = app; 