# 🚂 Railway Backend Deployment - Quick Reference

## 🎯 Your Generated JWT Secret

I've generated a secure JWT secret for you. **Copy this**:

```
Cs/e7x12SollRyhSfv+6gn3UOBm2hiWtQ6Ko+MX4kfs=
```

**⚠️ Keep this secret safe!** You'll need it for Railway environment variables.

**⚠️ Keep this secret safe!** You'll need it for Railway environment variables.

---

## 📋 Step-by-Step Instructions

### 1. Sign Up for Railway

1. Go to: **https://railway.app**
2. Click **"Start a New Project"**
3. Click **"Login with GitHub"**
4. Authorize Railway to access your GitHub
5. You'll see the Railway dashboard

---

### 2. Deploy from GitHub

1. Click **"New Project"** (top right)
2. Select **"Deploy from GitHub repo"**
3. Find and select: **`abedisyedaliabbas/financial_planner`**
4. Railway will auto-detect Node.js ✅
5. Click on the service that appears

---

### 3. Configure Settings

1. Click on your service
2. Go to **Settings** tab
3. Find **Root Directory**:
   - Click **"Edit"**
   - Change to: `server`
   - Click **"Save"**

4. **Start Command** (should auto-detect):
   - Should be: `node index.js`
   - If not, set it manually

---

### 4. Add Environment Variables

1. In Railway, go to **Variables** tab
2. Click **"New Variable"** for each:

#### Variable 1: NODE_ENV
- **Name**: `NODE_ENV`
- **Value**: `production`

#### Variable 2: PORT
- **Name**: `PORT`
- **Value**: `5001`

#### Variable 3: JWT_SECRET
- **Name**: `JWT_SECRET`
- **Value**: `[Use the generated secret from terminal]`

#### Variable 4: FRONTEND_URL
- **Name**: `FRONTEND_URL`
- **Value**: `https://your-app.vercel.app` (we'll update this after deploying frontend)
- **Note**: For now, use a placeholder or leave it

#### Variable 5: STRIPE_SECRET_KEY
- **Name**: `STRIPE_SECRET_KEY`
- **Value**: `sk_live_...` (get from Stripe Dashboard → Developers → API keys → Live mode)
- **Note**: If you don't have live keys yet, use a placeholder for now

#### Variable 6: STRIPE_WEBHOOK_SECRET
- **Name**: `STRIPE_WEBHOOK_SECRET`
- **Value**: `whsec_...` (we'll set this up in Step 4)
- **Note**: Leave empty or use placeholder for now

---

### 5. Get Your Backend URL

1. Railway will automatically generate a URL
2. Go to **Settings** → **Domains**
3. You'll see a URL like: `https://your-app.railway.app`
4. **COPY THIS URL** - you'll need it for frontend!

---

### 6. Verify Deployment

1. Go to **Deployments** tab
2. Wait for deployment to complete (green checkmark ✅)
3. Click on the deployment
4. Check **Logs** - should see:
   ```
   🚀 Financial Planner API running on port 5001
   ✅ Server ready!
   ```

5. Test health check:
   - Visit: `https://your-app.railway.app/health`
   - Should see: `{"status":"ok","message":"Financial Planner API is running"}`

---

## ✅ Checklist

- [ ] Railway account created
- [ ] Repository connected
- [ ] Root directory set to `server`
- [ ] All 6 environment variables added
- [ ] Deployment successful (green checkmark)
- [ ] Health check works
- [ ] Backend URL copied

---

## 🆘 Troubleshooting

### "Deployment Failed"
- Check **Logs** tab for errors
- Verify Root Directory is exactly `server`
- Check all environment variables are set

### "Health Check Not Working"
- Wait 2-3 minutes for deployment
- Check logs for errors
- Verify PORT is `5001`

### "Can't Find Variables Tab"
- Make sure you clicked on the **service** (not the project)
- Look for "Variables" in the Settings tab

### "Module not found" errors
- Check Root Directory is `server`
- Verify `package.json` is in the `server` directory
- Check logs for specific missing modules

---

## 🎉 Next Steps

Once your backend is deployed and health check works:

1. **Copy your Railway URL** (e.g., `https://your-app.railway.app`)
2. **Proceed to Step 3**: Deploy Frontend to Vercel
3. You'll use the Railway URL in Vercel's environment variables

---

## 📝 Quick Commands Reference

```bash
# Generate new JWT secret (if needed)
openssl rand -base64 32

# Check Railway logs (via Railway dashboard)
# Go to: Deployments → Click deployment → Logs
```

---

**Ready? Let's deploy your backend! 🚀**

