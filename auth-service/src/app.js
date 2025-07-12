const express = require('express');
const connectDB = require('./config/db');
const redis = require('./config/redis');
const authRoutes = require('./routes/auth');
const path = require('path');
require('dotenv').config();

const app = express();
connectDB();

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/auth', authRoutes);

app.get('/health', (req, res) => res.json({ status: 'Auth service running' }));

module.exports = app; 