# 🔒 Security & Data Protection

## Data Storage Location

**All user data is stored securely in a SQLite database:**
```
financial-planner-public/server/financial_tracker.db
```

This database file is stored on the server and is **NOT publicly accessible**. Only the backend server can read/write to it.

---

## ✅ Email Uniqueness Protection

### **Your email is 100% protected from duplicate signups:**

1. **Database-Level Protection:**
   - The `email` column has a `UNIQUE` constraint in the database
   - Even if someone tries to bypass the application, the database will reject duplicate emails

2. **Application-Level Protection:**
   - Before creating an account, the system checks if the email already exists
   - If someone tries to sign up with your email, they'll get an error: "Email already registered"

3. **Email Normalization:**
   - All emails are converted to lowercase and trimmed
   - `YourEmail@Gmail.com` = `youremail@gmail.com` (same account)
   - This prevents creating multiple accounts with the same email in different cases

### **What happens if someone tries to use your email:**
- ❌ They cannot create an account with your email
- ✅ They will see: "Email already registered. Please use a different email or try logging in instead."
- ✅ The database will reject the attempt even if they bypass the application check

---

## 🔐 Security Features

### 1. **Password Security**
- ✅ Passwords are **NEVER stored in plain text**
- ✅ All passwords are hashed using **bcrypt** (industry standard)
- ✅ Even if someone accesses the database, they cannot see your password
- ✅ Minimum 8 characters required

### 2. **Authentication**
- ✅ JWT (JSON Web Tokens) for secure session management
- ✅ Tokens expire after 7 days (automatic logout for security)
- ✅ All API requests require valid authentication tokens
- ✅ Tokens are verified on every request

### 3. **Rate Limiting**
- ✅ **General API**: 200 requests per 15 minutes (production)
- ✅ **Authentication endpoints**: Only 5 attempts per 15 minutes (prevents brute force attacks)
- ✅ If too many failed login attempts, the IP is temporarily blocked

### 4. **Data Isolation**
- ✅ Each user's data is completely isolated by `user_id`
- ✅ Users can **ONLY** see their own data
- ✅ No user can access another user's financial information
- ✅ All database queries filter by `user_id`

### 5. **Input Validation**
- ✅ Email format validation (must be valid email)
- ✅ Password strength requirements
- ✅ All user inputs are sanitized
- ✅ SQL injection protection (parameterized queries)

### 6. **CORS Protection**
- ✅ Only allowed frontend domains can access the API
- ✅ Prevents unauthorized websites from accessing your data

---

## 🛡️ What Data is Protected

### **Stored Securely:**
- ✅ Email address (unique, cannot be duplicated)
- ✅ Password hash (encrypted, cannot be reversed)
- ✅ Name, country, currency preferences
- ✅ All financial data (bank accounts, expenses, income, etc.)
- ✅ Subscription information

### **NOT Stored:**
- ❌ Plain text passwords (never stored)
- ❌ Credit card numbers (if using Stripe, handled by Stripe)
- ❌ Sensitive personal information beyond what you provide

---

## 🔒 Account Security

### **Your Account is Protected By:**
1. **Unique Email** - No one else can use your email
2. **Hashed Password** - Your password is encrypted
3. **JWT Tokens** - Secure session management
4. **Rate Limiting** - Prevents brute force attacks
5. **Data Isolation** - Your data is completely separate from others

### **Best Practices for You:**
- ✅ Use a strong, unique password (at least 8 characters)
- ✅ Don't share your password with anyone
- ✅ Log out when using shared devices
- ✅ Report any suspicious activity immediately

---

## 📊 Data Access

### **Who Can Access Your Data:**
- ✅ **You** - Only when logged in with your credentials
- ✅ **The backend server** - To process your requests
- ❌ **Other users** - Cannot access your data
- ❌ **Public** - Database is not publicly accessible

### **Database Location:**
- The database file is stored on the server
- It's in a protected directory
- Only the server application has read/write access
- Not accessible via web browser or public URLs

---

## 🚨 Security Measures Summary

| Feature | Status | Protection Level |
|---------|--------|------------------|
| Email Uniqueness | ✅ Active | Database + Application Level |
| Password Hashing | ✅ Active | bcrypt (industry standard) |
| JWT Authentication | ✅ Active | Secure token-based |
| Rate Limiting | ✅ Active | Prevents brute force |
| Data Isolation | ✅ Active | Per-user separation |
| Input Validation | ✅ Active | All inputs validated |
| CORS Protection | ✅ Active | Domain whitelist |
| SQL Injection Protection | ✅ Active | Parameterized queries |

---

## 🔍 How to Verify Your Account is Secure

1. **Try to sign up with your email again:**
   - You should see: "Email already registered"
   - This confirms your email is protected

2. **Check your account:**
   - Log in and verify all your data is there
   - Only you can see your financial information

3. **Test password security:**
   - Your password is hashed in the database
   - Even if someone accesses the database, they cannot see your password

---

## 📞 Security Concerns?

If you notice any suspicious activity:
1. Change your password immediately
2. Check your account for unauthorized changes
3. Contact support if needed

---

## ✅ Security Guarantees

**We guarantee:**
- ✅ Your email cannot be used by anyone else
- ✅ Your password is encrypted and secure
- ✅ Your data is isolated from other users
- ✅ All API requests are authenticated
- ✅ Rate limiting prevents brute force attacks
- ✅ Database is not publicly accessible

**Your financial data is safe and secure! 🔒**


