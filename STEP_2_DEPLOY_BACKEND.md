# Step 2: Deploy Backend to Railway

## 🎯 Goal: Get your backend API running live

---

## ✅ Task 2.1: Sign Up for Railway

1. **Go to**: https://railway.app
2. Click **"Start a New Project"**
3. Click **"Login with GitHub"** (recommended)
4. Authorize Railway to access your GitHub account
5. You'll be redirected to Railway dashboard

---

## ✅ Task 2.2: Deploy Your Backend

1. In Railway dashboard, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your `financial-planner` repository
4. Railway will automatically detect Node.js ✅
5. Click on the service that was created

---

## ✅ Task 2.3: Configure Backend Settings

1. Click on your service
2. Go to **Settings** tab
3. Find **Root Directory**:
   - Set to: `server`
4. Find **Start Command** (if visible):
   - Should be: `node index.js` (usually auto-detected)

---

## ✅ Task 2.4: Add Environment Variables

1. In Railway, go to **Variables** tab
2. Click **"New Variable"** for each:

### Required Variables:

```env
NODE_ENV=production
```

```env
PORT=5001
```

```env
JWT_SECRET=your-super-secret-key-here
```

**Generate JWT_SECRET:**
```bash
# Run this in terminal:
openssl rand -base64 32
```

Copy the output and use it as `JWT_SECRET`

```env
FRONTEND_URL=https://your-app.vercel.app
```

**Note**: We'll update this after deploying frontend. For now, use a placeholder or leave it.

```env
STRIPE_SECRET_KEY=sk_live_...
```

**Get this from**: Stripe Dashboard → Developers → API keys → Live mode → Secret key

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Note**: We'll set this up after creating the webhook in Step 5. For now, leave it empty or use a placeholder.

---

## ✅ Task 2.5: Get Your Backend URL

1. Railway automatically generates a URL
2. Go to **Settings** → **Domains**
3. You'll see a URL like: `https://your-app.railway.app`
4. **COPY THIS URL** - you'll need it for frontend!

---

## ✅ Task 2.6: Verify Backend is Running

1. Click on your service
2. Go to **Deployments** tab
3. Wait for deployment to complete (green checkmark ✅)
4. Click on the deployment
5. Check **Logs** - should see:
   ```
   🚀 Financial Planner API running on port 5001
   ✅ Server ready!
   ```

6. Test the health check:
   - Visit: `https://your-app.railway.app/health`
   - Should see: `{"status":"ok","message":"Financial Planner API is running"}`

---

## ✅ Checklist

- [ ] Railway account created
- [ ] Backend deployed from GitHub
- [ ] Root directory set to `server`
- [ ] Environment variables added
- [ ] Backend URL copied
- [ ] Health check works

---

## 🎉 Step 2 Complete!

Your backend is now live on Railway!

**Next**: Go to `STEP_3_DEPLOY_FRONTEND.md` to deploy your frontend to Vercel.

---

## 🆘 Troubleshooting

### Deployment Failed
- Check **Logs** in Railway
- Verify Root Directory is `server`
- Check environment variables are set

### Health Check Not Working
- Wait a few minutes for deployment to complete
- Check logs for errors
- Verify PORT is set correctly

### Can't Find Variables Tab
- Make sure you clicked on your service (not the project)
- Look for "Variables" or "Environment" in Settings

