# ✅ Pre-Launch Checklist

Use this checklist before going live with your financial planner app.

## 🔐 Security

- [ ] Changed `JWT_SECRET` to a strong random string (32+ characters)
- [ ] Removed any test/example API keys from code
- [ ] Verified `.env` files are in `.gitignore` and not committed
- [ ] Enabled HTTPS/SSL (automatic with Vercel/Railway)
- [ ] Reviewed CORS settings (only allow your domain)
- [ ] Removed debug logging from production code
- [ ] Set secure cookie flags (if using cookies)

## 💳 Stripe Setup

- [ ] Activated Stripe account
- [ ] Completed business verification (if required)
- [ ] Switched to **Live Mode** (not test mode)
- [ ] Created live products:
  - [ ] Financial Planner Premium (monthly)
  - [ ] Financial Planner Premium (yearly)
- [ ] Copied LIVE Price IDs (start with `price_...`)
- [ ] Set up production webhook endpoint
- [ ] Configured webhook events:
  - [ ] `checkout.session.completed`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`
  - [ ] `invoice.payment_succeeded`
  - [ ] `invoice.payment_failed`
- [ ] Copied webhook signing secret
- [ ] Tested payment with real card (small amount)

## 🌐 Hosting & Deployment

- [ ] Code pushed to GitHub
- [ ] Backend deployed and running
- [ ] Frontend deployed and running
- [ ] Environment variables configured:
  - [ ] Backend: `JWT_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `FRONTEND_URL`
  - [ ] Frontend: `REACT_APP_API_URL`, `REACT_APP_STRIPE_PRICE_MONTHLY`, `REACT_APP_STRIPE_PRICE_YEARLY`
- [ ] CORS configured correctly
- [ ] Health check endpoint working (`/health`)
- [ ] Custom domain configured (optional)

## 🗄️ Database

- [ ] Database accessible from hosting platform
- [ ] Backup strategy in place
- [ ] Tested database migrations (if any)
- [ ] Verified user data is isolated (multi-tenant)

## 🧪 Testing

- [ ] Tested user registration
- [ ] Tested user login
- [ ] Tested password reset (if implemented)
- [ ] Tested all CRUD operations:
  - [ ] Bank accounts
  - [ ] Credit cards
  - [ ] Expenses
  - [ ] Income
  - [ ] Savings
  - [ ] Stocks (premium)
  - [ ] Budget (premium)
  - [ ] Financial goals
  - [ ] Bill reminders
  - [ ] Installments
  - [ ] Loans
- [ ] Tested subscription upgrade flow
- [ ] Tested payment processing
- [ ] Tested webhook handling
- [ ] Tested on mobile devices
- [ ] Tested in multiple browsers:
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari
  - [ ] Edge
- [ ] Tested error handling (invalid inputs, network errors)
- [ ] Tested subscription limits (free tier restrictions)

## 📊 Monitoring & Analytics

- [ ] Set up error tracking (Sentry, LogRocket, etc.)
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Configured server logs
- [ ] Set up analytics (Google Analytics, Plausible, etc.)
- [ ] Created Stripe dashboard alerts

## 📝 Content & Legal

- [ ] Privacy policy page created
- [ ] Terms of service page created
- [ ] Contact/support information added
- [ ] About page created (optional)
- [ ] FAQ page created (optional)
- [ ] Email templates reviewed (if using)

## 🎨 User Experience

- [ ] All pages load correctly
- [ ] Navigation works smoothly
- [ ] Forms validate correctly
- [ ] Error messages are user-friendly
- [ ] Loading states implemented
- [ ] Mobile responsive design verified
- [ ] Dark mode works (if implemented)
- [ ] Currency conversion works correctly

## 📧 Communication

- [ ] Welcome email template ready (if using)
- [ ] Payment confirmation emails working
- [ ] Password reset emails working (if implemented)
- [ ] Support email configured

## 💰 Financial

- [ ] Stripe account connected to bank account
- [ ] Tax information configured (if required)
- [ ] Pricing clearly displayed
- [ ] Refund policy defined

## 🚀 Launch

- [ ] Beta tested with small group
- [ ] Fixed critical bugs from beta testing
- [ ] Prepared launch announcement
- [ ] Social media accounts ready (if using)
- [ ] Support channels ready (email, chat, etc.)

## 📈 Post-Launch

- [ ] Monitor error logs daily (first week)
- [ ] Check Stripe dashboard for payments
- [ ] Gather user feedback
- [ ] Track signups and conversions
- [ ] Review server costs
- [ ] Plan feature updates based on feedback

---

## 🎯 Priority Items (Must Have)

1. ✅ Security: Strong JWT secret, HTTPS enabled
2. ✅ Stripe: Live mode, webhooks configured
3. ✅ Testing: Core features work
4. ✅ Deployment: App is accessible

## 📋 Nice to Have (Can Add Later)

- Custom domain
- Error tracking service
- Analytics
- Email notifications
- Custom branding

---

**Once all priority items are checked, you're ready to launch! 🚀**

