# Step 3: Deploy Frontend to Vercel

## 🎯 Goal: Get your frontend running live

---

## ✅ Task 3.1: Sign Up for Vercel

1. **Go to**: https://vercel.com
2. Click **"Sign Up"**
3. Click **"Continue with GitHub"** (recommended)
4. Authorize Vercel to access your GitHub account
5. You'll be redirected to Vercel dashboard

---

## ✅ Task 3.2: Deploy Your Frontend

1. In Vercel dashboard, click **"Add New Project"**
2. Find and select your `financial-planner` repository
3. Click **"Import"**

---

## ✅ Task 3.3: Configure Project Settings

Vercel will auto-detect React, but verify these settings:

1. **Framework Preset**: Create React App (should be auto-selected)
2. **Root Directory**: 
   - Click "Edit"
   - Change to: `client`
3. **Build Command**: 
   - Should be: `npm run build` (auto-filled)
   - If not, set to: `npm install && npm run build`
4. **Output Directory**: 
   - Should be: `build` (auto-filled)
5. **Install Command**: 
   - Should be: `npm install` (auto-filled)

---

## ✅ Task 3.4: Add Environment Variables

**Before clicking Deploy**, add environment variables:

1. Scroll down to **"Environment Variables"** section
2. Click **"Add"** for each variable:

### Variable 1:
- **Name**: `REACT_APP_API_URL`
- **Value**: `https://your-app.railway.app/api`
  - **Replace `your-app.railway.app` with your actual Railway URL!**
- **Environment**: Production, Preview, Development (check all)

### Variable 2:
- **Name**: `REACT_APP_STRIPE_PRICE_MONTHLY`
- **Value**: `price_...` (your LIVE monthly price ID from Stripe)
- **Note**: We'll set this up properly in Step 5. For now, use a placeholder or leave empty.
- **Environment**: Production, Preview, Development (check all)

### Variable 3:
- **Name**: `REACT_APP_STRIPE_PRICE_YEARLY`
- **Value**: `price_...` (your LIVE yearly price ID from Stripe)
- **Note**: We'll set this up properly in Step 5. For now, use a placeholder or leave empty.
- **Environment**: Production, Preview, Development (check all)

---

## ✅ Task 3.5: Deploy

1. Click **"Deploy"** button
2. Wait 2-3 minutes for build to complete
3. Watch the build logs (should see "Build successful" ✅)
4. Vercel will give you a URL like: `https://your-app.vercel.app`
5. **COPY THIS URL** - this is your live app!

---

## ✅ Task 3.6: Test Your Live Frontend

1. Visit your Vercel URL
2. You should see your app!
3. Try registering (might not work yet - backend CORS needs updating)

---

## ✅ Task 3.7: Update Backend CORS

1. Go back to Railway
2. Go to **Variables** tab
3. Find `FRONTEND_URL`
4. Update it to your Vercel URL:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
5. Railway will automatically redeploy

---

## ✅ Checklist

- [ ] Vercel account created
- [ ] Frontend deployed from GitHub
- [ ] Root directory set to `client`
- [ ] Environment variables added
- [ ] Frontend URL copied
- [ ] Backend CORS updated
- [ ] Can access live frontend

---

## 🎉 Step 3 Complete!

Your frontend is now live on Vercel!

**Next**: Go to `STEP_4_SETUP_STRIPE.md` to configure Stripe for payments.

---

## 🆘 Troubleshooting

### Build Failed
- Check build logs in Vercel
- Verify Root Directory is `client`
- Check for missing dependencies

### Can't Connect to Backend
- Verify `REACT_APP_API_URL` matches Railway URL exactly
- Check backend CORS is updated
- Wait a few minutes for Railway to redeploy

### Environment Variables Not Working
- Make sure you selected all environments (Production, Preview, Development)
- Redeploy after adding variables
- Check variable names are exactly: `REACT_APP_API_URL`, etc.

