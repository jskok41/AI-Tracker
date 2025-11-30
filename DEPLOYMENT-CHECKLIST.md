# 📋 Deployment Checklist

Use this checklist to ensure a smooth deployment to Vercel.

## Pre-Deployment

- [ ] All code changes committed to Git
- [ ] Tests passing locally (if any)
- [ ] Dependencies up to date (`npm update`)
- [ ] No `.env` files in Git (check `.gitignore`)
- [ ] README.md is up to date
- [ ] Prisma schema is configured for PostgreSQL

## Vercel Setup

- [ ] Vercel account created
- [ ] Vercel CLI installed (`npm install -g vercel`)
- [ ] Logged in to Vercel (`vercel login`)
- [ ] Repository pushed to GitHub/GitLab/Bitbucket (optional but recommended)

## Initial Deployment

- [ ] Run `vercel` to create initial deployment
- [ ] Project name confirmed
- [ ] Preview deployment successful
- [ ] Preview URL opens and shows application

## Database Setup

- [ ] Postgres database created in Vercel Dashboard
  - Go to Project → Storage → Create Database → Postgres
- [ ] Database name: `ai-benefits-tracker-db` (or your choice)
- [ ] Region selected (closest to your users)
- [ ] Environment variables automatically added
- [ ] Verify environment variables in Project → Settings → Environment Variables

## Local Database Connection

- [ ] Environment variables pulled locally (`vercel env pull .env.local`)
- [ ] `.env.local` file created successfully
- [ ] Database connection strings present in `.env.local`
- [ ] Prisma client generated (`npx prisma generate`)

## Database Migrations

- [ ] Initial migration created (`npx prisma migrate dev --name init_postgres`)
- [ ] Migration successful (no errors)
- [ ] Database schema created in Postgres
- [ ] Can connect to database via Prisma Studio (`npx prisma studio`)

## Seed Database (Optional but Recommended)

- [ ] Seed script runs successfully (`npx tsx prisma/seed.ts`)
- [ ] Sample data visible in Prisma Studio
- [ ] All tables populated with test data
  - [ ] Departments (3)
  - [ ] Users (3)
  - [ ] Projects (4)
  - [ ] KPIs and Metrics
  - [ ] ROI Calculations
  - [ ] Agent Performance Data
  - [ ] Prompts (4)
  - [ ] Risks (3)
  - [ ] Phases & Milestones
  - [ ] Alerts (3)

## Production Deployment

- [ ] Run `vercel --prod` to deploy to production
- [ ] Production deployment successful
- [ ] Production URL received
- [ ] Production URL opens and shows application

## Verification

### Homepage

- [ ] Dashboard loads (`/`)
- [ ] Metrics cards display data
- [ ] Charts render correctly
- [ ] Recent activity shows alerts
- [ ] Featured projects display

### Projects Page

- [ ] Projects list loads (`/projects`)
- [ ] Project cards display
- [ ] Project detail page works (`/projects/[id]`)
- [ ] All tabs load (Overview, Metrics, ROI, Risks, Feedback)
- [ ] Charts render on detail page

### AI Agents

- [ ] Agents page loads (`/agents`)
- [ ] Agent performance metrics display
- [ ] Agent cards show correctly
- [ ] Performance charts render

### Prompt Library

- [ ] Prompts page loads (`/prompts`)
- [ ] Prompt cards display
- [ ] Search works (if implemented)
- [ ] Tags show correctly
- [ ] Usage metrics display

### Risk Management

- [ ] Risks page loads (`/risks`)
- [ ] Risk matrix displays
- [ ] Risk cards show with correct severity
- [ ] Status badges display correctly

### Roadmap

- [ ] Roadmap page loads (`/roadmap`)
- [ ] Timeline displays
- [ ] Phases show in order
- [ ] Milestones display
- [ ] Progress bars render
- [ ] Current phase highlighted

### Reports

- [ ] Reports page loads (`/reports`)
- [ ] Executive summary displays
- [ ] Project reports show
- [ ] Report templates visible

### API Routes

- [ ] `/api/dashboard/summary` returns data
- [ ] `/api/projects` returns projects list
- [ ] `/api/projects/[id]` returns project details
- [ ] `/api/metrics` returns metrics data
- [ ] `/api/roi` returns ROI calculations
- [ ] `/api/risks` returns risk assessments
- [ ] `/api/agents` returns agent performance
- [ ] `/api/prompts` returns prompts
- [ ] `/api/roadmap` returns roadmap data
- [ ] `/api/alerts` returns alerts

### Navigation

- [ ] Sidebar navigation works
- [ ] All menu items clickable
- [ ] Active page highlighted
- [ ] Responsive on mobile
- [ ] Header search visible
- [ ] Notifications dropdown works
- [ ] User menu dropdown works

### Performance

- [ ] Page load time < 3 seconds
- [ ] Images load correctly
- [ ] No console errors in browser
- [ ] No 404 errors in Network tab
- [ ] API responses < 1 second

## Post-Deployment

### Optional Enhancements

- [ ] Custom domain configured
  - Project → Settings → Domains → Add Domain
- [ ] SSL certificate active (automatic with Vercel)
- [ ] Analytics enabled (Vercel Analytics)
- [ ] Speed Insights enabled
- [ ] Error tracking setup (Sentry, etc.)

### Monitoring

- [ ] Vercel Analytics enabled
- [ ] Function logs reviewed (no errors)
- [ ] Database usage checked
- [ ] Set up alerts for:
  - [ ] Downtime
  - [ ] High error rate
  - [ ] Database connection issues

### Documentation

- [ ] Deployment documented
- [ ] Environment variables documented
- [ ] Team members have access
- [ ] Deployment process documented for team

### Security

- [ ] Environment variables secure (not in code)
- [ ] `.env.local` in `.gitignore`
- [ ] Database credentials not exposed
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] No sensitive data in client-side code

### Backup & Recovery

- [ ] Database backup strategy planned
- [ ] Recovery procedure documented
- [ ] Rollback procedure tested (promote previous deployment)

## CI/CD (Optional)

- [ ] GitHub Actions workflow configured (`.github/workflows/deploy.yml`)
- [ ] Vercel secrets added to GitHub:
  - [ ] `VERCEL_TOKEN`
  - [ ] `VERCEL_ORG_ID`
  - [ ] `VERCEL_PROJECT_ID`
- [ ] Automatic deployments working
- [ ] PR previews working

## Cost Management

- [ ] Usage limits understood
  - Vercel Hobby: 100GB bandwidth, 100GB-hours compute
  - Postgres: 256MB storage, 60 hours compute
- [ ] Usage monitoring enabled
- [ ] Alerts set for approaching limits
- [ ] Optimization plan in place if needed

## Team Handoff

- [ ] Deployment credentials shared securely
- [ ] Documentation provided to team
- [ ] Training conducted (if needed)
- [ ] Support contact information provided
- [ ] Maintenance schedule established

## Final Checks

- [ ] All features working in production
- [ ] No critical errors in logs
- [ ] Database is accessible
- [ ] Application is performant
- [ ] Users can access the application
- [ ] Deployment URL shared with stakeholders

---

## 🎉 Deployment Complete!

**Production URL:** `https://your-project.vercel.app`

**Dashboard:** [Vercel Dashboard](https://vercel.com/dashboard)

**Database:** Prisma Studio via `npx prisma studio`

**Logs:** `vercel logs` or Vercel Dashboard → Functions → Logs

---

## Quick Commands Reference

```bash
# Deploy
vercel --prod

# View logs
vercel logs

# Pull env vars
vercel env pull

# Open in browser
vercel open

# Database GUI
npx prisma studio

# Seed database
npx tsx prisma/seed.ts

# Run migrations
npx prisma migrate deploy
```

---

## Need Help?

- 📖 [DEPLOYMENT.md](./DEPLOYMENT.md) - Detailed deployment guide
- ⚡ [QUICK-START-VERCEL.md](./QUICK-START-VERCEL.md) - Quick reference
- 🌐 [Vercel Documentation](https://vercel.com/docs)
- 💾 [Prisma Documentation](https://www.prisma.io/docs)

---

**Date Deployed:** _______________  
**Deployed By:** _______________  
**Production URL:** _______________

