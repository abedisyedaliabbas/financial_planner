# 🔄 Restart Instructions

## Issue
The proxy is correctly set to port 5001, but the React dev server needs to be restarted to pick up the change.

## Solution

**Stop the current dev server and restart it:**

1. **Press `Ctrl+C`** in the terminal where `npm run dev` is running
2. **Wait for it to fully stop**
3. **Run again:**
   ```bash
   npm run dev
   ```

The React dev server caches the proxy configuration, so it needs a full restart to connect to port 5001.

## Verification

After restarting, you should see:
- ✅ Server running on port 5001
- ✅ Client running on port 3000
- ✅ No more "ECONNREFUSED" errors
- ✅ Login/Registration should work

## If It Still Doesn't Work

If you still see proxy errors after restarting:

1. **Check the server is actually running on 5001:**
   - Look for: `🚀 Financial Planner API running on port 5001`

2. **Check the proxy setting:**
   - Open `client/package.json`
   - Verify: `"proxy": "http://localhost:5001"`

3. **Try accessing the API directly:**
   - Open: `http://localhost:5001/health`
   - Should return: `{"status":"ok","message":"Financial Planner API is running"}`


