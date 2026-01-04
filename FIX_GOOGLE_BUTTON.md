# Fix: Google Sign-In Button Not Showing

## The Problem
The Google Sign-In button is not appearing on the login page.

## Solution

### Step 1: Restart Frontend Server

**IMPORTANT:** React environment variables are loaded when the server starts. If you added `.env.local` after starting the server, you MUST restart it!

1. **Stop the frontend server** (Ctrl+C in the terminal where it's running)

2. **Start it again:**
   ```bash
   cd client
   npm start
   ```

3. **Wait for it to compile** (you'll see "Compiled successfully!")

4. **Refresh your browser** (or it should auto-refresh)

### Step 2: Check Browser Console

1. Open browser console (F12)
2. Go to Console tab
3. Look for messages like:
   - "Google Client ID: Found" ✅
   - "Google Client ID: Not found" ❌
   - "Initializing Google Sign-In button..."
   - "Google Sign-In button rendered"

### Step 3: Verify Environment Variable

Make sure `client/.env.local` exists and contains:
```env
REACT_APP_GOOGLE_CLIENT_ID=805485432486-j0gii31sh12ql7ctq35kuqlorpkd3s0u.apps.googleusercontent.com
```

**Important:** 
- File must be named `.env.local` (not `.env`)
- Must be in the `client` folder (not root)
- Must start with `REACT_APP_`
- No spaces around the `=` sign

### Step 4: Check Google Script

1. Open browser console (F12)
2. Go to Network tab
3. Refresh the page
4. Look for `gsi/client` - it should load successfully

### Step 5: If Still Not Working

1. **Check if button div is there:**
   - Right-click on the page → Inspect
   - Look for a div with `ref={googleButtonRef}`
   - If it exists but is empty, Google script might not be loading

2. **Check for errors in console:**
   - Any red error messages?
   - Any warnings about Google Sign-In?

3. **Try hard refresh:**
   - Ctrl+Shift+R (Windows)
   - Cmd+Shift+R (Mac)

## Expected Result

After restarting the frontend, you should see:
- "Sign In" button
- "OR" divider
- **"Sign in with Google" button** ← This should appear!
- "New to Financial Planner?" divider
- "Create a free account" link

## Quick Test

Run this in browser console (F12):
```javascript
console.log('Google Client ID:', process.env.REACT_APP_GOOGLE_CLIENT_ID);
console.log('Google script loaded:', typeof window.google !== 'undefined');
```

If both show values, the button should work!
