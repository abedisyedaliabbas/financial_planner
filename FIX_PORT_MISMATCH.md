# 🔧 Fix Port Mismatch

## Problem
- Server is running on port **5001**
- Client proxy is trying to connect to port **5000**
- Result: `ECONNREFUSED` errors

## Solution

The proxy has been updated to port 5001. However, you need to **restart the React dev server** for the proxy change to take effect.

### Steps:

1. **Stop the current dev server** (Ctrl+C)

2. **Restart it:**
   ```bash
   npm run dev
   ```

3. **The proxy should now work!**

## Alternative: Change Server to Port 5000

If you prefer the server to run on port 5000 (the default), you can:

1. Check if there's a `.env` file in `server/` that sets `PORT=5001`
2. Either delete that line or change it to `PORT=5000`
3. Restart the server

The proxy is now set to **5001** to match your current server configuration.


