# 🚀 Deployment Checklist

## Pre-Deployment Checklist

### ✅ Code Ready
- [x] Server starts successfully on port 5001
- [x] Client starts successfully on port 3000
- [x] Login/Registration works
- [x] Stripe integration fixed (handles missing API key gracefully)
- [x] Email service configured
- [x] Proxy configuration fixed (only /api requests proxied)

### 📝 Changes to Deploy
- Fixed Stripe integration (graceful error handling)
- Fixed proxy configuration (removed old proxy, added http-proxy-middleware)
- Server .env configured with all necessary variables

## Step 1: Commit Changes

```powershell
cd financial-planner-public
git add client/package.json server/routes/stripe.js client/src/setupProxy.js
git commit -m "Fix Stripe integration and proxy configuration for deployment"
```

## Step 2: Push to GitHub

**⚠️ IMPORTANT: Since we reset to an earlier commit, you need to force push:**

```powershell
git push --force origin main
```

**Warning:** This will overwrite the remote branch. Make sure this is what you want!

## Step 3: Environment Variables on Railway (Backend)

Go to Railway Dashboard → Your Project → Variables and ensure these are set:

### Required Variables:
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

# OR use Resend API (recommended for Railway)
# RESEND_API_KEY=re_xxxxxxxxxxxxx

# Database (if using Turso)
TURSO_DATABASE_URL=libsql://your-database-url
TURSO_AUTH_TOKEN=your-turso-token
```

## Step 4: Environment Variables on Vercel (Frontend)

Go to Vercel Dashboard → Your Project → Settings → Environment Variables:

### Required Variables:
```
REACT_APP_API_URL=https://your-railway-backend-url.up.railway.app/api
REACT_APP_BACKEND_PORT=5001
REACT_APP_STRIPE_PRICE_MONTHLY=price_1Sl93xEqeRDu4Pl7QnxNz3bp
REACT_APP_STRIPE_PRICE_YEARLY=price_1Sl97JEqeRDu4Pl7SvqZ9oCl
```

## Step 5: Verify Deployments

### Railway (Backend)
1. Check deployment logs for errors
2. Test health endpoint: `https://your-railway-url.up.railway.app/health`
3. Should return: `{"status":"ok","message":"Financial Planner API is running"}`

### Vercel (Frontend)
1. Check deployment logs
2. Visit your site: `https://financial-planner-blue-nine.vercel.app`
3. Test login/registration
4. Test email sending (check inbox)

## Step 6: Test Production Features

- [ ] User registration
- [ ] Email verification
- [ ] Welcome email
- [ ] Password reset email
- [ ] Login
- [ ] Stripe checkout (upgrade to premium)
- [ ] All financial pages load correctly

## Troubleshooting

### If emails don't work in production:
- Check Railway logs for SMTP connection errors
- Consider switching to Resend API (set `RESEND_API_KEY` in Railway)
- Verify SMTP credentials are correct

### If Stripe doesn't work:
- Verify `STRIPE_SECRET_KEY` is set in Railway
- Check that price IDs are correct in Vercel
- Test with Stripe test card: `4242 4242 4242 4242`

### If API connection fails:
- Verify `REACT_APP_API_URL` in Vercel points to Railway backend
- Check CORS settings in server
- Verify `FRONTEND_URL` in Railway matches Vercel URL

## Post-Deployment

After successful deployment:
1. Test all features in production
2. Monitor error logs on both platforms
3. Test email delivery
4. Test Stripe payments with test cards

