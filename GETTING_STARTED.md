# 🚀 Getting Started - Financial Planner Public

## Quick Start Guide

### 1. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 2. Set Up Environment Variables

Create `server/.env` file:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this
FRONTEND_URL=http://localhost:3000
```

### 3. Start Development Server

```bash
# Start both backend and frontend
npm run dev
```

This will start:
- Backend: http://localhost:5000
- Frontend: http://localhost:3000

### 4. Create Your First Account

1. Go to http://localhost:3000
2. Click "Sign up for free"
3. Enter your email and password
4. Start tracking your finances!

## 🎯 Features Implemented

✅ **User Authentication**
- User registration
- User login
- JWT token-based auth
- Protected routes

✅ **Subscription System**
- Free tier with limits
- Premium tier (unlimited)
- Usage tracking
- Automatic limit enforcement

✅ **Financial Tracking**
- Bank accounts (with limits)
- Credit cards (with limits)
- Expenses (monthly limit)
- Income (monthly limit)
- Financial goals (with limits)
- Bill reminders (with limits)

✅ **Dashboard**
- Financial overview
- Usage statistics
- Quick actions

✅ **Upgrade Flow**
- Pricing page
- Feature comparison
- Upgrade prompts

## 📋 Next Steps

1. **Add More Pages**
   - Bank Accounts page
   - Credit Cards page
   - Expenses page
   - Income page
   - Goals page
   - Bills page

2. **Stripe Integration**
   - Add payment processing
   - Subscription management
   - Webhook handling

3. **Advanced Features**
   - Stock tracking (Premium)
   - Budget planning
   - Recurring transactions
   - Email notifications

## 🐛 Troubleshooting

### Database Issues
- Database file is created automatically at `server/financial_tracker.db`
- If you get errors, delete the file and restart the server

### Port Already in Use
- Change `PORT` in `server/.env`
- Update `proxy` in `client/package.json`

### CORS Errors
- Make sure `FRONTEND_URL` in `.env` matches your frontend URL

## 💡 Tips

- All data is user-specific (multi-user ready)
- Free tier limits are enforced automatically
- Premium features are locked for free users
- Usage statistics are shown on dashboard

---

**Ready to make money?** Start adding users and they'll naturally hit limits and want to upgrade! 💰


