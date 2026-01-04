# Changelog - Google Sign-In Integration

## Date: January 2026

## Features Added

### ✅ Google Sign-In Integration
- Added Google OAuth 2.0 authentication
- Users can now sign in/register using their Google account
- Automatic email verification for Google-authenticated users
- Seamless account creation for new Google users

### ✅ Bug Fixes
- Fixed BigInt serialization error when adding bank accounts
- Fixed rate limiter trust proxy configuration
- Fixed JWT token generation to use user ID instead of object

## Technical Changes

### Backend (`server/`)
- **`routes/auth.js`**: Added `/api/auth/google` endpoint
  - Lazy-loaded Google OAuth client (doesn't break server startup)
  - Handles both new user registration and existing user login
  - Verifies Google ID tokens server-side
  
- **`index.js`**: 
  - Added `trustProxy: true` to rate limiters to fix proxy errors

- **`middleware/auth.js`**: 
  - Improved error handling for token validation
  - Better logging for debugging authentication issues

- **`package.json`**: 
  - Added `google-auth-library` dependency

### Frontend (`client/`)
- **`pages/Login.js`**: 
  - Added Google Sign-In button
  - Integrated Google Identity Services
  - Added loading states and error handling

- **`context/AuthContext.js`**: 
  - Added `googleSignIn` method

- **`services/api.js`**: 
  - Added `googleSignIn` API method

- **`public/index.html`**: 
  - Added Google Identity Services script

- **`.env.local`**: 
  - Added `REACT_APP_GOOGLE_CLIENT_ID` environment variable

## Environment Variables Required

### Backend (`server/.env`)
```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### Frontend (`client/.env.local`)
```env
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

## Testing Checklist

- [x] Server starts without errors
- [x] Google Sign-In button appears on login page
- [x] Google Sign-In creates new accounts
- [x] Google Sign-In logs in existing users
- [x] JWT tokens are generated correctly
- [x] Authentication middleware works with Google users
- [x] Rate limiting configured properly
- [x] No syntax errors
- [x] No linter errors

## Notes

- Google OAuth is lazy-loaded to prevent server startup issues
- Test users must be added in Google Cloud Console OAuth consent screen
- Email is automatically verified for Google-authenticated users
- Server works even if Google OAuth is not configured (graceful degradation)
