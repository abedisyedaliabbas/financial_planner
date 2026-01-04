# 🔧 Fix bcrypt Native Module Error

## Problem
The server is crashing with:
```
Error: bcrypt_lib.node is not a valid Win32 application
```

This happens because `bcrypt` uses native modules that need to be compiled for your specific Node.js version and architecture.

## Solution
Replace `bcrypt` with `bcryptjs` - a pure JavaScript implementation that doesn't require native compilation.

## Steps to Fix

1. **Stop the server** (Ctrl+C if it's running)

2. **Navigate to server directory:**
   ```bash
   cd financial-planner-public/server
   ```

3. **Uninstall bcrypt and install bcryptjs:**
   ```bash
   npm uninstall bcrypt
   npm install bcryptjs
   ```

4. **The code has already been updated** to use `bcryptjs` instead of `bcrypt`

5. **Also fixed the proxy port** - changed from 5001 to 5000 in `client/package.json`

6. **Restart the server:**
   ```bash
   cd ..
   npm run dev
   ```

## What Changed

- ✅ `server/package.json` - Changed dependency from `bcrypt` to `bcryptjs`
- ✅ `server/routes/auth.js` - Changed `require('bcrypt')` to `require('bcryptjs')`
- ✅ `server/seed.js` - Changed `require('bcrypt')` to `require('bcryptjs')`
- ✅ `client/package.json` - Fixed proxy port from 5001 to 5000

## Why bcryptjs?

- ✅ Pure JavaScript - no native compilation needed
- ✅ Same API as bcrypt - drop-in replacement
- ✅ Works on all platforms (Windows, Mac, Linux)
- ✅ No architecture compatibility issues
- ⚠️ Slightly slower than bcrypt, but still secure and fast enough for this use case

## After Fixing

The server should start without errors and you should be able to:
- ✅ Register new users
- ✅ Login with existing users
- ✅ All password hashing will work correctly


