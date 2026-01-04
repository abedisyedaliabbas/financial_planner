# 🚀 Step-by-Step Deployment Guide

Follow these steps carefully to deploy your financial planner app.

---

## 📋 Pre-Deployment Checklist

Before starting, make sure:
- [ ] All features tested and working
- [ ] No critical bugs
- [ ] Code committed to Git
- [ ] Stripe account activated (for payments)
- [ ] Domain name ready (optional)

---

## Step 1: Prepare Your Code for Production

### 1.1 Commit All Changes

```bash
# Make sure you're in the project directory
cd /Users/abedi_dr/Library/CloudStorage/Dropbox/Website_Data/Budget_Abedi/financial-planner-public

# Check what files have changed
git status

# Add all changes
git add .

# Commit with a message
git commit -m "Ready for production deployment"

# If you haven't set up a remote repository yet, do it now:
# git remote add origin https://github.com/yourusername/financial-planner.git
# git push -u origin main
```

### 1.2 Create Production Environment Files

**Backend** (`server/.env.production`):
```env
NODE_ENV=production
PORT=5001
JWT_SECRET=your-super-secret-production-key-min-32-characters
FRONTEND_URL=https://your-frontend-domain.vercel.app
STRIPE_SECRET_KEY=sk_live_...  # Your LIVE Stripe key
STRIPE_WEBHOOK_SECRET=whsec_...  # Production webhook secret
```

**Frontend** (will be set in hosting platform):
```env
REACT_APP_API_URL=https://your-backend-domain.railway.app/api
REACT_APP_STRIPE_PRICE_MONTHLY=price_...  # LIVE monthly price ID
REACT_APP_STRIPE_PRICE_YEARLY=price_...   # LIVE yearly price ID
```

---

## Step 2: Set Up GitHub Repository

### 2.1 Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `financial-planner` (or your choice)
3. Description: "Personal Financial Planning and Expense Tracking App"
4. Set to **Public** or **Private** (your choice)
5. **Don't** initialize with README (we already have one)
6. Click "Create repository"

### 2.2 Push Your Code

```bash
# If you haven't initialized git yet:
git init
git add .
git commit -m "Initial commit - ready for production"

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/financial-planner.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy Backend to Railway

### 3.1 Sign Up for Railway

1. Go to https://railway.app
2. Click "Start a New Project"
3. Sign up with GitHub (recommended)
4. Authorize Railway to access your GitHub

### 3.2 Deploy Your Backend

1. In Railway dashboard, click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your `financial-planner` repository
4. Railway will detect Node.js automatically

### 3.3 Configure Backend Settings

1. Click on your service
2. Go to **Settings** tab
3. Set **Root Directory** to: `server`
4. Set **Start Command** to: `node index.js`

### 3.4 Add Environment Variables

In Railway, go to **Variables** tab and add:

```env
NODE_ENV=production
PORT=5001
JWT_SECRET=your-super-secret-key-change-this-min-32-chars
FRONTEND_URL=https://your-app.vercel.app
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**To generate a secure JWT_SECRET:**
```bash
# Run this in terminal:
openssl rand -base64 32
```

### 3.5 Get Your Backend URL

1. Railway will automatically generate a URL
2. Go to **Settings** → **Domains**
3. Copy the generated URL (e.g., `https://your-app.railway.app`)
4. **Save this URL** - you'll need it for frontend!

---

## Step 4: Deploy Frontend to Vercel

### 4.1 Sign Up for Vercel

1. Go to https://vercel.com
2. Click "Sign Up"
3. Sign up with GitHub (recommended)
4. Authorize Vercel to access your GitHub

### 4.2 Deploy Your Frontend

1. In Vercel dashboard, click "Add New Project"
2. Import your `financial-planner` repository
3. Configure project:
   - **Framework Preset**: Create React App
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

### 4.3 Add Environment Variables

In Vercel, go to **Settings** → **Environment Variables** and add:

```env
REACT_APP_API_URL=https://your-app.railway.app/api
REACT_APP_STRIPE_PRICE_MONTHLY=price_...  # LIVE price ID
REACT_APP_STRIPE_PRICE_YEARLY=price_...   # LIVE price ID
```

**Important**: Replace `your-app.railway.app` with your actual Railway URL!

### 4.4 Deploy

1. Click "Deploy"
2. Wait for build to complete (2-3 minutes)
3. Vercel will give you a URL like: `https://your-app.vercel.app`
4. **Save this URL** - this is your live app!

---

## Step 5: Update Backend CORS

### 5.1 Update Frontend URL in Railway

1. Go back to Railway
2. Go to **Variables**
3. Update `FRONTEND_URL` to your Vercel URL:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
4. Railway will automatically redeploy

### 5.2 Verify CORS

Your backend should now accept requests from your Vercel domain.

---

## Step 6: Set Up Stripe Live Mode

### 6.1 Activate Stripe Account

1. Go to https://dashboard.stripe.com
2. Complete business verification (if required)
3. Switch to **Live Mode** (toggle in top right)

### 6.2 Create Live Products

1. Go to **Products** in Stripe dashboard
2. Click "Add Product"
3. Name: "Financial Planner Premium"
4. Add prices:
   - **Monthly**: $9.99/month (recurring)
   - **Yearly**: $99/year (recurring)
5. Copy the **LIVE Price IDs** (start with `price_...`)

### 6.3 Update Environment Variables

1. Go to Vercel → **Settings** → **Environment Variables**
2. Update:
   ```
   REACT_APP_STRIPE_PRICE_MONTHLY=price_...  # LIVE monthly price ID
   REACT_APP_STRIPE_PRICE_YEARLY=price_...   # LIVE yearly price ID
   ```
3. Redeploy frontend (Vercel will auto-redeploy)

### 6.4 Set Up Production Webhook

1. In Stripe dashboard, go to **Developers** → **Webhooks**
2. Click "Add endpoint"
3. Endpoint URL: `https://your-app.railway.app/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Webhook Signing Secret** (starts with `whsec_...`)
6. Update in Railway:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### 6.5 Update Stripe Keys in Railway

1. In Stripe dashboard, go to **Developers** → **API keys**
2. Copy your **LIVE Secret Key** (starts with `sk_live_...`)
3. Update in Railway:
   ```
   STRIPE_SECRET_KEY=sk_live_...
   ```

---

## Step 7: Test Your Live App

### 7.1 Test Basic Functionality

1. Visit your Vercel URL
2. Register a new account
3. Login
4. Add a bank account
5. Add an expense
6. Check dashboard

### 7.2 Test Premium Features

1. Try to access Stocks (should show premium feature card)
2. Try to access Budget (should show premium feature card)
3. Click "Upgrade to Premium"
4. Test payment flow (use Stripe test card: `4242 4242 4242 4242`)

### 7.3 Test Payment (Real Card - Small Amount)

1. Use a real card with a small amount ($1)
2. Complete checkout
3. Verify subscription activates
4. Check Stripe dashboard for payment

---

## Step 8: Set Up Custom Domain (Optional)

### 8.1 Add Domain in Vercel

1. Go to Vercel → Your Project → **Settings** → **Domains**
2. Add your domain (e.g., `financialplanner.com`)
3. Follow DNS configuration instructions
4. Update CORS in Railway with new domain

### 8.2 Update Environment Variables

1. Update `FRONTEND_URL` in Railway to your custom domain
2. Update `REACT_APP_API_URL` in Vercel (if using custom domain for backend)

---

## Step 9: Monitor and Maintain

### 9.1 Set Up Monitoring

1. **Error Tracking**: Consider adding Sentry (free tier available)
2. **Uptime Monitoring**: Use UptimeRobot (free) or Pingdom
3. **Analytics**: Add Google Analytics or Plausible

### 9.2 Regular Tasks

- [ ] Monitor server logs in Railway
- [ ] Check Stripe dashboard for payments
- [ ] Review error logs weekly
- [ ] Backup database regularly
- [ ] Update dependencies monthly

---

## Step 10: Share Your App! 🎉

### 10.1 Test with Friends

1. Share your Vercel URL with a few friends
2. Get feedback
3. Fix any issues

### 10.2 Launch

1. Share on social media
2. Post in relevant communities
3. Start collecting users!

---

## 🆘 Troubleshooting

### Backend Not Starting
- Check Railway logs
- Verify environment variables
- Check PORT is set correctly

### Frontend Can't Connect to Backend
- Verify `REACT_APP_API_URL` in Vercel
- Check CORS settings in Railway
- Verify `FRONTEND_URL` in Railway matches Vercel URL

### Stripe Payments Not Working
- Verify you're using LIVE keys (not test)
- Check Price IDs are from live mode
- Verify webhook endpoint is accessible
- Check webhook secret is correct

### 429 Rate Limit Errors
- This shouldn't happen in production (limit is 200)
- If it does, check for infinite loops in frontend
- Review API call patterns

---

## 📊 Cost Estimate

### Free Tier (Starting)
- **Vercel**: Free (unlimited personal projects)
- **Railway**: $5/month free credit (usually enough)
- **Stripe**: Free (only pay per transaction: 2.9% + $0.30)
- **Total**: ~$0-5/month

### As You Grow
- **Railway**: ~$5-20/month (based on usage)
- **Vercel Pro**: $20/month (if needed for team)
- **Database**: Free tier usually sufficient

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Backend deployed to Railway
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured
- [ ] CORS updated
- [ ] Stripe live mode configured
- [ ] Webhook endpoint set up
- [ ] Tested registration
- [ ] Tested login
- [ ] Tested payment flow
- [ ] Custom domain configured (optional)
- [ ] Monitoring set up (optional)
- [ ] Ready to share!

---

## 🎯 Quick Reference

**Your URLs:**
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-app.railway.app`
- Stripe Dashboard: https://dashboard.stripe.com

**Important Files:**
- Backend env: Railway → Variables
- Frontend env: Vercel → Settings → Environment Variables
- Stripe keys: Stripe Dashboard → Developers → API keys

---

**You're ready to go live! Follow each step carefully. 🚀**

