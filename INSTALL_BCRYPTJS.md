# 🔧 Install bcryptjs - Quick Fix

## Problem
Server is crashing with: `Error: Cannot find module 'bcryptjs'`

## Solution

**Run these commands in your terminal:**

```bash
cd financial-planner-public/server
npm install bcryptjs
```

Then restart the server:
```bash
cd ..
npm run dev
```

That's it! The code is already updated to use `bcryptjs` instead of `bcrypt`.


