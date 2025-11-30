# Deployment Guide - Vercel Postgres

This guide will walk you through deploying the AI Benefits Tracker to Vercel with Postgres database.

## Prerequisites

- Git repository (GitHub, GitLab, or Bitbucket)
- Vercel account (free tier available)
- Node.js 18+ installed locally

## Step-by-Step Deployment

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate with your Vercel account.

### 3. Initialize Git Repository (if not already done)

```bash
cd "/Users/justin/Cursor Projects/Research and Track AI Benefits/ai-benefits-tracker"
git init
git add .
git commit -m "Initial commit: AI Benefits Tracker"
```

### 4. Push to GitHub (Recommended)

Create a new repository on GitHub, then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/ai-benefits-tracker.git
git branch -M main
git push -u origin main
```

### 5. Deploy to Vercel

Option A: **Via Vercel Dashboard** (Recommended)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Configure project:
   - Framework Preset: **Next.js**
   - Build Command: (leave default or use `npm run vercel-build`)
   - Output Directory: `.next`
4. Click **Deploy**

Option B: **Via CLI**

```bash
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- Project name? **ai-benefits-tracker**
- In which directory is your code located? **./**
- Want to override settings? **N**

### 6. Add Postgres Database

1. Go to your project in [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on the **Storage** tab
3. Click **Create Database**
4. Select **Postgres**
5. Name your database: `ai-benefits-tracker-db`
6. Select region (closest to your users)
7. Click **Create**

**Important:** Vercel will automatically add these environment variables to your project:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NO_SSL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

### 7. Pull Environment Variables Locally

```bash
vercel env pull .env.local
```

This downloads all environment variables from Vercel to your local `.env.local` file.

### 8. Create Database Schema

The migrations will run automatically on Vercel, but for local development:

```bash
npx prisma migrate dev --name init_postgres
```

If you get an error about the database not existing, use:

```bash
npx prisma db push
```

### 9. Generate Prisma Client

```bash
npx prisma generate
```

### 10. Seed the Database (Optional but Recommended)

To populate your production database with sample data:

```bash
# Make sure you're using production environment variables
npx tsx prisma/seed.ts
```

Or connect via Prisma Studio and seed manually:

```bash
npx prisma studio
```

### 11. Redeploy to Production

After setting up the database:

```bash
vercel --prod
```

Or trigger a redeploy from the Vercel dashboard.

## Environment Variables Reference

Your Vercel Postgres connection strings will look like this:

```env
POSTGRES_PRISMA_URL="postgres://default:***@***-pooler.us-east-1.postgres.vercel-storage.com/verceldb?pgbouncer=true&connect_timeout=15"
POSTGRES_URL_NON_POOLING="postgres://default:***@***-pooler.us-east-1.postgres.vercel-storage.com/verceldb"
```

## Verify Deployment

1. Visit your deployment URL: `https://ai-benefits-tracker.vercel.app`
2. Check all pages load correctly:
   - Dashboard: `/`
   - Projects: `/projects`
   - AI Agents: `/agents`
   - Prompt Library: `/prompts`
   - Risk Management: `/risks`
   - Roadmap: `/roadmap`
   - Reports: `/reports`

## Post-Deployment Tasks

### 1. Custom Domain (Optional)

1. Go to your project in Vercel Dashboard
2. Click **Settings** → **Domains**
3. Add your custom domain
4. Follow DNS configuration instructions

### 2. Enable Analytics (Optional)

1. In Vercel Dashboard, go to **Analytics**
2. Enable Web Analytics
3. Add Vercel Analytics to your app:

```bash
npm install @vercel/analytics
```

Update `app/layout.tsx`:

```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 3. Monitor Performance

1. Check **Speed Insights** in Vercel Dashboard
2. Review **Function Logs** for any errors
3. Set up **Alerts** for downtime

## Database Management

### View Database via Prisma Studio

```bash
npx prisma studio
```

### Run Migrations

```bash
npx prisma migrate deploy
```

### Backup Database

```bash
# Connect to your Vercel Postgres
psql $POSTGRES_URL

# Backup
pg_dump $POSTGRES_URL > backup.sql

# Restore
psql $POSTGRES_URL < backup.sql
```

## Troubleshooting

### Build Fails

**Error:** `Can't reach database server`

**Solution:** Ensure Postgres database is created and environment variables are set in Vercel.

---

**Error:** `Prisma schema validation failed`

**Solution:** Run `prisma generate` and `prisma migrate deploy`

---

### Database Connection Issues

**Error:** `Connection timeout`

**Solution:** 
1. Check if database region matches deployment region
2. Verify environment variables are correctly set
3. Use connection pooling URL (`POSTGRES_PRISMA_URL`)

---

### Migrations Not Running

**Solution:** Manually trigger migration:

```bash
# Via Vercel CLI with environment
vercel env pull
npx prisma migrate deploy
vercel --prod
```

---

### Seed Data Not Loading

**Solution:** Run seed script with production environment:

```bash
# Make sure .env.local has production credentials
npx tsx prisma/seed.ts
```

## Local Development with Vercel Postgres

To develop locally using your Vercel Postgres database:

1. Pull environment variables:
   ```bash
   vercel env pull .env.local
   ```

2. Run migrations:
   ```bash
   npx prisma migrate dev
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

## Rollback Procedure

If you need to rollback:

1. Go to Vercel Dashboard → Deployments
2. Find the previous working deployment
3. Click the three dots (⋯) menu
4. Select "Promote to Production"

## Cost Optimization

- Vercel Free Tier: 100GB bandwidth, 100GB-hours compute
- Postgres Free Tier: 256MB storage, 60 hours compute
- Monitor usage in Vercel Dashboard
- Optimize queries and add indexes for better performance

## Support

- Vercel Documentation: https://vercel.com/docs
- Prisma Documentation: https://www.prisma.io/docs
- Next.js Documentation: https://nextjs.org/docs

## Quick Commands Reference

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Pull environment variables
vercel env pull

# View logs
vercel logs

# Open project in browser
vercel open

# View deployment info
vercel inspect

# Database operations
npx prisma studio          # Open database GUI
npx prisma migrate deploy  # Run migrations
npx tsx prisma/seed.ts     # Seed database
npx prisma db push         # Push schema without migration
```

## Security Checklist

- ✅ Environment variables are set in Vercel (not in code)
- ✅ `.env.local` is in `.gitignore`
- ✅ Database credentials are not exposed
- ✅ CORS is properly configured (if needed)
- ✅ Rate limiting is implemented (if needed)
- ✅ SQL injection protection (Prisma handles this)

## Next Steps

1. ✅ Deploy application to Vercel
2. ✅ Set up Postgres database
3. ✅ Run migrations and seed data
4. ⬜ Configure custom domain
5. ⬜ Set up monitoring and alerts
6. ⬜ Enable analytics
7. ⬜ Add authentication (e.g., NextAuth.js)
8. ⬜ Set up CI/CD pipeline
9. ⬜ Configure backup strategy
10. ⬜ Document API endpoints

---

🎉 **Congratulations!** Your AI Benefits Tracker is now deployed and live on Vercel!

