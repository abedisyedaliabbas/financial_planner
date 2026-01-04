const jwt = require('jsonwebtoken');
const db = require('../database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    // Skip auth for health check and most auth routes
    // But allow /auth/complete-profile to require auth
    if (req.path === '/health' || (req.path.startsWith('/auth/') && !req.path.includes('/complete-profile'))) {
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || !decoded.id) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Ensure decoded.id is a number/string, not an object
    const userId = typeof decoded.id === 'object' ? decoded.id.id : decoded.id;
    
    // Get user from database
    const users = await db.query('SELECT id, email, name, country, default_currency, subscription_tier, subscription_status FROM users WHERE id = ?', [userId]);
    
    if (!users || users.length === 0) {
      console.error(`❌ Authentication failed: User ID ${userId} (type: ${typeof userId}) not found in database`);
      console.error('Decoded token:', JSON.stringify(decoded, null, 2));
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = users[0];
    // Log authentication for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔐 Authenticated user: ${req.user.email} (ID: ${req.user.id})`);
    }
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  generateToken,
  verifyToken,
  authenticate
};

