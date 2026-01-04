# Database Migration Guide for Vercel

## Quick Recommendation

**For easiest migration: Use Turso (Serverless SQLite)**
- ✅ Same SQLite syntax (minimal code changes)
- ✅ Free tier available
- ✅ Easy migration path

**For production robustness: Use Neon or Supabase (PostgreSQL)**
- ✅ More features and scalability
- ✅ Free tier available
- ⚠️ Requires more code changes

## Option 1: Turso (Serverless SQLite) - RECOMMENDED FOR EASY MIGRATION

### Why Turso?
- Uses SQLite (same as your current setup)
- Minimal code changes needed
- Free tier: 500 databases, 1GB storage, 1 billion rows read/month

### Setup Steps:

1. **Create Turso Database:**
   - In Vercel Storage page, click "Turso"
   - Click "Create" or "Add Integration"
   - Follow the setup wizard
   - You'll get a connection string

2. **Install Turso Client:**
   ```bash
   cd financial-planner-public/server
   npm install @libsql/client
   ```

3. **Update database.js:**
   - Replace SQLite3 with Turso client
   - Use connection string from Turso dashboard

4. **Set Environment Variables in Vercel:**
   ```
   TURSO_DATABASE_URL=libsql://your-database-url
   TURSO_AUTH_TOKEN=your-auth-token
   ```

## Option 2: Neon (Serverless PostgreSQL) - RECOMMENDED FOR PRODUCTION

### Why Neon?
- Fully managed PostgreSQL
- Free tier: 0.5GB storage, unlimited projects
- Better for production workloads

### Setup Steps:

1. **Create Neon Database:**
   - In Vercel Storage page, click "Neon"
   - Click "Create" or "Add Integration"
   - Follow the setup wizard
   - You'll get a connection string

2. **Install PostgreSQL Client:**
   ```bash
   cd financial-planner-public/server
   npm install pg
   ```

3. **Update database.js:**
   - Replace SQLite3 with PostgreSQL (pg)
   - Convert SQLite queries to PostgreSQL syntax
   - Update data types (INTEGER → SERIAL, TEXT → VARCHAR, etc.)

4. **Set Environment Variables in Vercel:**
   ```
   DATABASE_URL=postgresql://user:password@host/database
   ```

## Option 3: Supabase (PostgreSQL)

### Why Supabase?
- Full-featured PostgreSQL with additional features
- Free tier: 500MB database, 2GB bandwidth
- Includes authentication, storage, real-time features

### Setup Steps:

1. **Create Supabase Project:**
   - Go to supabase.com and create account
   - Create a new project
   - Get connection string from Settings → Database

2. **Install PostgreSQL Client:**
   ```bash
   cd financial-planner-public/server
   npm install pg
   ```

3. **Update database.js:**
   - Same as Neon (PostgreSQL migration)

4. **Set Environment Variables in Vercel:**
   ```
   DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
   ```

## Migration Checklist

### Before Migration:
- [ ] Backup your current database (if you have data)
- [ ] Choose your database provider
- [ ] Create database instance
- [ ] Get connection string/credentials

### During Migration:
- [ ] Install new database client library
- [ ] Update `server/database.js` to use new database
- [ ] Convert SQLite queries to new database syntax (if PostgreSQL)
- [ ] Update data types and schema
- [ ] Test locally with new database

### After Migration:
- [ ] Set environment variables in Vercel
- [ ] Deploy and test
- [ ] Verify data persistence across deployments
- [ ] Test email functionality

## Quick Start: Turso (Easiest)

1. **In Vercel Dashboard:**
   - Go to Storage → Turso
   - Click "Create" or "Add Integration"
   - Follow setup wizard

2. **Install Turso:**
   ```bash
   npm install @libsql/client
   ```

3. **Update database.js:**
   See the updated code below

4. **Set Environment Variables:**
   - `TURSO_DATABASE_URL` (from Turso dashboard)
   - `TURSO_AUTH_TOKEN` (from Turso dashboard)

## Code Changes Needed

### For Turso (Minimal Changes):
- Replace `sqlite3` with `@libsql/client`
- Update connection method
- Keep all SQL queries the same (SQLite compatible)

### For PostgreSQL (More Changes):
- Replace `sqlite3` with `pg`
- Update all SQL queries:
  - `INTEGER PRIMARY KEY AUTOINCREMENT` → `SERIAL PRIMARY KEY`
  - `TEXT` → `VARCHAR` or `TEXT`
  - `REAL` → `DECIMAL` or `NUMERIC`
  - `DATETIME` → `TIMESTAMP`
  - Remove `IF NOT EXISTS` in some cases
- Update query syntax (parameterized queries work similarly)

## Testing

After migration:
1. Test user registration
2. Test login
3. Test data persistence (redeploy and check if data remains)
4. Test all CRUD operations
5. Verify email functionality

## Need Help?

- Turso Docs: https://docs.turso.tech
- Neon Docs: https://neon.tech/docs
- Supabase Docs: https://supabase.com/docs


