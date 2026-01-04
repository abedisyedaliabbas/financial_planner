# 🔧 Fix Vercel Environment Variables

## ❌ Current Issues

Your environment variables need to be fixed before deploying:

1. **REACT_APP_API_URL**: Currently `https://your-app.railway.app/api`
   - Should be: `https://web-production-8b449.up.railway.app/api`

2. **REACT_APP_STRIPE_PRICE_MONTHLY**: Currently `9.99`
   - Should be: A Stripe Price ID (starts with `price_...`)

3. **REACT_APP_STRIPE_PRICE_YEARLY**: Currently `99.00`
   - Should be: A Stripe Price ID (starts with `price_...`)

---

## ✅ Correct Environment Variables

### Variable 1: REACT_APP_API_URL
- **Key**: `REACT_APP_API_URL`
- **Value**: `https://web-production-8b449.up.railway.app/api`
- **Environment**: Production, Preview, Development (check all)

### Variable 2: REACT_APP_STRIPE_PRICE_MONTHLY
- **Key**: `REACT_APP_STRIPE_PRICE_MONTHLY`
- **Value**: `price_...` (your Stripe monthly price ID)
- **Note**: If you don't have this yet, use a placeholder like `price_monthly_placeholder`
- **Environment**: Production, Preview, Development (check all)

### Variable 3: REACT_APP_STRIPE_PRICE_YEARLY
- **Key**: `REACT_APP_STRIPE_PRICE_YEARLY`
- **Value**: `price_...` (your Stripe yearly price ID)
- **Note**: If you don't have this yet, use a placeholder like `price_yearly_placeholder`
- **Environment**: Production, Preview, Development (check all)

---

## 📋 How to Fix in Vercel

### Step 1: Update REACT_APP_API_URL

1. Find the environment variable section
2. Click on `REACT_APP_API_URL`
3. Change value from: `https://your-app.railway.app/api`
4. To: `https://web-production-8b449.up.railway.app/api`
5. Make sure all environments are checked (Production, Preview, Development)

### Step 2: Fix Stripe Price IDs

**Option A: If you have Stripe Price IDs:**
1. Go to Stripe Dashboard → Products
2. Copy your Price IDs (they start with `price_...`)
3. Update the values in Vercel

**Option B: If you don't have Stripe Price IDs yet:**
1. For now, use placeholders:
   - `REACT_APP_STRIPE_PRICE_MONTHLY`: `price_monthly_placeholder`
   - `REACT_APP_STRIPE_PRICE_YEARLY`: `price_yearly_placeholder`
2. We'll update them in Step 4 (Stripe Setup)

---

## ✅ Final Environment Variables

After fixing, you should have:

| Key | Value |
|-----|-------|
| `REACT_APP_API_URL` | `https://web-production-8b449.up.railway.app/api` |
| `REACT_APP_STRIPE_PRICE_MONTHLY` | `price_...` or `price_monthly_placeholder` |
| `REACT_APP_STRIPE_PRICE_YEARLY` | `price_...` or `price_yearly_placeholder` |

---

## 🚀 After Fixing

1. Click **"Deploy"** button
2. Wait 2-3 minutes for build
3. Vercel will give you a URL like: `https://financial-planner.vercel.app`
4. **Save this URL** - you'll need it to update Railway CORS!

---

## ⚠️ Important Notes

- **REACT_APP_API_URL**: Must match your Railway backend URL exactly
- **Stripe Price IDs**: Must start with `price_` (not numbers!)
- **All Environments**: Make sure to check Production, Preview, and Development

---

**Fix these 3 environment variables, then click Deploy! 🚀**

