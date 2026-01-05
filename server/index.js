const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const db = require('./database');
const routes = require('./routes');
const { authenticate } = require('./middleware/auth');
const { initEmailService } = require('./utils/emailService');
const { bigIntSerializer } = require('./utils/bigIntSerializer');

const app = express();
const PORT = process.env.PORT || 5000;

// General rate limiting - More lenient for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 200 : 1000, // Higher limit for development
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  trustProxy: true, // Fix trust proxy error
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  }
});

// Stricter rate limiting for authentication endpoints (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 5 : 20, // Very strict: 5 attempts per 15 min in production
  message: 'Too many authentication attempts. Please try again in 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
  trustProxy: true, // Fix trust proxy error
});

// Apply strict rate limiting to auth routes
app.use('/api/auth', authLimiter);

// Apply general rate limiting to other API routes
app.use('/api', limiter);

// Trust proxy (required for Railway, Vercel, and other platforms behind proxies)
app.set('trust proxy', true);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serialize BigInt values in all JSON responses (fixes "do not know how to serialize a BigInt" error)
app.use(bigIntSerializer);

// Health check (no auth required)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Financial Planner API is running' });
});

// Email test endpoint (for debugging - outside /api to avoid auth middleware)
app.get('/test-email', async (req, res) => {
  try {
    const { sendEmail } = require('./utils/emailService');
    const testEmail = req.query.email || 'abedisyedaliabbas@gmail.com';
    
    console.log(`🧪 Test email requested for: ${testEmail}`);
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Email sending timeout after 15 seconds')), 15000)
    );
    
    const emailPromise = sendEmail(
      testEmail,
      'Test Email from Financial Planner',
      '<h1>Test Email</h1><p>If you receive this, email service is working!</p>',
      'Test Email - If you receive this, email service is working!'
    );
    
    const result = await Promise.race([emailPromise, timeoutPromise]);
    
    console.log(`🧪 Test email result:`, result);
    
    res.json({
      success: result.sent,
      message: result.sent ? 'Test email sent successfully' : 'Failed to send test email',
      error: result.error,
      email: testEmail,
      messageId: result.messageId
    });
  } catch (error) {
    console.error('🧪 Test email error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: error.message === 'Email sending timeout after 15 seconds' 
        ? 'Email sending timed out. Check Railway logs for SMTP connection issues.'
        : 'Failed to send test email',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Public routes (no auth required)
app.use('/api/auth', routes.auth);

// Stripe webhook (needs raw body, no auth, must be before bodyParser)
// Note: Webhook handler is exported separately from stripe routes
const stripeRoutes = require('./routes/stripe');
if (stripeRoutes && stripeRoutes.webhook) {
  app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), stripeRoutes.webhook);
}

// Protected routes (require authentication)
app.use('/api', authenticate, routes.protected);

// Stripe routes (require authentication)
app.use('/api/stripe', authenticate, routes.stripe);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message,
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Initialize database and start server
(async () => {
  try {
    await db.init();
    
    // Initialize email service
    initEmailService();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Financial Planner API running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
      console.log(`\n✅ Server ready!`);
    });
  } catch (err) {
    console.error('❌ Failed to initialize database:', err);
    process.exit(1);
  }
})();

