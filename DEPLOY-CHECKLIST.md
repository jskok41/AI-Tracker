# 🚀 Deployment Checklist

## Pre-Deployment

### ✅ Generated NextAuth Secret
Your NextAuth secret: `GrR9XyHAiC0wSB/8xLSkxqmCAnKoMJBTv3SI2/ewbOg=`

**Save this!** You'll need it for environment variables.

## Step 1: Environment Variables Setup

Before deploying, you need to set these environment variables in Vercel:

### Required Variables:

1. **NEXTAUTH_SECRET**
   - Value: `GrR9XyHAiC0wSB/8xLSkxqmCAnKoMJBTv3SI2/ewbOg=`
   - This is your authentication secret

2. **NEXTAUTH_URL**
   - Value: `https://your-app-name.vercel.app` (will be set after first deploy)
   - Or your custom domain if you have one

3. **POSTGRES_PRISMA_URL** (Auto-set by Vercel Postgres)
   - Will be automatically added when you create Postgres database

4. **POSTGRES_URL_NON_POOLING** (Auto-set by Vercel Postgres)
   - Will be automatically added when you create Postgres database

### Optional (for Email):

5. **EMAIL_SERVER_HOST**
   - Value: `smtp.gmail.com` (or your email provider)

6. **EMAIL_SERVER_PORT**
   - Value: `587`

7. **EMAIL_SERVER_USER**
   - Value: Your email address

8. **EMAIL_SERVER_PASSWORD**
   - Value: Gmail App Password (see instructions below)

9. **EMAIL_FROM**
   - Value: `noreply@your-app.com`

## Step 2: Get Gmail App Password (if using email)

1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Go to https://myaccount.google.com/apppasswords
4. Select "Mail" and generate password
5. Copy the 16-character password (remove spaces)

## Step 3: Deploy Process

1. **First Deploy** (Preview)
   ```bash
   vercel
   ```

2. **Create Postgres Database**
   - Go to Vercel Dashboard → Your Project → Storage
   - Click "Create Database" → "Postgres"
   - Wait for database to be created

3. **Pull Environment Variables**
   ```bash
   vercel env pull .env.local
   ```

4. **Run Database Migrations**
   ```bash
   npx prisma migrate deploy
   ```

5. **Set NEXTAUTH_URL** in Vercel Dashboard
   - Go to Settings → Environment Variables
   - Add `NEXTAUTH_URL` with your production URL

6. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Step 4: Create Guest Account (Optional)

After deployment, create a guest account:

```bash
# Pull production env vars
vercel env pull .env.production

# Create guest account
NODE_ENV=production npx tsx scripts/create-guest-account.ts
```

Or set environment variables manually:
```bash
GUEST_EMAIL=guest@example.com \
GUEST_PASSWORD=guest123 \
npx tsx scripts/create-guest-account.ts
```

## Post-Deployment

### Test Checklist:

- [ ] Visit your app URL
- [ ] Register a new account
- [ ] Login with credentials
- [ ] Create a new project
- [ ] Edit a project
- [ ] Delete a project
- [ ] Test guest account (if created)
- [ ] Test password reset (if email configured)

## Troubleshooting

### Build Fails
- Check Vercel logs: `vercel logs`
- Ensure all environment variables are set
- Check database connection

### Database Connection Issues
- Verify Postgres is created in Vercel Storage
- Check `POSTGRES_PRISMA_URL` is set
- Run migrations: `npx prisma migrate deploy`

### Authentication Not Working
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- Clear browser cookies and try again
