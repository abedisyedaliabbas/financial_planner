# Profile Completion Feature for Google Sign-In

## Overview
After users sign in with Google, they are now required to complete their profile by providing:
1. **Country of Residence**
2. **Default Currency**

This ensures all users have the necessary information before accessing the dashboard.

## How It Works

### Flow:
1. User clicks "Sign in with Google"
2. Google authentication completes
3. **If new user or missing country/currency**: Redirected to `/complete-profile`
4. User fills in country and currency
5. Profile is saved
6. User is redirected to dashboard

### If user already has country/currency:
- They go directly to dashboard (no profile completion needed)

## Files Created/Modified

### Backend
- **`server/routes/auth.js`**:
  - Added `needsProfileCompletion` flag to Google Sign-In response
  - Added `/api/auth/complete-profile` endpoint (protected route)
  - Checks if user has country and default_currency

### Frontend
- **`client/src/pages/CompleteProfile.js`** (NEW):
  - Profile completion form
  - Country and currency selection
  - Auto-sets currency based on country selection
  - Redirects to dashboard after completion

- **`client/src/App.js`**:
  - Added `/complete-profile` route

- **`client/src/components/AuthGuard.js`**:
  - Checks if user needs profile completion
  - Redirects to `/complete-profile` if country/currency missing

- **`client/src/pages/Login.js`**:
  - Updated Google Sign-In handler to check `needsProfileCompletion`
  - Redirects to profile completion if needed

- **`client/src/context/AuthContext.js`**:
  - Added `updateUser` method
  - Handles `needsProfileCompletion` flag

- **`client/src/services/api.js`**:
  - Added `completeProfile` API method

## API Endpoints

### POST `/api/auth/complete-profile`
**Protected Route** (requires authentication)

**Request Body:**
```json
{
  "country": "United States",
  "default_currency": "USD"
}
```

**Response:**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name",
    "country": "United States",
    "default_currency": "USD",
    ...
  }
}
```

## User Experience

1. **Google Sign-In** → User authenticates with Google
2. **Profile Check** → System checks if country/currency exists
3. **If Missing** → User sees "Complete Your Profile" page
4. **Form** → User selects country (currency auto-sets)
5. **Submit** → Profile saved, redirected to dashboard
6. **If Complete** → User goes directly to dashboard

## Security

- Profile completion route requires authentication
- User can only update their own profile
- Country and currency are validated
- Currency auto-sets based on country selection

## Testing

1. Sign in with Google (new user)
2. Should be redirected to `/complete-profile`
3. Select country and currency
4. Submit form
5. Should be redirected to dashboard
6. Sign out and sign in again
7. Should go directly to dashboard (profile complete)

## Notes

- Existing users with country/currency set will not see this page
- Only Google-authenticated users who are missing this info will see it
- Regular email/password registration already collects this info
- Currency automatically updates when country is selected
