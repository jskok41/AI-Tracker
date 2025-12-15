# Email Configuration Troubleshooting Guide

## Common Error: "Invalid login: 535-5.7.8 Username and Password not accepted"

This error occurs when Gmail SMTP authentication fails. Here's how to fix it:

### Root Cause
The error indicates that your `EMAIL_SERVER_USER` or `EMAIL_SERVER_PASSWORD` environment variables are incorrect.

### Solution: Use Gmail App Password

**You CANNOT use your regular Gmail password.** Gmail requires an "App Password" for SMTP authentication.

### Step-by-Step Fix:

#### 1. Enable 2-Step Verification
1. Go to https://myaccount.google.com/security
2. Under "Signing in to Google", click **2-Step Verification**
3. Follow the prompts to enable it (if not already enabled)

#### 2. Generate App Password
1. Go to https://myaccount.google.com/apppasswords
   - Or search for "App passwords" in your Google Account settings
2. Select **Mail** as the app
3. Select **Other (Custom name)** as the device
4. Enter a name like "AI Benefits Tracker"
5. Click **Generate**
6. Copy the 16-character password (remove any spaces)

#### 3. Update Environment Variables

**For Local Development (.env.local):**
```bash
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-16-character-app-password
EMAIL_FROM=noreply@your-app.com
```

**For Vercel Deployment:**
1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Update these variables:
   - `EMAIL_SERVER_USER` = Your Gmail address (e.g., `your-email@gmail.com`)
   - `EMAIL_SERVER_PASSWORD` = The 16-character App Password (no spaces)
   - `EMAIL_SERVER_HOST` = `smtp.gmail.com`
   - `EMAIL_SERVER_PORT` = `587`
   - `EMAIL_FROM` = `noreply@your-app.com` (or your Gmail address)

#### 4. Important Notes

- ✅ **DO use**: The 16-character App Password from Google
- ❌ **DON'T use**: Your regular Gmail password
- ✅ **DO use**: Your full Gmail address (e.g., `your-email@gmail.com`) for `EMAIL_SERVER_USER`
- ❌ **DON'T use**: Just the username part (e.g., `your-email`)

#### 5. Test Your Configuration

After updating your environment variables:

1. **Restart your development server** (if testing locally)
2. **Redeploy** (if on Vercel)
3. Try the password reset flow again

### Alternative: Use a Different Email Provider

If you prefer not to use Gmail, you can use other SMTP providers:

**SendGrid:**
```bash
EMAIL_SERVER_HOST=smtp.sendgrid.net
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=apikey
EMAIL_SERVER_PASSWORD=your-sendgrid-api-key
```

**Mailgun:**
```bash
EMAIL_SERVER_HOST=smtp.mailgun.org
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-mailgun-username
EMAIL_SERVER_PASSWORD=your-mailgun-password
```

**AWS SES:**
```bash
EMAIL_SERVER_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-aws-access-key
EMAIL_SERVER_PASSWORD=your-aws-secret-key
```

### Still Having Issues?

1. **Check your environment variables are loaded:**
   - Verify they're set correctly in your `.env.local` file
   - Make sure you've restarted your dev server after changes
   - For Vercel, ensure variables are set for the correct environment (Production/Preview/Development)

2. **Verify App Password is correct:**
   - Generate a new App Password if unsure
   - Make sure there are no extra spaces or characters

3. **Check Gmail account status:**
   - Ensure 2-Step Verification is enabled
   - Make sure "Less secure app access" is NOT needed (App Passwords replace this)

4. **Review server logs:**
   - Check console output for detailed error messages
   - Look for any additional context about the authentication failure
