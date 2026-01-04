# 🔧 Fix Root Directory in Railway

## 📍 Where to Find It

Looking at your Railway settings, I can see:

**Current Settings:**
- Root Directory: `/` (empty - means root)
- Start Command: `node server/index.js`

## ✅ How to Fix

### Step 1: Find "Add Root Directory"

In your Railway Settings page, look for:

**"Add Root Directory"** section
- It's under the **"Source"** section
- You'll see: `Add Root Directory (used for build and deploy steps. Docs↗)`

### Step 2: Set Root Directory

1. Click on the **"Add Root Directory"** field (or edit if it exists)
2. Type: `server`
3. Click **Save** or **Update**

### Step 3: Update Start Command

1. Scroll down to **"Deploy"** section
2. Find **"Custom Start Command"**
3. Change from: `node server/index.js`
4. To: `node index.js`
5. Click **Update**

---

## ✅ Correct Settings

After fixing, your settings should be:

| Setting | Value |
|---------|-------|
| **Root Directory** | `server` |
| **Start Command** | `node index.js` |

---

## 🎯 Why This Fixes It

- **Root Directory = `server`**: Railway will look in the `server` folder
- **Start Command = `node index.js`**: Since we're already in `server` folder, we just run `index.js`

---

## 🚀 After Saving

1. Railway will automatically redeploy
2. Wait 2-3 minutes
3. Check **Deployments** tab for green checkmark ✅
4. Test: `https://web-production-8b449.up.railway.app/health`

---

## 📸 Visual Guide

**Before:**
```
Root Directory: / (empty)
Start Command: node server/index.js
```

**After:**
```
Root Directory: server
Start Command: node index.js
```

---

**Change those two settings and Railway will redeploy automatically! 🎉**

