# Client Environment Variables Setup

## Quick Setup for Stripe

You need to create a `.env` file in the `client` directory with your Stripe Price IDs.

### Step 1: Get Your Stripe Price IDs

1. Go to your Stripe Dashboard: https://dashboard.stripe.com/test/products
2. If you don't have products yet, create them:
   - Click "Add product"
   - Name: "Premium Monthly"
   - Price: $9.99/month (recurring)
   - Copy the Price ID (starts with `price_...`)
   - Repeat for "Premium Yearly" at $99/year

### Step 2: Create Client .env File

Create a file called `.env` in the `client` directory with this content:

```env
# Backend Port
REACT_APP_BACKEND_PORT=5001

# Stripe Price IDs (get these from Stripe Dashboard)
REACT_APP_STRIPE_PRICE_MONTHLY=price_1Sl93xEqeRDu4Pl7QnxNz3bp
REACT_APP_STRIPE_PRICE_YEARLY=price_1Sl93xEqeRDu4Pl7QnxNz3bp
```

**Important:** Replace the price IDs above with your actual Price IDs from Stripe!

### Step 3: Restart Your Dev Server

After creating the `.env` file:
1. Stop your dev server (Ctrl+C)
2. Restart: `npm run dev`

The React app will pick up the new environment variables.

### Current Status

✅ Server has Stripe secret key configured  
❌ Client needs Stripe price IDs in `.env` file

Once you add the price IDs, the upgrade buttons will work!

