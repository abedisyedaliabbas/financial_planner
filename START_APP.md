# 🚀 Starting Your Financial Planner

## Quick Start

### 1. Environment is Set Up ✅
The `.env` file has been created with default settings.

### 2. Start the Application

From the `financial-planner-public` directory, run:

```bash
npm run dev
```

This will start:
- **Backend Server**: http://localhost:5000
- **Frontend App**: http://localhost:3000

### 3. Open in Browser

Go to: **http://localhost:3000**

### 4. Create Your First Account

1. Click "Sign up for free"
2. Enter your email and password
3. Start using the app!

## 🎯 What to Test

### ✅ User Registration
- Sign up with a new email
- Should redirect to dashboard

### ✅ Login
- Log out and log back in
- Should work with your credentials

### ✅ Dashboard
- See your financial overview
- Check subscription status (should show "Free")
- See usage statistics

### ✅ Usage Limits
- Try adding more than 1 bank account (should show limit error)
- Try adding more than 2 credit cards (should show limit error)
- Check the upgrade prompts

### ✅ Upgrade Page
- Click "Upgrade to Premium" button
- See pricing comparison
- (Payment integration coming soon)

## 🐛 Troubleshooting

### Port Already in Use
If port 5000 or 3000 is already in use:
1. Change `PORT=5000` in `server/.env` to another port (e.g., `PORT=5001`)
2. Update `proxy` in `client/package.json` to match

### Database Errors
- Database is created automatically at `server/financial_tracker.db`
- If you get errors, delete this file and restart

### CORS Errors
- Make sure `FRONTEND_URL` in `.env` matches your frontend URL
- Default is `http://localhost:3000`

## 📝 Next Steps

Once everything is working:
1. ✅ Test user registration and login
2. ✅ Test adding financial data
3. ✅ Test hitting limits (free tier)
4. ✅ Test upgrade page
5. 🔜 Add Stripe for payments
6. 🔜 Add more pages (Bank Accounts, Credit Cards, etc.)

---

**Ready to make money?** Start testing and get your first users! 💰


