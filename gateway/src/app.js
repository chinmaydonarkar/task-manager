const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const axios = require('axios');
const multer = require('multer');
const swaggerDocument = require('../swagger.json');
require('dotenv').config();
const auth = require('./middlewares/auth');

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  }
});

const app = express();

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'Cache-Control', 'Pragma']
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
    if (req.file || req.files) {
      console.log('Gateway: Processing file upload');
      
      // Create FormData for file upload
      const FormData = require('form-data');
      const formData = new FormData();
      
      // Handle single file (avatar) or multiple files (tasks)
      if (req.file) {
        console.log('File info:', {
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size
        });
        formData.append('avatar', req.file.buffer, {
          filename: req.file.originalname,
          contentType: req.file.mimetype
        });
      } else if (req.files) {
        console.log('Multiple files:', req.files.length);
        req.files.forEach(file => {
          formData.append('files', file.buffer, {
            filename: file.originalname,
            contentType: file.mimetype
          });
        });
      }
      
      // Add other form fields
      Object.keys(req.body).forEach(key => {
        formData.append(key, req.body[key]);
      });
      
      data = formData;
      // Don't set Content-Type header, let FormData set it with boundary
      delete headers['Content-Type'];
      // Also remove other headers that might interfere
      delete headers['content-length'];
      delete headers['Content-Length'];
    } else {
      data = req.body;
    }
    
    console.log('Gateway: Forwarding to:', url);
    
    // Check if this is a CSV download request
    const isCSVDownload = req.originalUrl.includes('/export/csv');
    
    const response = await axios({ 
      url, 
      method, 
      headers, 
      data, 
      responseType: isCSVDownload ? 'arraybuffer' : 'json',
      validateStatus: function (status) {
        return status >= 200 && status < 500; // Accept all 2xx, 3xx, and 4xx status codes
      }
    });
    console.log('Gateway: Response status:', response.status);
    
    // Handle CSV download response
    if (isCSVDownload) {
      // Forward the CSV headers
      res.set('Content-Type', response.headers['content-type']);
      res.set('Content-Disposition', response.headers['content-disposition']);
      res.send(response.data);
    } else {
      res.status(response.status).json(response.data);
    }
  } catch (err) {
    console.error('Gateway error:', err.message);
    if (err.response) {
      console.error('Response error:', err.response.status, err.response.data);
      res.status(err.response.status).json(err.response.data);
    } else {
      res.status(500).json({ message: 'Gateway error', error: err.message });
    }
  }
};

// Public auth routes
app.post('/api/auth/register', proxy(AUTH_SERVICE_URL, '/api/auth/register'));
app.post('/api/auth/login', proxy(AUTH_SERVICE_URL, '/api/auth/login'));
app.get('/api/auth/health', proxy(AUTH_SERVICE_URL, '/api/auth/health'));

// Protected auth routes
app.get('/api/auth/me', auth, proxy(AUTH_SERVICE_URL, '/api/auth/me'));
app.get('/api/auth/profile', auth, proxy(AUTH_SERVICE_URL, '/api/auth/profile'));
app.put('/api/auth/profile', auth, proxy(AUTH_SERVICE_URL, '/api/auth/profile'));
app.post('/api/auth/profile/avatar', auth, upload.single('avatar'), proxy(AUTH_SERVICE_URL, '/api/auth/profile/avatar'));
app.put('/api/auth/profile/password', auth, proxy(AUTH_SERVICE_URL, '/api/auth/profile/password'));
app.post('/api/auth/logout', auth, proxy(AUTH_SERVICE_URL, '/api/auth/logout'));
app.post('/api/auth/logout-all', auth, proxy(AUTH_SERVICE_URL, '/api/auth/logout-all'));

// Proxy /api/tasks routes to task-service (all require auth)
app.post('/api/tasks', auth, upload.array('files'), proxy(TASK_SERVICE_URL, '/api/tasks'));
app.put('/api/tasks/:id', auth, upload.array('files'), proxy(TASK_SERVICE_URL, '/api/tasks'));

// Cron job management endpoints (no auth required for internal monitoring)
app.get('/api/tasks/cron/stats', proxy(TASK_SERVICE_URL, '/api/tasks/cron/stats'));
app.post('/api/tasks/cron/trigger', proxy(TASK_SERVICE_URL, '/api/tasks/cron/trigger'));
app.get('/api/tasks/cron/reminders/today', proxy(TASK_SERVICE_URL, '/api/tasks/cron/reminders/today'));

app.use('/api/tasks', auth, proxy(TASK_SERVICE_URL, '/api/tasks'));

module.exports = app; 