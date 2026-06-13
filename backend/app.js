const express = require('express');
const cors = require('cors');
require('dotenv').config();

const auditMiddleware = require('./middleware/auditMiddleware');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(auditMiddleware);

// Routes
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'Mini Lead Management System API is running' });
});

// Error handling
app.use(errorHandler);

module.exports = app;
