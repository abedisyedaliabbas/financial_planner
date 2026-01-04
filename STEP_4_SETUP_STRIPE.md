# Step 4: Set Up Stripe for Payments

## 🎯 Goal: Configure Stripe live mode for real payments

---

## ✅ Task 4.1: Activate Stripe Account

1. **Go to**: https://dashboard.stripe.com
2. If you see "Activate your account", click it
3. Complete business verification (if required):
   - Business name
   - Business type
   - Tax ID (if applicable)
   - Bank account for payouts
4. Wait for activation (usually instant)

---

## ✅ Task 4.2: Switch to Live Mode

1. In Stripe dashboard, look at the top right
2. You'll see a toggle: **"Test mode"** / **"Live mode"**
3. Click to switch to **"Live mode"**
4. Confirm the switch

**Important**: Make sure you're in **LIVE mode** (not test mode)!

---

## ✅ Task 4.3: Create Live Products

1. Go to **Products** in Stripe dashboard
2. Click **"Add Product"**
3. Fill in:
   - **Name**: `Financial Planner Premium`
   - **Description**: (optional) "Unlock unlimited features and advanced analytics"
4. Click **"Save product"**

### Add Monthly Price:

1. In the product page, click **"Add price"**
2. Fill in:
   - **Price**: `9.99`
   - **Currency**: `USD`
   - **Billing period**: `Monthly` (recurring)
3. Click **"Add price"**
4. **Copy the Price ID** (starts with `price_...`) - this is your **LIVE monthly price ID**

### Add Yearly Price:

1. Still in the product page, click **"Add price"** again
2. Fill in:
   - **Price**: `99.00`
   - **Currency**: `USD`
   - **Billing period**: `Yearly` (recurring)
3. Click **"Add price"**
4. **Copy the Price ID** (starts with `price_...`) - this is your **LIVE yearly price ID**

---

## ✅ Task 4.4: Get Live API Keys

1. In Stripe dashboard, go to **Developers** → **API keys**
2. Make sure you're in **Live mode** (check toggle)
3. Find **"Secret key"** (starts with `sk_live_...`)
4. Click **"Reveal test key"** or **"Reveal live key"**
5. **Copy the secret key** - you'll need this!

---

## ✅ Task 4.5: Set Up Production Webhook

1. In Stripe dashboard, go to **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. **Endpoint URL**: 
   ```
   https://your-app.railway.app/api/stripe/webhook
   ```
   - **Replace `your-app.railway.app` with your actual Railway URL!**
4. **Description**: "Financial Planner Production Webhook"
5. Click **"Add endpoint"**

### Select Events:

Click **"Select events"** and check these:
- ✅ `checkout.session.completed`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `invoice.payment_succeeded`
- ✅ `invoice.payment_failed`

Click **"Add events"**

### Get Webhook Secret:

1. After creating the webhook, click on it
2. Find **"Signing secret"**
3. Click **"Reveal"**
4. **Copy the secret** (starts with `whsec_...`)

---

## ✅ Task 4.6: Update Railway Environment Variables

1. Go to Railway → Your Project → **Variables**
2. Update/Add:

```env
STRIPE_SECRET_KEY=sk_live_...
```
(Use the LIVE secret key you copied)

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```
(Use the webhook secret you copied)

3. Railway will automatically redeploy

---

## ✅ Task 4.7: Update Vercel Environment Variables

1. Go to Vercel → Your Project → **Settings** → **Environment Variables**
2. Update:

```env
REACT_APP_STRIPE_PRICE_MONTHLY=price_...
```
(Use the LIVE monthly price ID)

```env
REACT_APP_STRIPE_PRICE_YEARLY=price_...
```
(Use the LIVE yearly price ID)

3. Vercel will automatically redeploy

---

## ✅ Task 4.8: Test Payment Flow

1. Visit your live app (Vercel URL)
2. Login or register
3. Go to "Upgrade" page
4. Click "Upgrade to Premium"
5. Use Stripe test card (even in live mode, you can test):
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
6. Complete checkout
7. Verify subscription activates

---

## ✅ Checklist

- [ ] Stripe account activated
- [ ] Switched to Live mode
- [ ] Created live products
- [ ] Got live monthly price ID
- [ ] Got live yearly price ID
- [ ] Got live secret key
- [ ] Created webhook endpoint
- [ ] Got webhook secret
- [ ] Updated Railway variables
- [ ] Updated Vercel variables
- [ ] Tested payment flow

---

## 🎉 Step 4 Complete!

Stripe is now configured for live payments!

**Next**: Go to `STEP_5_TEST_AND_VERIFY.md` to test everything.

---

## 🆘 Troubleshooting

### Can't Switch to Live Mode
- Complete business verification first
- Add bank account for payouts
- Contact Stripe support if needed

### Webhook Not Working
- Verify webhook URL is exactly: `https://your-app.railway.app/api/stripe/webhook`
- Check webhook secret is correct in Railway
- Test webhook in Stripe dashboard → Webhooks → Your webhook → "Send test webhook"

### Payment Not Processing
- Verify you're using LIVE keys (not test)
- Check Price IDs are from live mode
- Verify webhook is receiving events (check Stripe dashboard)

### Price IDs Not Working
- Make sure Price IDs start with `price_`
- Verify they're from LIVE mode (not test mode)
- Check they're recurring subscriptions (not one-time)

