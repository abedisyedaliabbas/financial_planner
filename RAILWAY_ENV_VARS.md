# Railway Environment Variables

Copy these to Railway Dashboard → Your Project → Variables:

```
PORT=5001
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
FRONTEND_URL=https://financial-planner-blue-nine.vercel.app

# Stripe
STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_TEST_SECRET_KEY_HERE

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=financialplanner514@gmail.com
SMTP_PASS=YOUR_SMTP_PASSWORD_HERE

# Database (Turso - if using)
TURSO_DATABASE_URL=libsql://your-database-url
TURSO_AUTH_TOKEN=your-turso-token
```

