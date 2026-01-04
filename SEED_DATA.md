# 🌱 Seed Sample Data

## Quick Start

To populate the database with realistic sample data for testing:

```bash
node server/seed.js
```

## What Gets Added

### Test User
- **Email**: `test@example.com`
- **Password**: `password123`
- **Tier**: Free (so you can test limits!)

### Sample Data

1. **Bank Account** (1/1 limit)
   - Main Checking - $5,420.50

2. **Credit Cards** (2/2 limit - at max!)
   - Chase Sapphire - $10,000 limit, $2,340.75 balance
   - Amex Gold - $15,000 limit, $5,670.25 balance

3. **Income** (3/5 limit)
   - Salary: $4,500/month
   - Freelance: $500 (one-time)
   - Investment: $200/month
   - **Total**: $5,200

4. **Expenses** (15/50 limit)
   - Various categories: Food, Transportation, Shopping, Utilities, Entertainment, Healthcare
   - **Total**: ~$1,172.93
   - Mix of credit card and cash payments

5. **Financial Goal** (1/1 limit - at max!)
   - Emergency Fund: $2,500 / $10,000 target

6. **Bill Reminders** (3/3 limit - at max!)
   - Rent: $1,200 (due day 1)
   - Electricity: $150 (due day 15)
   - Internet: $85 (due day 20)

7. **Installment**
   - Furniture Purchase: $2,100 remaining ($3,000 total)

## Testing Limits

After seeding, you can test:

1. **Try adding a 2nd bank account** → Should show limit error
2. **Try adding a 3rd credit card** → Should show limit error  
3. **Try adding a 2nd financial goal** → Should show limit error
4. **Try adding a 4th bill reminder** → Should show limit error
5. **Add more expenses** → Can add up to 50 total (35 more available)

## Reset Data

To clear and reseed:
```bash
node server/seed.js
```

The script automatically clears existing data for the test user before adding new data.

## Notes

- All dates are set to the current month
- All amounts are in USD
- The test user is on the **Free tier** so you can see limit enforcement
- Data is realistic and shows a typical financial situation

---

**Ready to test?** Run the seed script and log in with the test credentials! 🚀


