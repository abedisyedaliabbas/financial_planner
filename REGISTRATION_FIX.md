# 🔧 Fix Registration Error

## ❌ Problem

Registration is failing with: "Registration failed. Please try again."

This is likely due to:
1. **CORS not configured** - Backend not allowing requests from Vercel
2. **API URL mismatch** - Frontend not connecting to backend correctly

---

## ✅ Solution: Update Railway CORS

### Step 1: Update FRONTEND_URL in Railway

1. Go to Railway: https://railway.app
2. Click on your service
3. Go to **Variables** tab
4. Find `FRONTEND_URL`
5. Update it to: `https://financial-planner-blue-nine.vercel.app`
6. Railway will automatically redeploy

---

## ✅ Solution: Verify Frontend API URL

### Check Vercel Environment Variables

1. Go to Vercel Dashboard
2. Your project → **Settings** → **Environment Variables**
3. Verify `REACT_APP_API_URL` is:
   ```
   https://web-production-8b449.up.railway.app/api
   ```
4. If it's different, update it
5. **Redeploy** the frontend

---

## 🧪 Test the Connection

### Test 1: Check Backend Health
Visit: https://web-production-8b449.up.railway.app/health

Should see:
```json
{"status":"ok","message":"Financial Planner API is running"}
```

### Test 2: Check API Endpoint
Visit: https://web-production-8b449.up.railway.app/api/auth/register

Should see an error (this is normal - it means the endpoint exists):
```json
{"error":"Method not allowed"}
```

### Test 3: Check Browser Console
1. Open your app: https://financial-planner-blue-nine.vercel.app/register
2. Open browser DevTools (F12)
3. Go to **Console** tab
4. Try to register
5. Look for errors - they'll tell us what's wrong

---

## 🔍 Common Issues

### Issue 1: CORS Error
**Error in console**: `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Fix**: Update `FRONTEND_URL` in Railway to your Vercel URL

### Issue 2: Network Error
**Error in console**: `Failed to fetch` or `Network request failed`

**Fix**: 
- Check `REACT_APP_API_URL` in Vercel
- Verify backend is running (check Railway logs)

### Issue 3: 500 Internal Server Error
**Error**: Backend error

**Fix**: Check Railway logs for specific error

---

## 📋 Quick Checklist

- [ ] `FRONTEND_URL` in Railway = `https://financial-planner-blue-nine.vercel.app`
- [ ] `REACT_APP_API_URL` in Vercel = `https://web-production-8b449.up.railway.app/api`
- [ ] Backend health check works
- [ ] Check browser console for specific errors
- [ ] Check Railway logs for backend errors

---

## 🚀 After Fixing

1. Update `FRONTEND_URL` in Railway
2. Wait for Railway to redeploy (1-2 minutes)
3. Try registering again
4. If still failing, check browser console and Railway logs

---

**Update the FRONTEND_URL in Railway first - that's most likely the issue! 🔧**

