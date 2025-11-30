# 🚀 Quick Start - Deploy to Vercel

## One-Line Deploy

```bash
./deploy-to-vercel.sh
```

Or manually:

```bash
npm install -g vercel && vercel login && vercel
```

## Step-by-Step (5 Minutes)

### 1. Deploy Application
```bash
vercel
```

### 2. Add Postgres Database
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Click **Storage** → **Create Database** → **Postgres**
4. Click **Create**

### 3. Connect Database Locally
```bash
vercel env pull .env.local
```

### 4. Setup Database Schema
```bash
npx prisma migrate dev --name init_postgres
npx tsx prisma/seed.ts
```

### 5. Deploy to Production
```bash
vercel --prod
```

## ✅ Done!

Your app is live at: `https://your-project.vercel.app`

## Useful Commands

| Command | Description |
|---------|-------------|
| `vercel` | Deploy to preview |
| `vercel --prod` | Deploy to production |
| `vercel env pull` | Pull environment variables |
| `vercel logs` | View deployment logs |
| `vercel open` | Open project in browser |
| `npx prisma studio` | Open database GUI |
| `npm run db:seed` | Seed database |

## Environment Variables

Vercel automatically provides these when you add Postgres:

- ✅ `POSTGRES_PRISMA_URL` - Connection pooling URL (use this)
- ✅ `POSTGRES_URL_NON_POOLING` - Direct connection URL (for migrations)
- ✅ `POSTGRES_URL` - Standard connection URL
- ✅ `POSTGRES_USER`, `POSTGRES_HOST`, `POSTGRES_PASSWORD`, `POSTGRES_DATABASE`

## Troubleshooting

**Issue:** Build fails with "Can't reach database server"
```bash
# Solution: Wait for Postgres to be fully provisioned, then redeploy
vercel --prod
```

**Issue:** Prisma migrations not running
```bash
# Solution: Run migrations manually
vercel env pull .env.local
npx prisma migrate deploy
vercel --prod
```

**Issue:** No data showing up
```bash
# Solution: Seed the database
vercel env pull .env.local
npx tsx prisma/seed.ts
```

## What Gets Deployed

✅ Next.js application  
✅ API routes  
✅ Database schema (via migrations)  
✅ Static assets  

❌ SQLite database (replaced with Postgres)  
❌ `.env.local` (use Vercel environment variables)  
❌ `node_modules` (installed by Vercel)  

## Cost

- **Vercel Hobby Plan**: FREE
  - 100GB bandwidth/month
  - Unlimited deployments
  - Automatic HTTPS
  - Global CDN

- **Vercel Postgres**: FREE tier includes
  - 256 MB storage
  - 60 hours compute/month
  - Perfect for prototypes and demos

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Add Postgres database
3. ✅ Run migrations and seed data
4. 🔄 Configure custom domain (optional)
5. 🔄 Enable analytics (optional)
6. 🔄 Add authentication (optional)

## Support

- Full documentation: [DEPLOYMENT.md](./DEPLOYMENT.md)
- Vercel docs: https://vercel.com/docs
- Prisma docs: https://www.prisma.io/docs

---

**Having issues?** Check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed troubleshooting.

