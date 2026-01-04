# 💰 Financial Planner - Public Freemium Version

## 🎯 Mission
Help people track expenses, monitor finances, and become financially active and knowledgeable.

## 🚀 Features

### Free Tier (Forever Free)
- ✅ 1 Bank Account
- ✅ 2 Credit Cards
- ✅ 50 Expenses/month
- ✅ 5 Income entries/month
- ✅ Basic Dashboard
- ✅ 1 Financial Goal
- ✅ 3 Bill Reminders
- ✅ Mobile Access
- ✅ CSV Export

### Premium Tier ($9.99/month)
- ✅ Unlimited Everything
- ✅ Advanced Analytics
- ✅ Stock Portfolio Tracking
- ✅ Budget Planning
- ✅ Email Reminders
- ✅ Data Backup/Restore
- ✅ Excel/PDF Export
- ✅ Priority Support

## 🛠️ Tech Stack
- **Frontend**: React
- **Backend**: Node.js + Express
- **Database**: PostgreSQL (production) / SQLite (development)
- **Payment**: Stripe
- **Hosting**: Vercel (frontend) + Railway (backend)

## 📦 Installation

```bash
# Install dependencies
npm install
cd client && npm install

# Set up environment variables
cp server/.env.example server/.env
# Edit server/.env with your settings

# Run development server
npm run dev
```

## 🚀 Deployment

### Quick Deploy (30 minutes)

See **[DEPLOYMENT_QUICKSTART.md](./DEPLOYMENT_QUICKSTART.md)** for step-by-step instructions.

### Full Deployment Guide

See **[GOING_LIVE.md](./GOING_LIVE.md)** for comprehensive deployment instructions.

### Recommended Setup
- **Frontend**: Vercel (free tier available)
- **Backend**: Railway or Render (free tier available)
- **Database**: SQLite (simple) or PostgreSQL (scalable)
- **Payments**: Stripe (live mode)

### Environment Variables

**Backend** (`server/.env`):
```env
NODE_ENV=production
PORT=5001
JWT_SECRET=your-secret-key
FRONTEND_URL=https://your-domain.com
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Frontend** (set in hosting platform):
```env
REACT_APP_API_URL=https://your-api-domain.com/api
REACT_APP_STRIPE_PRICE_MONTHLY=price_...
REACT_APP_STRIPE_PRICE_YEARLY=price_...
```

## 🎯 Getting Started
1. Sign up for free account
2. Add your first bank account
3. Start tracking expenses
4. Upgrade to Premium for unlimited features

## 💰 Revenue Model
- **Free**: Get users hooked with essential features
- **Premium**: $9.99/month for unlimited access
- **Conversion Goal**: 10-15% of free users upgrade

## 📈 Roadmap
- [x] Multi-user support
- [x] Subscription tiers
- [ ] Stripe integration
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] Educational content

---

**Built with ❤️ to help people achieve financial freedom**


