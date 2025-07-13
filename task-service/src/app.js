const express = require('express');
const connectDB = require('./config/db');
const taskRoutes = require('./routes/task');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const cronService = require('./services/cronService');
const logger = require('./utils/logger');
require('dotenv').config();

const app = express();
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/tasks', taskRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/health', (req, res) => res.json({ status: 'Task service running' }));

// Initialize cron service
try {
  cronService.startScheduler();
  logger.info('Cron service initialized successfully');
} catch (error) {
  logger.error('Failed to initialize cron service:', error);
}

module.exports = app; 