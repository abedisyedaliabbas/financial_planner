# Add Google Client ID to Vercel

## Quick Steps

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Sign in if needed

2. **Select Your Project**
   - Click on **financial-planner** (or your project name)

3. **Go to Settings**
   - Click **Settings** in the top menu
   - Click **Environment Variables** in the left sidebar

4. **Add the Google Client ID**
   - Click **"Add New"** button
   - **Name**: `REACT_APP_GOOGLE_CLIENT_ID`
   - **Value**: `805485432486-j0gii31sh12ql7ctq35kuqlorpkd3s0u.apps.googleusercontent.com`
   - **Environment**: Check all three:
     - ✅ Production
     - ✅ Preview  
     - ✅ Development
   - Click **Save**

5. **Redeploy Your App**
   - Go to **Deployments** tab
   - Click the **"..."** (three dots) on your latest deployment
   - Click **"Redeploy"**
   - Or push a new commit to trigger automatic deployment

6. **Wait for Deployment**
   - Wait 2-3 minutes for the build to complete
   - Check the deployment status (should show ✅ when done)

7. **Test It**
   - Visit your site: https://financial-planner-blue-nine.vercel.app/login
   - The "Sign in with Google" button should now appear!

## Important Notes

- Environment variables are only available after redeployment
- Make sure to check all three environments (Production, Preview, Development)
- The variable name MUST start with `REACT_APP_` for React to access it

## Troubleshooting

If the button still doesn't appear after redeployment:
1. Check browser console (F12) for errors
2. Verify the environment variable is set correctly in Vercel
3. Make sure you redeployed after adding the variable
4. Try a hard refresh (Ctrl+Shift+R)
