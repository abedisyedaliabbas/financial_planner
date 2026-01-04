# 🔧 Add Environment Variables to Railway

## ❌ Problem

Your Railway service shows **"No Environment Variables"** - that's why registration is failing!

You need to add these 6 environment variables.

---

## ✅ Step-by-Step: Add Variables

### Option 1: Using "New Variable" Button (Recommended)

Click **"New Variable"** for each variable below:

#### Variable 1: NODE_ENV
- **Name**: `NODE_ENV`
- **Value**: `production`
- Click **Add**

#### Variable 2: PORT
- **Name**: `PORT`
- **Value**: `5001`
- Click **Add**

#### Variable 3: JWT_SECRET
- **Name**: `JWT_SECRET`
- **Value**: `Cs/e7x12SollRyhSfv+6gn3UOBm2hiWtQ6Ko+MX4kfs=`
- Click **Add**

#### Variable 4: FRONTEND_URL
- **Name**: `FRONTEND_URL`
- **Value**: `https://financial-planner-blue-nine.vercel.app`
- Click **Add**

#### Variable 5: STRIPE_SECRET_KEY
- **Name**: `STRIPE_SECRET_KEY`
- **Value**: `sk_live_...` (get from Stripe Dashboard)
- **Note**: If you don't have this yet, use placeholder: `sk_live_placeholder`
- Click **Add**

#### Variable 6: STRIPE_WEBHOOK_SECRET
- **Name**: `STRIPE_WEBHOOK_SECRET`
- **Value**: `whsec_...` (we'll set this in Step 4)
- **Note**: For now, use placeholder: `whsec_placeholder`
- Click **Add**

---

### Option 2: Using Raw Editor (Faster)

1. Click **"Raw Editor"** button
2. Paste this (replace placeholders if needed):

```env
NODE_ENV=production
PORT=5001
JWT_SECRET=Cs/e7x12SollRyhSfv+6gn3UOBm2hiWtQ6Ko+MX4kfs=
FRONTEND_URL=https://financial-planner-blue-nine.vercel.app
STRIPE_SECRET_KEY=sk_live_placeholder
STRIPE_WEBHOOK_SECRET=whsec_placeholder
```

3. Click **Save**

---

## ✅ After Adding Variables

1. Railway will automatically redeploy
2. Wait 2-3 minutes
3. Check **Deployments** tab for green checkmark ✅
4. Try registering again at: https://financial-planner-blue-nine.vercel.app/register

---

## 📋 Complete Variable List

| Variable Name | Value |
|--------------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `5001` |
| `JWT_SECRET` | `Cs/e7x12SollRyhSfv+6gn3UOBm2hiWtQ6Ko+MX4kfs=` |
| `FRONTEND_URL` | `https://financial-planner-blue-nine.vercel.app` |
| `STRIPE_SECRET_KEY` | `sk_live_...` or `sk_live_placeholder` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` or `whsec_placeholder` |

---

## 🎯 Most Important

**FRONTEND_URL** is the most critical one - it fixes the CORS issue that's preventing registration!

---

## 🚀 After Adding All Variables

1. Wait for redeploy
2. Test registration: https://financial-planner-blue-nine.vercel.app/register
3. Should work now! ✅

---

**Add all 6 variables and your app will work! 🎉**

