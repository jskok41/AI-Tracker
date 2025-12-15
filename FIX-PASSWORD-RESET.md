# 🔧 Quick Fix: Password Reset Error

## The Problem
You're seeing this error: **"Invalid login: 535-5.7.8 Username and Password not accepted"**

This means your Gmail SMTP credentials are incorrect.

## ✅ Quick Fix (5 minutes)

### Step 1: Generate Gmail App Password

1. **Go to**: https://myaccount.google.com/apppasswords
   - If you don't see this page, enable 2-Step Verification first at: https://myaccount.google.com/security

2. **Generate App Password**:
   - Select **"Mail"** as the app
   - Select **"Other (Custom name)"** as the device
   - Enter name: `AI Benefits Tracker`
   - Click **"Generate"**
   - **Copy the 16-character password** (it looks like: `abcd efgh ijkl mnop`)

### Step 2: Update Environment Variables

**If testing locally** (`.env.local` file):
```bash
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=abcdefghijklmnop
EMAIL_FROM=noreply@your-app.com
```

**If deployed on Vercel**:
1. Go to: https://vercel.com/your-project/settings/environment-variables
2. Update or add these variables:
   - `EMAIL_SERVER_USER` = Your full Gmail address (e.g., `your-email@gmail.com`)
   - `EMAIL_SERVER_PASSWORD` = The 16-character App Password (remove spaces!)
   - `EMAIL_SERVER_HOST` = `smtp.gmail.com`
   - `EMAIL_SERVER_PORT` = `587`
   - `EMAIL_FROM` = `noreply@your-app.com`

### Step 3: Test Configuration

**Local testing:**
```bash
npm run test:email
```

This will verify your email configuration is correct.

**After updating Vercel:**
1. Redeploy your app (or wait for next deployment)
2. Try password reset again

## ⚠️ Common Mistakes

1. ❌ **Using regular Gmail password** → ✅ Must use App Password
2. ❌ **Using username only** (e.g., `your-email`) → ✅ Must use full email (`your-email@gmail.com`)
3. ❌ **Including spaces in App Password** → ✅ Remove all spaces (16 chars total)
4. ❌ **Not restarting server** → ✅ Restart dev server or redeploy after changes

## 🧪 Test Your Configuration

Run this command to test your email setup:
```bash
npm run test:email
```

This will:
- ✅ Check all environment variables are set
- ✅ Validate Gmail configuration
- ✅ Test SMTP connection
- ✅ Show helpful error messages if something's wrong

## 📚 More Help

See `EMAIL-TROUBLESHOOTING.md` for detailed troubleshooting steps.
