const db = require('../database');

// Subscription tier limits
const TIER_LIMITS = {
  free: {
    bank_accounts: 2,
    credit_cards: 2,
    expenses_per_month: 50,
    income_per_month: 5,
    goals: 1,
    bills: 3,
    stocks: 0, // Premium only
    recurring_transactions: 0 // Premium only
  },
  premium: {
    bank_accounts: Infinity,
    credit_cards: Infinity,
    expenses_per_month: Infinity,
    income_per_month: Infinity,
    goals: Infinity,
    bills: Infinity,
    stocks: Infinity,
    recurring_transactions: Infinity
  }
};

// Check if user has access to a feature
const hasFeature = (user, feature) => {
  if (!user) return false;
  
  const tier = user.subscription_tier || 'free';
  const status = user.subscription_status || 'active';
  
  // Check if subscription is active
  if (status !== 'active') return false;
  
  // Premium users have all features
  if (tier === 'premium') {
    // Check if subscription hasn't expired
    if (user.subscription_expires_at) {
      const expiresAt = new Date(user.subscription_expires_at);
      if (expiresAt < new Date()) return false;
    }
    return true;
  }
  
  // Free tier feature check
  const freeFeatures = [
    'dashboard',
    'bank_accounts',
    'credit_cards',
    'expenses',
    'income',
    'savings',
    'goals',
    'bills',
    'export_csv'
  ];
  
  return freeFeatures.includes(feature);
};

// Check usage limit for a specific resource
const checkLimit = async (userId, resourceType) => {
  try {
    // Get user subscription info
    const users = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (!users || users.length === 0) {
      return { allowed: false, error: 'User not found' };
    }
    
    const user = users[0];
    const tier = user.subscription_tier || 'free';
    const limit = TIER_LIMITS[tier]?.[resourceType];
    
    // Premium users have unlimited
    if (limit === Infinity) {
      return { allowed: true, current: 0, limit: Infinity, remaining: Infinity };
    }
    
    // Get current usage
    let current = 0;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    
    switch (resourceType) {
      case 'bank_accounts':
        const accounts = await db.query('SELECT COUNT(*) as count FROM bank_accounts WHERE user_id = ?', [userId]);
        // SQLite COUNT returns as object with count property (may be string or number)
        current = Number(accounts[0]?.count) || 0;
        console.log('Bank accounts count check:', { userId, accounts, current, limit });
        break;
        
      case 'credit_cards':
        const cards = await db.query('SELECT COUNT(*) as count FROM credit_cards WHERE user_id = ?', [userId]);
        current = Number(cards[0]?.count) || 0;
        console.log('Credit cards count check:', { userId, cards, current, limit });
        break;
        
      case 'expenses_per_month':
        const expenses = await db.query(
          'SELECT COUNT(*) as count FROM expenses WHERE user_id = ? AND date >= ? AND date <= ?',
          [userId, monthStart, monthEnd]
        );
        current = Number(expenses[0]?.count) || 0;
        break;
        
      case 'income_per_month':
        const income = await db.query(
          'SELECT COUNT(*) as count FROM income WHERE user_id = ? AND date >= ? AND date <= ?',
          [userId, monthStart, monthEnd]
        );
        current = Number(income[0]?.count) || 0;
        break;
        
      case 'goals':
        const goals = await db.query('SELECT COUNT(*) as count FROM financial_goals WHERE user_id = ?', [userId]);
        current = Number(goals[0]?.count) || 0;
        break;
        
      case 'bills':
        const bills = await db.query('SELECT COUNT(*) as count FROM bill_reminders WHERE user_id = ?', [userId]);
        current = Number(bills[0]?.count) || 0;
        break;
        
      default:
        return { allowed: false, error: 'Unknown resource type' };
    }
    
    const allowed = current < limit;
    const remaining = Math.max(0, limit - current);
    
    return {
      allowed,
      current,
      limit,
      remaining,
      tier,
      percentage: limit > 0 ? Math.round((current / limit) * 100) : 0
    };
    
  } catch (error) {
    console.error('Error checking limit:', error);
    return { allowed: false, error: error.message };
  }
};

// Middleware to check subscription tier
const requireTier = (requiredTier = 'free') => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const users = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
      if (!users || users.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const user = users[0];
      const userTier = user.subscription_tier || 'free';
      
      if (requiredTier === 'premium' && userTier !== 'premium') {
        return res.status(403).json({
          error: 'Premium feature',
          message: 'This feature requires a Premium subscription',
          upgradeUrl: '/upgrade',
          tier: userTier
        });
      }
      
      // Check if premium subscription is still valid
      if (userTier === 'premium' && user.subscription_expires_at) {
        const expiresAt = new Date(user.subscription_expires_at);
        if (expiresAt < new Date()) {
          // Subscription expired, downgrade to free
          await db.run(
            'UPDATE users SET subscription_tier = ?, subscription_status = ? WHERE id = ?',
            ['free', 'expired', userId]
          );
          return res.status(403).json({
            error: 'Subscription expired',
            message: 'Your Premium subscription has expired. Please renew to continue using Premium features.',
            upgradeUrl: '/upgrade'
          });
        }
      }
      
      req.userSubscription = user;
      next();
    } catch (error) {
      console.error('Subscription check error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

// Middleware to check feature access
const requireFeature = (feature) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const users = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
      if (!users || users.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const user = users[0];
      
      if (!hasFeature(user, feature)) {
        return res.status(403).json({
          error: 'Feature not available',
          message: `This feature is not available in your current plan`,
          feature,
          tier: user.subscription_tier || 'free',
          upgradeUrl: '/upgrade'
        });
      }
      
      req.userSubscription = user;
      next();
    } catch (error) {
      console.error('Feature check error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

module.exports = {
  TIER_LIMITS,
  hasFeature,
  checkLimit,
  requireTier,
  requireFeature
};

