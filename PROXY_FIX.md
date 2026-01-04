# Proxy Configuration Fix

## Problem
When refreshing the page, you see proxy errors for static files like:
- `/icon-192.png`
- `/static/css/main.css`
- `/static/js/main.js`

These errors occur because the proxy was trying to forward ALL requests (including static files) to the backend server.

## Solution
Created `client/src/setupProxy.js` to only proxy `/api` requests to the backend. Static files are now served directly by the React dev server.

## Configuration

### Default Setup
- Backend runs on: `http://localhost:5000` (default)
- Proxy only forwards `/api/*` requests

### If Your Server Runs on Port 5001
Create a `.env` file in the `client` directory:

```env
REACT_APP_BACKEND_URL=http://localhost:5001
```

Or set it when starting:
```bash
REACT_APP_BACKEND_URL=http://localhost:5001 npm start
```

## Restart Required
After this change, you **must restart the React dev server** for the new proxy configuration to take effect:

1. Stop the current dev server (Ctrl+C)
2. Restart: `npm run dev` (from root) or `npm start` (from client directory)

## Verification
After restarting, you should:
- ✅ No more proxy errors for static files
- ✅ `/api` requests still work correctly
- ✅ Page refreshes without errors

