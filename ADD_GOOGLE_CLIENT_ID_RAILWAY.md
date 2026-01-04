# Add Google Client ID to Railway (Backend)

## Quick Steps

1. **Go to Railway Dashboard**
   - Visit: https://railway.app/dashboard
   - Sign in if needed

2. **Select Your Project**
   - Click on your **financial-planner** project
   - Click on your **backend service** (the one running the server)

3. **Go to Variables Tab**
   - Click **Variables** in the left sidebar
   - Or click **Variables** tab at the top

4. **Add the Google Client ID**
   - Click **"New Variable"** button
   - **Name**: `GOOGLE_CLIENT_ID`
   - **Value**: `805485432486-j0gii31sh12ql7ctq35kuqlorpkd3s0u.apps.googleusercontent.com`
   - Click **Add**

5. **Railway Will Auto-Redeploy**
   - Railway automatically redeploys when you add variables
   - Wait 2-3 minutes for the deployment to complete
   - Check the **Deployments** tab for green checkmark ✅

6. **Test It**
   - Try Google Sign-In again on your site
   - The error should be gone!

## Alternative: Using Raw Editor (Faster)

If you have many variables to add:

1. Click **"Raw Editor"** button in Variables tab
2. Add this line to your existing variables:
   ```
   GOOGLE_CLIENT_ID=805485432486-j0gii31sh12ql7ctq35kuqlorpkd3s0u.apps.googleusercontent.com
   ```
3. Click **Save**
4. Railway will automatically redeploy

## Complete Variable List for Railway

Make sure you have all these variables set:

```
NODE_ENV=production
PORT=5001
JWT_SECRET=your-jwt-secret-here
FRONTEND_URL=https://financial-planner-blue-nine.vercel.app
GOOGLE_CLIENT_ID=805485432486-j0gii31sh12ql7ctq35kuqlorpkd3s0u.apps.googleusercontent.com
```

Plus any other variables you need (Stripe, Email, Database, etc.)

## Troubleshooting

If it still doesn't work after redeployment:
1. Check Railway logs (Deployments → View Logs)
2. Verify the variable name is exactly `GOOGLE_CLIENT_ID` (case-sensitive)
3. Make sure Railway finished redeploying (green checkmark)
4. Try Google Sign-In again after a few minutes
