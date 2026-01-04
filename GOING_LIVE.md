# 🚀 Going Live - Deployment Guide

## 📋 Pre-Launch Checklist

### ✅ Before Going Live

- [ ] Test all features thoroughly
- [ ] Set up production database (PostgreSQL recommended)
- [ ] Configure production environment variables
- [ ] Set up Stripe live mode
- [ ] Choose hosting platform
- [ ] Set up domain name
- [ ] Configure SSL/HTTPS
- [ ] Set up error monitoring
- [ ] Create backup strategy
- [ ] Test payment flow with real cards

---

## 🌐 Hosting Options

### Option 1: Vercel (Frontend) + Railway/Render (Backend) ⭐ RECOMMENDED

**Why**: Easy setup, free tiers available, automatic SSL

#### Frontend (Vercel)
1. Push code to GitHub
2. Go to https://vercel.com
3. Import your repository
4. Set build command: `cd client && npm install && npm run build`
5. Set output directory: `client/build`
6. Add environment variables:
   - `REACT_APP_STRIPE_PRICE_MONTHLY` (live price ID)
   - `REACT_APP_STRIPE_PRICE_YEARLY` (live price ID)
7. Deploy!

#### Backend (Railway or Render)
1. Go to https://railway.app or https://render.com
2. Create new project
3. Connect GitHub repository
4. Set root directory: `server`
5. Add environment variables (see below)
6. Deploy!

### Option 2: Heroku (Full Stack)

1. Install Heroku CLI
2. Create `Procfile` for backend
3. Deploy frontend to Heroku with buildpack
4. Set environment variables
5. Deploy!

### Option 3: DigitalOcean / AWS / Google Cloud

More control, but requires more setup. Good for scaling later.

---

## 🔐 Production Environment Variables

### Backend (`server/.env`)

```env
# Server
PORT=5001
NODE_ENV=production
FRONTEND_URL=https://your-domain.com

# Database (Use PostgreSQL for production)
DATABASE_URL=postgresql://user:password@host:5432/dbname
# OR keep SQLite for small scale:
# (No DATABASE_URL needed, will use SQLite)

# JWT Secret (CHANGE THIS!)
JWT_SECRET=your-super-secret-production-jwt-key-min-32-characters-long

# Stripe (LIVE MODE)
STRIPE_SECRET_KEY=sk_live_...  # Your LIVE secret key
STRIPE_WEBHOOK_SECRET=whsec_...  # Production webhook secret
```

### Frontend (Set in hosting platform)

```env
REACT_APP_API_URL=https://your-api-domain.com/api
REACT_APP_STRIPE_PRICE_MONTHLY=price_...  # LIVE monthly price ID
REACT_APP_STRIPE_PRICE_YEARLY=price_...   # LIVE yearly price ID
```

---

## 💳 Stripe Live Mode Setup

### Step 1: Switch to Live Mode

1. Go to https://dashboard.stripe.com
2. Click "Activate account" (if not already activated)
3. Complete business verification
4. Switch to **Live mode** (toggle in top right)

### Step 2: Create Live Products

1. Go to https://dashboard.stripe.com/products
2. Create "Financial Planner Premium" product
3. Add prices:
   - Monthly: $9.99/month
   - Yearly: $99/year
4. Copy the **LIVE Price IDs** (start with `price_...`)

### Step 3: Set Up Production Webhooks

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. URL: `https://your-api-domain.com/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Webhook Signing Secret**

### Step 4: Update Environment Variables

Replace test keys with live keys in your production environment.

---

## 🗄️ Database Setup

### Option A: Keep SQLite (Simple, Good for Start)

**Pros**: No setup needed, works immediately  
**Cons**: Not ideal for multiple users, no backups

**For small scale** (friends & family), SQLite is fine!

### Option B: PostgreSQL (Recommended for Growth)

1. Sign up for free PostgreSQL:
   - **Railway**: Includes free PostgreSQL
   - **Supabase**: Free tier available
   - **ElephantSQL**: Free tier available

2. Get connection string:
   ```
   postgresql://user:password@host:5432/dbname
   ```

3. Update `server/database.js` to use PostgreSQL:
   - Install: `npm install pg`
   - Use connection string from environment

---

## 📝 Production Checklist

### Security
- [ ] Change `JWT_SECRET` to a strong random string (32+ characters)
- [ ] Use HTTPS everywhere (automatic with Vercel/Railway)
- [ ] Enable CORS only for your domain
- [ ] Set secure cookie flags (if using cookies)
- [ ] Review and remove any debug logging

### Performance
- [ ] Enable production builds (`npm run build`)
- [ ] Set up CDN for static assets (Vercel does this automatically)
- [ ] Enable database connection pooling (if using PostgreSQL)
- [ ] Set up caching headers

### Monitoring
- [ ] Set up error tracking (Sentry, LogRocket, etc.)
- [ ] Monitor server logs
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Track user signups and conversions

### Testing
- [ ] Test registration flow
- [ ] Test login flow
- [ ] Test payment flow with real card (small amount)
- [ ] Test all CRUD operations
- [ ] Test on mobile devices
- [ ] Test in different browsers

---

## 🚀 Quick Deploy Steps (Vercel + Railway)

### 1. Prepare Your Code

```bash
# Make sure everything is committed
git add .
git commit -m "Ready for production"
git push origin main
```

### 2. Deploy Frontend (Vercel)

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Output Directory**: `build`
4. Add environment variables:
   - `REACT_APP_STRIPE_PRICE_MONTHLY`
   - `REACT_APP_STRIPE_PRICE_YEARLY`
5. Deploy!

### 3. Deploy Backend (Railway)

1. Go to https://railway.app/new
2. Select "Deploy from GitHub repo"
3. Choose your repository
4. Set root directory: `server`
5. Add environment variables (see above)
6. Railway will auto-detect Node.js and deploy
7. Get your backend URL (e.g., `https://your-app.railway.app`)

### 4. Update Frontend API URL

In Vercel, add environment variable:
```
REACT_APP_API_URL=https://your-app.railway.app/api
```

### 5. Update CORS

In `server/index.js`, update:
```javascript
app.use(cors({
  origin: 'https://your-vercel-domain.vercel.app', // Your Vercel URL
  credentials: true
}));
```

---

## 🔒 Security Best Practices

1. **Never commit `.env` files** - Use hosting platform's environment variables
2. **Use strong JWT secret** - Generate with: `openssl rand -base64 32`
3. **Enable rate limiting** - Already configured in your code
4. **Use HTTPS** - Required for Stripe, automatic with Vercel/Railway
5. **Validate all inputs** - Already implemented
6. **Hash passwords** - Already using bcrypt
7. **Sanitize user inputs** - Add if handling user-generated content

---

## 📊 Post-Launch

### Week 1
- Monitor error logs daily
- Check Stripe dashboard for payments
- Gather user feedback
- Fix any critical bugs

### Month 1
- Analyze user signups
- Track conversion rate (free → premium)
- Optimize based on usage patterns
- Add requested features

### Ongoing
- Regular backups (if using SQLite, backup the `.db` file)
- Monitor server costs
- Update dependencies regularly
- Add new features based on feedback

---

## 🆘 Troubleshooting

### "CORS Error"
- Check `FRONTEND_URL` in backend matches your frontend domain
- Ensure CORS is configured correctly

### "Database Error"
- Check database connection string
- Verify database is accessible from hosting platform
- Check database logs

### "Stripe Payment Failed"
- Verify you're using LIVE keys (not test keys)
- Check Stripe dashboard for error details
- Verify webhook endpoint is accessible

### "Build Failed"
- Check build logs in hosting platform
- Verify all dependencies are in `package.json`
- Check for TypeScript/ESLint errors

---

## 💰 Cost Estimate

### Free Tier (Good for Starting)
- **Vercel**: Free (unlimited personal projects)
- **Railway**: $5/month free credit
- **Stripe**: Free (only pay per transaction: 2.9% + $0.30)
- **Domain**: ~$10-15/year (optional)

### Total: ~$5-15/month to start

### As You Grow
- Railway: ~$5-20/month (based on usage)
- Vercel Pro: $20/month (if needed)
- Database: Free tier usually sufficient

---

## 🎯 Next Steps

1. **Choose hosting** (Vercel + Railway recommended)
2. **Set up Stripe live mode**
3. **Deploy backend first** (get the URL)
4. **Deploy frontend** (point to backend URL)
5. **Test everything**
6. **Share with friends & family!**

---

## 📞 Need Help?

- Check hosting platform documentation
- Review Stripe documentation
- Test in staging environment first
- Start with a small group of beta testers

**Good luck with your launch! 🚀**

