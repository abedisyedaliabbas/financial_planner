# 🚀 Quick Stripe Setup Guide

## ✅ Step 1: Add API Keys to Environment Variables

You have your Stripe test keys! Now let's add them to your app.

### Backend Setup (`server/.env`)

Open `server/.env` and add these lines:

```env
# Stripe Configuration (Test Mode)
STRIPE_SECRET_KEY=sk_test_...  # Get this from Stripe Dashboard → Developers → API keys
STRIPE_WEBHOOK_SECRET=whsec_...  # We'll get this in Step 3
```

### Frontend Setup (`client/.env`)

Create a new file `client/.env` and add:

```env
REACT_APP_STRIPE_PRICE_MONTHLY=price_...  # We'll create this in Step 2
REACT_APP_STRIPE_PRICE_YEARLY=price_...   # We'll create this in Step 2
```

---

## 📦 Step 2: Create Products & Prices in Stripe

1. **Go to Products**: https://dashboard.stripe.com/test/products
2. Click **"Add Product"**
3. Name: `Financial Planner Premium`
4. Add two prices:
   - **Monthly**: $9.99/month (recurring)
   - **Yearly**: $99/year (recurring)
5. **Copy the Price IDs** (they start with `price_...`)

### Update Frontend Environment Variables

Update `client/.env`:

```env
REACT_APP_STRIPE_PRICE_MONTHLY=price_xxxxxxxxxxxxx  # Your monthly price ID
REACT_APP_STRIPE_PRICE_YEARLY=price_xxxxxxxxxxxxx   # Your yearly price ID
```

---

## 🔗 Step 3: Set Up Webhook (For Development)

### Option A: Use Stripe CLI (Recommended for Development)

1. **Install Stripe CLI**:
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Or download from: https://stripe.com/docs/stripe-cli
   ```

2. **Login to Stripe**:
   ```bash
   stripe login
   ```

3. **Forward webhooks to your local server**:
   ```bash
   stripe listen --forward-to localhost:5001/api/stripe/webhook
   ```

4. **Copy the webhook signing secret** (starts with `whsec_...`)
5. **Add to `server/.env`**:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### Option B: Use Stripe Dashboard (For Production)

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click **"Add endpoint"**
3. Endpoint URL: `https://your-domain.com/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Signing secret** and add to `server/.env`

---

## ✅ Step 4: Test It!

1. **Start your servers**:
   ```bash
   npm run dev
   ```

2. **Test the upgrade flow**:
   - Go to your app
   - Click "Upgrade to Premium"
   - Use test card: `4242 4242 4242 4242`
   - Complete checkout
   - Verify subscription activates

---

## 🎉 Done!

Your Stripe integration is set up! Users can now upgrade to Premium.

---

## 📝 Notes

- **Test Mode**: Use test keys and test cards
- **Live Mode**: Switch to live keys when ready for production
- **Webhooks**: Required for subscription updates
- **Price IDs**: Must match your Stripe dashboard

---

## 🆘 Troubleshooting

### "Stripe Price IDs need to be configured"
- Make sure `client/.env` has the correct Price IDs
- Restart your React app after adding env variables

### "Webhook error"
- Verify webhook secret is correct
- Check webhook URL is accessible
- Make sure you're forwarding to the correct port

### "Payment failed"
- Use test card: `4242 4242 4242 4242`
- Check Stripe dashboard for error details
- Verify API keys are correct
