const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { errorHandler } = require('./middleware/errorHandler');
const { initializeDb } = require('./database/connection');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());
app.use(morgan('dev'));

// Attach DB initializer to app for use in server.js
app.initializeDb = initializeDb;

app.use('/api/dashboard',  require('./routes/dashboardRoutes'));
app.use('/api/components', require('./routes/componentRoutes'));
app.use('/api/bicycles',   require('./routes/bicycleRoutes'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found', code: 'NOT_FOUND' });
});

app.use(errorHandler);

module.exports = app;
