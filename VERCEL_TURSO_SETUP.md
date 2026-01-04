# Vercel + Turso Setup Guide

## ✅ Step 1: Add Environment Variables in Vercel

1. Go to your Vercel project dashboard: https://vercel.com/dashboard
2. Select your **financial-planner** project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

### Required Variables:

```
TURSO_DATABASE_URL=libsql://database-rose-car-vercel-icfg-sfxkoodhgvxlm5abuintbxsw.aws-us-east-1.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3Njc0MzEwODMsImlkIjoiNTQwODYyNWUtYTY1Zi00MTdhLTllZWQtYWUwMDM1OTUwZDcyIiwicmlkIjoiOGIwZTMxZjAtYjkzZS00ZTc3LTlmOWMtYzAwZDJiZWRjODgzIn0.GLaR9VLi_vWB-vWUOia5GpMZ3dj2barAdoxIJn8U4XAouewEeLzWLL4RHqLsTU7zNYNETk69V9F4l0YO_O30AQ
```

### Also Add Your Email Configuration:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FRONTEND_URL=https://financial-planner-blue-nine.vercel.app
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=production
```

**Important:** 
- Make sure to set these for **Production**, **Preview**, and **Development** environments (or at least Production)
- After adding variables, **redeploy** your application for changes to take effect

## ✅ Step 2: Redeploy Your Application

After adding the environment variables:

1. Go to **Deployments** tab in Vercel
2. Click the **"..."** menu on your latest deployment
3. Select **"Redeploy"**
4. Or push a new commit to trigger a new deployment

## ✅ Step 3: Verify Database Connection

After deployment, check your Vercel function logs:

1. Go to **Deployments** → Select your latest deployment
2. Click **"Functions"** tab
3. Check the logs - you should see:
   ```
   📦 Using Turso (Serverless SQLite)
   ✅ Connected to Turso database
   ✅ Database tables created
   ✅ Database initialization complete
   ```

## 🎉 That's It!

Your database will now persist across deployments. All user accounts, data, and emails will be stored in Turso and won't be lost when Vercel redeploys.

## 📝 Notes

- **Local Development**: If you don't set `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` locally, the app will automatically use local SQLite
- **Production**: With the environment variables set, it will automatically use Turso
- **No Code Changes Needed**: The database code automatically detects which database to use based on environment variables

## 🔍 Troubleshooting

If you see errors:

1. **"Failed to connect to Turso"**: 
   - Verify `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are set correctly in Vercel
   - Make sure you redeployed after adding the variables

2. **"Database not initialized"**:
   - Check Vercel function logs for detailed error messages
   - Ensure `@libsql/client` package is installed (it's in package.json)

3. **Still using local SQLite**:
   - Verify environment variables are set for the correct environment (Production/Preview)
   - Redeploy after adding variables

