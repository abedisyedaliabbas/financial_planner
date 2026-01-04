# Quick Setup: Turso (Serverless SQLite) for Vercel

## Why Turso?
✅ **Easiest migration** - Uses SQLite (same as your current setup)  
✅ **Minimal code changes** - Your existing SQL queries work as-is  
✅ **Free tier** - 500 databases, 1GB storage, 1 billion rows/month  
✅ **Persistent** - Data survives deployments  

## Step-by-Step Setup

### 1. Create Turso Database in Vercel

1. In Vercel Dashboard, go to your project
2. Click **"Storage"** tab
3. Click **"Turso"** → **"Create"** or **"Add Integration"**
4. Follow the setup wizard:
   - Create a new database (or link existing)
   - Name it: `financial-planner-db`
   - Choose a region close to you
5. After creation, you'll see:
   - **Database URL** (looks like: `libsql://your-db-name.turso.io`)
   - **Auth Token** (a long string)

### 2. Set Environment Variables in Vercel

1. Go to **Settings** → **Environment Variables**
2. Add these two variables:

   **Variable 1:**
   - Name: `TURSO_DATABASE_URL`
   - Value: (paste the Database URL from Turso)
   - Environment: Production, Preview, Development (select all)

   **Variable 2:**
   - Name: `TURSO_AUTH_TOKEN`
   - Value: (paste the Auth Token from Turso)
   - Environment: Production, Preview, Development (select all)

### 3. Install Turso Client

```bash
cd financial-planner-public/server
npm install @libsql/client
```

### 4. Update Your Database File

I've created `database.turso.js` for you. You have two options:

**Option A: Replace database.js (Recommended)**
```bash
# Backup your current database.js
mv server/database.js server/database.js.backup

# Use the Turso version
mv server/database.turso.js server/database.js
```

**Option B: Keep both and switch manually**
- The new file automatically detects if Turso is configured
- Falls back to local SQLite if Turso env vars are missing
- Works in both development and production

### 5. Test Locally (Optional)

1. Create `server/.env` file:
   ```
   TURSO_DATABASE_URL=libsql://your-db-name.turso.io
   TURSO_AUTH_TOKEN=your-auth-token-here
   ```

2. Restart your server:
   ```bash
   npm run dev
   ```

3. Check logs - you should see:
   ```
   📦 Using Turso (Serverless SQLite)
   ✅ Connected to Turso database
   ✅ Database tables created
   ```

### 6. Deploy to Vercel

1. Commit and push your changes:
   ```bash
   git add .
   git commit -m "Add Turso database support"
   git push origin main
   ```

2. Vercel will automatically deploy

3. Check deployment logs - you should see:
   ```
   📦 Using Turso (Serverless SQLite)
   ✅ Connected to Turso database
   ```

### 7. Verify It Works

1. Register a new user on your deployed app
2. Check if data persists after redeployment
3. Data should now survive deployments! 🎉

## Troubleshooting

### "Database not initialized" error
- Check that `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are set in Vercel
- Make sure you selected all environments (Production, Preview, Development)

### "Connection failed" error
- Verify your Turso database URL and token are correct
- Check Turso dashboard to ensure database is active

### Still using local SQLite?
- The code automatically falls back to local SQLite if Turso env vars are missing
- Check server logs to see which database is being used

## What Changed?

- ✅ Database now persists across deployments
- ✅ Same SQLite syntax (no query changes needed)
- ✅ Automatic fallback to local SQLite for development
- ✅ All your existing code works as-is

## Next Steps

1. ✅ Set up Turso in Vercel
2. ✅ Add environment variables
3. ✅ Install `@libsql/client`
4. ✅ Update database.js (or use database.turso.js)
5. ✅ Deploy and test

## Need Help?

- Turso Docs: https://docs.turso.tech
- Vercel Storage: https://vercel.com/docs/storage


