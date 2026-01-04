# ⚠️ IMPORTANT: Database Persistence on Vercel

## The Problem

**Vercel uses an ephemeral filesystem**, which means:
- ❌ Files are **deleted** on every deployment
- ❌ The SQLite database (`server/financial_tracker.db`) is **reset** on each deployment
- ❌ User data is **lost** when you redeploy

## Current Status

Your database file is stored at:
```
server/financial_tracker.db
```

This file is **NOT** in git (it's in `.gitignore`), which is good for security, but means:
- It doesn't get deployed to Vercel
- Even if it did, Vercel would delete it on the next deployment

## Solutions

### Option 1: Use a Cloud Database (RECOMMENDED)

#### A. PostgreSQL on Vercel (Free Tier Available)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to "Storage" → "Create Database"
4. Choose "Postgres"
5. Update your code to use PostgreSQL instead of SQLite

#### B. Use Supabase (Free Tier)
1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Get connection string
4. Update database connection in your code

#### C. Use MongoDB Atlas (Free Tier)
1. Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get connection string
4. Update database connection

### Option 2: Use Vercel KV (Redis) for Session Storage
- Good for temporary data
- Not ideal for full database replacement

### Option 3: External File Storage (Not Recommended)
- Use AWS S3, Google Cloud Storage, etc.
- More complex setup
- Still need a database for queries

## Quick Fix: Check Email Configuration

Even if database persists, emails won't work without proper configuration:

1. **Set Environment Variables in Vercel:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add:
     ```
     SMTP_HOST=smtp.gmail.com
     SMTP_PORT=587
     SMTP_SECURE=false
     SMTP_USER=your-email@gmail.com
     SMTP_PASS=your-app-password
     FRONTEND_URL=https://your-app.vercel.app
     ```

2. **For Gmail:**
   - Enable 2-Step Verification
   - Generate App Password: https://myaccount.google.com/apppasswords
   - Use the App Password (not your regular password)

## Immediate Action Required

1. ✅ **Set up email environment variables in Vercel**
2. ⚠️ **Choose a cloud database solution** (PostgreSQL recommended)
3. ⚠️ **Update database code** to use cloud database instead of SQLite

## Testing Email Locally

To test if emails work locally:

1. Create `server/.env` file:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   FRONTEND_URL=http://localhost:3000
   ```

2. Restart your server
3. Check server logs for:
   ```
   ✅ Email service ready and verified
   ```

4. Try registering a new user
5. Check server logs for:
   ```
   📧 Attempting to send email to: user@example.com
   ✅ Email sent successfully
   ```

## Why You're Not Getting Emails

Most likely causes:
1. ❌ **SMTP credentials not set in Vercel** (environment variables)
2. ❌ **Email service not initialized** (check server logs)
3. ❌ **Gmail blocking** (need App Password, not regular password)
4. ❌ **Emails going to spam** (check spam folder)

## Next Steps

1. **Immediate**: Set email environment variables in Vercel
2. **Short-term**: Migrate to PostgreSQL or another cloud database
3. **Long-term**: Set up proper database backups and monitoring


