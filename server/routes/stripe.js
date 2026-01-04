const express = require('express');
const router = express.Router();
const db = require('../database');

// Initialize Stripe only if API key is provided
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  try {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    console.log('✅ Stripe initialized with API key');
  } catch (error) {
    console.warn('⚠️  Stripe package not available:', error.message);
  }
} else {
  console.warn('⚠️  STRIPE_SECRET_KEY not set. Stripe features will be disabled.');
}

// Create Stripe checkout session
router.post('/create-checkout-session', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ 
        error: 'Stripe is not configured',
        message: 'Payment processing is not available. Please set STRIPE_SECRET_KEY in server environment variables.'
      });
    }

    const userId = req.user.id;
    const { priceId, planType } = req.body; // planType: 'monthly' or 'yearly'

    if (!priceId) {
      return res.status(400).json({ error: 'Price ID is required' });
    }

    // Get user email
    const user = await db.get('SELECT email FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/upgrade?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/upgrade?canceled=true`,
      metadata: {
        userId: userId.toString(),
        planType: planType || 'monthly'
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      message: error.message 
    });
  }
});

// Handle Stripe webhook (special route, no auth)
// Note: This is handled directly in server/index.js with express.raw middleware
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        await handleSubscriptionActivated(session);
        break;
      
      case 'customer.subscription.updated':
        const subscription = event.data.object;
        await handleSubscriptionUpdated(subscription);
        break;
      
      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        await handleSubscriptionCancelled(deletedSubscription);
        break;
      
      case 'invoice.payment_succeeded':
        const invoice = event.data.object;
        await handlePaymentSucceeded(invoice);
        break;
      
      case 'invoice.payment_failed':
        const failedInvoice = event.data.object;
        await handlePaymentFailed(failedInvoice);
        break;
      
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};

// Export webhook handler
module.exports.webhook = handleWebhook;

// Helper functions
async function handleSubscriptionActivated(session) {
  const userId = session.metadata?.userId;
  if (!userId) {
    console.error('No userId in session metadata');
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(session.subscription);
  
  // Update user subscription
  await db.run(
    `UPDATE users 
     SET subscription_tier = 'premium',
         subscription_status = 'active',
         stripe_customer_id = ?,
         stripe_subscription_id = ?,
         subscription_expires_at = datetime(?, 'unixepoch')
     WHERE id = ?`,
    [
      subscription.customer,
      subscription.id,
      subscription.current_period_end,
      userId
    ]
  );

  console.log(`Subscription activated for user ${userId}`);
}

async function handleSubscriptionUpdated(subscription) {
  const customerId = subscription.customer;
  const user = await db.get('SELECT id FROM users WHERE stripe_customer_id = ?', [customerId]);
  
  if (!user) {
    console.error('User not found for subscription update');
    return;
  }

  const status = subscription.status === 'active' ? 'active' : 'inactive';
  
  await db.run(
    `UPDATE users 
     SET subscription_status = ?,
         subscription_expires_at = datetime(?, 'unixepoch')
     WHERE id = ?`,
    [status, subscription.current_period_end, user.id]
  );

  console.log(`Subscription updated for user ${user.id}: ${status}`);
}

async function handleSubscriptionCancelled(subscription) {
  const customerId = subscription.customer;
  const user = await db.get('SELECT id FROM users WHERE stripe_customer_id = ?', [customerId]);
  
  if (!user) {
    console.error('User not found for subscription cancellation');
    return;
  }

  await db.run(
    `UPDATE users 
     SET subscription_tier = 'free',
         subscription_status = 'cancelled',
         subscription_expires_at = datetime(?, 'unixepoch')
     WHERE id = ?`,
    [subscription.current_period_end, user.id]
  );

  console.log(`Subscription cancelled for user ${user.id}`);
}

async function handlePaymentSucceeded(invoice) {
  const customerId = invoice.customer;
  const user = await db.get('SELECT id FROM users WHERE stripe_customer_id = ?', [customerId]);
  
  if (user) {
    console.log(`Payment succeeded for user ${user.id}`);
    // You can add additional logic here, like sending confirmation emails
  }
}

async function handlePaymentFailed(invoice) {
  const customerId = invoice.customer;
  const user = await db.get('SELECT id FROM users WHERE stripe_customer_id = ?', [customerId]);
  
  if (user) {
    console.log(`Payment failed for user ${user.id}`);
    // You can add logic to notify the user or update their subscription status
  }
}

// Get Stripe customer portal URL
router.post('/create-portal-session', async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await db.get('SELECT stripe_customer_id FROM users WHERE id = ?', [userId]);
    
    if (!user || !user.stripe_customer_id) {
      return res.status(400).json({ error: 'No Stripe customer found' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/upgrade`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Portal session error:', error);
    res.status(500).json({ 
      error: 'Failed to create portal session',
      message: error.message 
    });
  }
});

// Export router and webhook handler
module.exports = router;

