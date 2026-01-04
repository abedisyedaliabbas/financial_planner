const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const protectedRoutes = require('./protected');
const stripeRoutes = require('./stripe');

// Export routes
module.exports = {
  auth: authRoutes,
  protected: protectedRoutes,
  stripe: stripeRoutes
};


