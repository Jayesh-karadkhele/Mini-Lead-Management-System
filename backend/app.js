const express = require('express');
const cors = require('cors');
require('dotenv').config();

const auditMiddleware = require('./middleware/auditMiddleware');
const errorHandler = require('./middleware/errorHandler');
const { authLimiter, apiLimiter } = require('./middleware/rateLimiter');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const authRoutes = require('./routes/authRoutes');
const leadRoutes = require('./routes/leadRoutes');
const activityRoutes = require('./routes/activityRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(auditMiddleware);

// Rate Limiting
app.use('/api/auth', authLimiter);
app.use('/api/leads', apiLimiter);
app.use('/api/activities', apiLimiter);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/activities', activityRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'Mini Lead Management System API is running' });
});

// Error handling
app.use(errorHandler);

module.exports = app;
