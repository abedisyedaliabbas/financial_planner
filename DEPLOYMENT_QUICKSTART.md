# ⚡ Quick Deployment Guide

## 🎯 Fastest Way to Go Live (30 minutes)

### Step 1: Push to GitHub (5 min)

```bash
# If not already a git repo
git init
git add .
git commit -m "Ready for production"
git branch -M main

# Create repo on GitHub, then:
git remote add origin https://github.com/yourusername/financial-planner.git
git push -u origin main
```

### Step 2: Deploy Backend to Railway (10 min)

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway auto-detects Node.js
6. Click on the service → Settings → Variables
7. Add these environment variables:

```env
NODE_ENV=production
PORT=5001
JWT_SECRET=your-super-secret-key-change-this
FRONTEND_URL=https://your-frontend.vercel.app
STRIPE_SECRET_KEY=sk_live_...  # Your LIVE Stripe key
STRIPE_WEBHOOK_SECRET=whsec_...  # Production webhook secret
```

8. Railway gives you a URL like: `https://your-app.railway.app`
9. Copy this URL!

### Step 3: Deploy Frontend to Vercel (10 min)

1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "New Project" → Import your repo
4. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Output Directory**: `build`
5. Add Environment Variables:
   ```
   REACT_APP_API_URL=https://your-app.railway.app/api
   REACT_APP_STRIPE_PRICE_MONTHLY=price_...  # LIVE price ID
   REACT_APP_STRIPE_PRICE_YEARLY=price_...    # LIVE price ID
   ```
6. Click "Deploy"
7. Vercel gives you a URL like: `https://your-app.vercel.app`

### Step 4: Update Backend CORS (2 min)

1. Go back to Railway
2. Update `FRONTEND_URL` to your Vercel URL
3. In Railway, edit `server/index.js` or set environment variable

Or update in code:
```javascript
// server/index.js
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://your-app.vercel.app',
  credentials: true
}));
```

### Step 5: Set Up Stripe Live Mode (5 min)

1. Go to https://dashboard.stripe.com
2. Switch to **Live mode** (top right toggle)
3. Create products (same as test mode)
4. Copy LIVE Price IDs
5. Update Vercel environment variables
6. Set up webhook:
   - URL: `https://your-app.railway.app/api/stripe/webhook`
   - Copy webhook secret to Railway

### Step 6: Test & Share! (3 min)

1. Visit your Vercel URL
2. Register a test account
3. Test payment flow
4. Share with friends! 🎉

---

## 🔗 Your URLs

- **Frontend**: https://your-app.vercel.app
- **Backend**: https://your-app.railway.app
- **Stripe Dashboard**: https://dashboard.stripe.com

---

## ✅ Quick Checklist

- [ ] Code pushed to GitHub
- [ ] Backend deployed to Railway
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set
- [ ] Stripe live mode configured
- [ ] CORS updated
- [ ] Tested registration
- [ ] Tested payment
- [ ] Ready to share!

---

## 💡 Pro Tips

1. **Start with free tiers** - Vercel and Railway have generous free tiers
2. **Use custom domain later** - Start with `.vercel.app` domain, add custom domain when ready
3. **Monitor costs** - Keep an eye on Railway usage
4. **Backup database** - Export SQLite file regularly or use PostgreSQL with backups
5. **Test with real card** - Use a small amount ($1) to test payment flow

---

## 🆘 Common Issues

**"Cannot connect to API"**
- Check `REACT_APP_API_URL` in Vercel matches Railway URL
- Verify backend is running in Railway dashboard

**"CORS Error"**
- Update `FRONTEND_URL` in Railway to match Vercel URL
- Redeploy backend

**"Stripe Error"**
- Make sure you're using LIVE keys (not test keys)
- Verify Price IDs are from live mode

---

**You're ready to go live! 🚀**

