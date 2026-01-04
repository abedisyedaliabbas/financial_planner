# Push Code to GitHub - Quick Guide

## ✅ Step 1: Create GitHub Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a name: `Financial Planner Push`
4. Select expiration: **90 days** (or your preference)
5. Check these permissions:
   - ✅ **repo** (all checkboxes under repo)
6. Click **"Generate token"**
7. **COPY THE TOKEN** - you'll only see it once! (starts with `ghp_...`)

---

## ✅ Step 2: Push Your Code

Run this command (it will ask for your username and password):

```bash
cd /Users/abedi_dr/Library/CloudStorage/Dropbox/Website_Data/Budget_Abedi/financial-planner-public
git push -u origin main
```

**When prompted:**
- **Username**: `abedisyedaliabbas`
- **Password**: Paste your Personal Access Token (NOT your GitHub password!)

---

## ✅ Alternative: Use Token in URL

If the above doesn't work, use the token directly:

```bash
git remote set-url origin https://ghp_YOUR_TOKEN_HERE@github.com/abedisyedaliabbas/financial_planner.git
git push -u origin main
```

Replace `YOUR_TOKEN_HERE` with your actual token.

---

## ✅ Verify

After pushing, visit:
https://github.com/abedisyedaliabbas/financial_planner

You should see all your files! 🎉

---

## 🆘 Troubleshooting

### "Authentication failed"
- Make sure you're using the token (not password)
- Verify token has `repo` permissions
- Check token hasn't expired

### "Permission denied"
- Verify you have write access to the repository
- Check the repository URL is correct

