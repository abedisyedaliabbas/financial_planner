# 🔧 Fix Start Command in Railway

## ❌ Current Error

```
Error: Cannot find module '/app/server/index.js'
```

This means the **Start Command** is still wrong!

---

## ✅ The Fix

### Step 1: Go to Settings

1. In Railway, click on your service
2. Go to **Settings** tab
3. Scroll down to **"Deploy"** section

### Step 2: Update Start Command

1. Find **"Custom Start Command"**
2. It currently says: `node server/index.js` ❌
3. **Change it to**: `node index.js` ✅
4. Click **Update**

---

## 🎯 Why This Works

- **Root Directory** = `server` (you already set this ✅)
- This means Railway is **already in** the `server` folder
- So the Start Command should be: `node index.js` (not `node server/index.js`)

---

## ✅ Correct Settings

| Setting | Value |
|---------|-------|
| **Root Directory** | `server` ✅ |
| **Start Command** | `node index.js` ← **FIX THIS** |

---

## 🚀 After Fixing

1. Railway will automatically redeploy
2. Wait 2-3 minutes
3. Check **Deployments** tab
4. Should see green checkmark ✅
5. Test: `https://web-production-8b449.up.railway.app/health`

---

## 📍 Exact Location

In Railway Settings → **Deploy** section:

```
Deploy
├── Custom Start Command
│   └── Current: node server/index.js  ← CHANGE THIS
│   └── Should be: node index.js      ← TO THIS
└── ...
```

---

**Change the Start Command to `node index.js` and it will work! 🎉**

