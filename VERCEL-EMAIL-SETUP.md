# 🔧 Fix Email Error - Vercel Setup Guide

## The Error You're Seeing
"Invalid email credentials. Please check your EMAIL_SERVER_USER and EMAIL_SERVER_PASSWORD environment variables."

## ✅ Quick Fix (5 Minutes)

### Step 1: Generate Gmail App Password

1. **Go to**: https://myaccount.google.com/apppasswords
   - If you don't see this page, enable 2-Step Verification first:
   - Go to: https://myaccount.google.com/security
   - Click "2-Step Verification" and follow the prompts

2. **Generate App Password**:
   - Select **"Mail"** as the app
   - Select **"Other (Custom name)"** as the device
   - Enter name: `AI Benefits Tracker`
   - Click **"Generate"**
   - **Copy the 16-character password** (it looks like: `abcd efgh ijkl mnop`)
   - **Remove all spaces** - you need: `abcdefghijklmnop`

### Step 2: Set Environment Variables in Vercel

1. **Go to Vercel Dashboard**:
   - Visit: https://vercel.com/justins-projects-4264a4ab/ai-benefits-tracker/settings/environment-variables
   - Or: Vercel Dashboard → Your Project → Settings → Environment Variables

2. **Add/Update These Variables**:

   | Variable Name | Value | Example |
   |--------------|-------|---------|
   | `EMAIL_SERVER_HOST` | `smtp.gmail.com` | `smtp.gmail.com` |
   | `EMAIL_SERVER_PORT` | `587` | `587` |
   | `EMAIL_SERVER_USER` | Your full Gmail address | `your-email@gmail.com` |
   | `EMAIL_SERVER_PASSWORD` | Your 16-char App Password | `abcdefghijklmnop` |
   | `EMAIL_FROM` | Email sender address | `noreply@your-app.com` |

3. **Important Settings**:
   - Set environment to: **Production** (and Preview if you want)
   - Make sure there are **NO SPACES** in the App Password
   - Use your **FULL EMAIL ADDRESS** (with @gmail.com), not just username

### Step 3: Redeploy

After setting environment variables, you need to redeploy:

**Option 1: Via Vercel Dashboard**
1. Go to your project's Deployments tab
2. Click the "..." menu on the latest deployment
3. Click "Redeploy"

**Option 2: Via CLI**
```bash
cd "/Users/justin/Cursor Projects/Research and Track AI Benefits/ai-benefits-tracker"
vercel --prod
```

### Step 4: Verify Configuration

After redeploying, you can check your email configuration by visiting:
```
https://your-app.vercel.app/api/email/diagnose
```

This will show you:
- ✅ Which environment variables are set
- ⚠️ Any configuration issues
- 💡 Recommendations to fix problems

## ⚠️ Common Mistakes

1. ❌ **Using regular Gmail password** → ✅ Must use App Password
2. ❌ **Including spaces in App Password** → ✅ Remove all spaces (16 chars total)
3. ❌ **Using username only** (e.g., `your-email`) → ✅ Use full email (`your-email@gmail.com`)
4. ❌ **Not redeploying after changes** → ✅ Must redeploy for changes to take effect
5. ❌ **Setting variables for wrong environment** → ✅ Set for Production environment

## 🧪 Test After Setup

1. Visit your app: https://ai-benefits-tracker-f69jwq39v-justins-projects-4264a4ab.vercel.app
2. Go to "Forgot password?"
3. Enter your email
4. Check your email inbox for the reset link

## 📋 Checklist

- [ ] 2-Step Verification enabled on Google account
- [ ] Gmail App Password generated (16 characters)
- [ ] `EMAIL_SERVER_HOST` set to `smtp.gmail.com`
- [ ] `EMAIL_SERVER_PORT` set to `587`
- [ ] `EMAIL_SERVER_USER` set to full Gmail address
- [ ] `EMAIL_SERVER_PASSWORD` set to App Password (no spaces)
- [ ] `EMAIL_FROM` set
- [ ] Environment variables set for Production
- [ ] Project redeployed after setting variables
- [ ] Tested password reset flow

## 🆘 Still Having Issues?

1. **Check Vercel Logs**:
   - Go to: Vercel Dashboard → Your Project → Deployments → Latest → Logs
   - Look for email-related errors

2. **Verify Environment Variables**:
   - Visit: `/api/email/diagnose` on your deployed app
   - This will show what's configured

3. **Generate New App Password**:
   - Sometimes regenerating helps
   - Make sure to update `EMAIL_SERVER_PASSWORD` with the new one

4. **Check Gmail Account**:
   - Ensure 2-Step Verification is enabled
   - Make sure account isn't locked or restricted

## 📚 More Help

- See `EMAIL-TROUBLESHOOTING.md` for detailed troubleshooting
- See `FIX-PASSWORD-RESET.md` for quick reference
