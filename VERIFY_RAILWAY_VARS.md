# ✅ Verify Railway Environment Variables

## 📋 Current Variables (5 total)

I can see you've added:
1. ✅ `JWT_SECRET` - Set
2. ✅ `NODE_ENV` = `production` - Correct
3. ✅ `PORT` = `5001` - Correct
4. ⚠️ `STRIPE_SECRET_KEY` = `mk_1Sl8zIEqeRDu4Pl7NRBqC6xx` - **This looks wrong!**
5. ✅ `STRIPE_WEBHOOK_SECRET` - Set

---

## ⚠️ Issue Found: STRIPE_SECRET_KEY

Your `STRIPE_SECRET_KEY` starts with `mk_` which is a **test mode publishable key**, not a secret key!

**Secret keys should start with:**
- `sk_test_...` (test mode)
- `sk_live_...` (live mode)

**Publishable keys start with:**
- `pk_test_...` (test mode)
- `pk_live_...` (live mode)

---

## ✅ Fix STRIPE_SECRET_KEY

### Option 1: Use Test Mode (For Now)
1. Go to Stripe Dashboard: https://dashboard.stripe.com/test/apikeys
2. Make sure you're in **Test Mode** (toggle in top right)
3. Find **Secret key** (starts with `sk_test_...`)
4. Click **Reveal test key**
5. Copy it
6. Update in Railway:
   - Variable: `STRIPE_SECRET_KEY`
   - Value: `sk_test_...` (your actual test secret key)

### Option 2: Use Placeholder (For Now)
If you don't have Stripe keys yet:
- Keep: `STRIPE_SECRET_KEY=sk_test_placeholder`
- We'll set up Stripe properly in Step 4

---

## ✅ Verify FRONTEND_URL

I see a URL in your variables: `https://financial-planner-blue-nine.vercel.app`

**Make sure it's named `FRONTEND_URL`** (not just the URL value)

If it's missing:
1. Click **"New Variable"**
2. Name: `FRONTEND_URL`
3. Value: `https://financial-planner-blue-nine.vercel.app`
4. Click **Add**

---

## 🧪 Test Registration Now

1. Go to: https://financial-planner-blue-nine.vercel.app/register
2. Try to register
3. If it works: ✅ Great!
4. If it fails: Check browser console (F12) for errors

---

## 📋 Complete Variable Checklist

| Variable | Status | Value |
|----------|--------|-------|
| `NODE_ENV` | ✅ | `production` |
| `PORT` | ✅ | `5001` |
| `JWT_SECRET` | ✅ | Set |
| `FRONTEND_URL` | ⚠️ | Verify it's named correctly |
| `STRIPE_SECRET_KEY` | ❌ | Fix - should be `sk_test_...` or `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | ✅ | Set |

---

## 🚀 After Fixing

1. Update `STRIPE_SECRET_KEY` to correct format
2. Verify `FRONTEND_URL` is named correctly
3. Railway will auto-redeploy
4. Test registration again

---

**Fix the STRIPE_SECRET_KEY first - it's in the wrong format! 🔧**

