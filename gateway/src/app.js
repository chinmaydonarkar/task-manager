const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const axios = require('axios');
const swaggerDocument = require('../swagger.json');
require('dotenv').config();
const auth = require('./middlewares/auth');

const app = express();

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:3000',
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

// DRY proxy handler
const proxy = (targetUrl) => async (req, res) => {
  try {
    const url = `http://localhost:5001${targetUrl}${req.url}`;
    const method = req.method.toLowerCase();
    const headers = { ...req.headers };
    const data = req.body;
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
app.use('/api/auth/register', proxy('/api/auth/register'));
app.use('/api/auth/login', proxy('/api/auth/login'));

// Protected auth routes
app.use('/api/auth/profile', auth, proxy('/api/auth/profile'));
app.use('/api/auth/profile/avatar', auth, proxy('/api/auth/profile/avatar'));

// Proxy /api/tasks routes to task-service (all require auth)
app.use('/api/tasks', auth, async (req, res) => {
  try {
    const url = `http://localhost:5002/api/tasks${req.url}`;
    const method = req.method.toLowerCase();
    const headers = { ...req.headers };
    const data = req.body;
    const response = await axios({ url, method, headers, data, responseType: 'json' });
    res.status(response.status).json(response.data);
  } catch (err) {
    if (err.response) {
      res.status(err.response.status).json(err.response.data);
    } else {
      res.status(500).json({ message: 'Gateway error', error: err.message });
    }
  }
});

module.exports = app; 