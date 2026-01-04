# Commands to Push to GitHub

## Step 1: Add Files to Git

```bash
git add .
```

This will add all files except those in `.gitignore` (like `.env` files, `node_modules`, etc.)

## Step 2: Check What Will Be Committed

```bash
git status
```

Review the files to make sure no sensitive data is included.

## Step 3: Commit Changes

```bash
git commit -m "Add Google Sign-In integration and fix authentication bugs

Features:
- Added Google OAuth 2.0 authentication
- Users can sign in/register with Google account
- Automatic email verification for Google users

Bug Fixes:
- Fixed BigInt serialization error when adding bank accounts
- Fixed rate limiter trust proxy configuration  
- Fixed JWT token generation for Google users
- Improved error handling in authentication middleware

Technical:
- Lazy-loaded Google OAuth (doesn't break server startup)
- Server works gracefully without Google OAuth configured
- All code tested and verified"
```

## Step 4: Add GitHub Remote

If you haven't added your GitHub repository yet:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repository name.

## Step 5: Push to GitHub

```bash
git branch -M main
git push -u origin main
```

If your default branch is `master` instead:
```bash
git push -u origin master
```

## Important Notes

⚠️ **Environment variables are NOT committed** (they're in `.gitignore`):
- `server/.env`
- `client/.env.local`

You'll need to add these manually to your deployment platform:
- **Vercel**: Add `REACT_APP_GOOGLE_CLIENT_ID` in project settings
- **Railway**: Add `GOOGLE_CLIENT_ID` in environment variables

## Verify Push

After pushing, check your GitHub repository to confirm all files are there.
