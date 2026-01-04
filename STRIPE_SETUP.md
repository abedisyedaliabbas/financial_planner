# Stripe Integration Setup Guide

## 💰 FREE to Use!
**Stripe is completely FREE to set up and test:**
- ✅ No monthly fees
- ✅ No setup fees  
- ✅ Test mode is 100% free (unlimited testing)
- 💰 You only pay 2.9% + $0.30 per successful transaction when customers pay

**See PAYMENT_GATEWAY_OPTIONS.md for more free/low-cost alternatives.**

## Prerequisites
1. Create a **FREE** Stripe account at https://stripe.com
2. Get your **FREE** test API keys from the Stripe Dashboard

## Step 1: Get Stripe API Keys

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your **Publishable Key** and **Secret Key**
3. For webhooks, you'll need a **Webhook Signing Secret** (see Step 3)

## Step 2: Create Products and Prices in Stripe

1. Go to https://dashboard.stripe.com/test/products
2. Create a new product called "Financial Planner Premium"
3. Add two prices:
   - **Monthly**: $9.99/month (recurring)
   - **Yearly**: $99/year (recurring)
4. Copy the **Price IDs** (they start with `price_...`)

## Step 3: Set Up Webhooks

1. Go to https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. Set endpoint URL to: `https://your-domain.com/api/stripe/webhook`
   - For local testing, use Stripe CLI (see below)
4. Select these events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Webhook Signing Secret** (starts with `whsec_...`)

## Step 4: Configure Environment Variables

Add these to your `server/.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...  # Your Stripe Secret Key
STRIPE_WEBHOOK_SECRET=whsec_...  # Your Webhook Signing Secret
```

For the frontend, create a `.env` file in the `client` directory:

```env
REACT_APP_STRIPE_PRICE_MONTHLY=price_...  # Monthly price ID
REACT_APP_STRIPE_PRICE_YEARLY=price_...   # Yearly price ID
```

## Step 5: Local Testing with Stripe CLI

For local development, use Stripe CLI to forward webhooks:

```bash
# Install Stripe CLI
# macOS: brew install stripe/stripe-cli/stripe
# Or download from https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:5001/api/stripe/webhook
```

This will give you a webhook signing secret that starts with `whsec_...`. Use this in your `.env` file for local testing.

## Step 6: Test the Integration

1. Start your server: `npm run dev`
2. Go to the Upgrade page
3. Click "Upgrade to Premium"
4. Use Stripe test card: `4242 4242 4242 4242`
5. Use any future expiry date and any CVC
6. Complete the checkout
7. Check your Stripe dashboard to see the subscription

## Production Setup

1. Switch to **Live mode** in Stripe Dashboard
2. Get your **Live API keys**
3. Update environment variables with live keys
4. Set up production webhook endpoint
5. Update frontend environment variables with live price IDs

## Troubleshooting

### Webhook not working?
- Make sure the webhook endpoint URL is correct
- Verify the webhook signing secret matches
- Check server logs for webhook errors
- Use Stripe CLI for local testing

### Payment not processing?
- Verify Stripe API keys are correct
- Check that price IDs match your Stripe dashboard
- Ensure frontend environment variables are set
- Check browser console for errors

### Subscription not activating?
- Check webhook logs in Stripe dashboard
- Verify webhook events are being received
- Check server logs for subscription update errors
- Ensure database has correct user ID in metadata

## Security Notes

- **Never commit** `.env` files to git
- Use **test keys** for development
- Use **live keys** only in production
- Keep webhook secrets secure
- Verify webhook signatures (already implemented)

