# Deployment Guide - Roadmap Auto-Tracking

## Pre-Deployment Checklist

✅ **Schema Changes**: New fields added to Phase model and history models created
✅ **Migration File**: Created at `prisma/migrations/20250101000000_add_roadmap_auto_tracking/migration.sql`
✅ **Prisma Client**: Generated successfully
✅ **Code Changes**: All services and API routes updated

## Deployment Steps

### 1. Database Migration

**For Production (Vercel/Production):**
```bash
npx prisma migrate deploy
```

**For Development:**
```bash
npx prisma migrate dev
```

**Alternative (if migrations fail):**
```bash
npx prisma db push
```

The migration adds:
- `lastAutoCalculatedAt`, `autoCalculatedProgress`, `delayReason` fields to Phase table
- `PhaseHistory` table for audit trail
- `MilestoneHistory` table for milestone tracking

### 2. Environment Variables

Ensure these are set in your deployment environment:

```bash
# Database (already configured)
POSTGRES_PRISMA_URL=your_connection_string
POSTGRES_URL_NON_POOLING=your_direct_connection_string

# Optional: For cron job security
CRON_SECRET=your-secret-key-here
```

### 3. Build & Deploy

The build process will:
1. Generate Prisma Client (`prisma generate`)
2. Build Next.js application (`next build`)

**Vercel Deployment:**
- Push to your repository
- Vercel will automatically run `vercel-build` script
- The script includes `prisma db push` for schema sync

**Manual Deployment:**
```bash
npm run build
npm start
```

### 4. Verify Deployment

After deployment, verify:

1. **Database Schema**: Check that new tables exist:
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'Phase' 
   AND column_name IN ('lastAutoCalculatedAt', 'autoCalculatedProgress', 'delayReason');
   
   SELECT * FROM information_schema.tables 
   WHERE table_name IN ('PhaseHistory', 'MilestoneHistory');
   ```

2. **API Endpoints**: Test the new endpoints:
   - `POST /api/milestones` - Create milestone
   - `PATCH /api/milestones/[id]` - Update milestone
   - `DELETE /api/milestones/[id]` - Delete milestone
   - `GET /api/cron/roadmap-sync` - Manual sync trigger

3. **Auto-Calculation**: 
   - Create a phase with milestones
   - Mark a milestone as completed
   - Verify phase progress updates automatically

4. **Cron Job**: Verify cron job is configured in Vercel dashboard:
   - Path: `/api/cron/roadmap-sync`
   - Schedule: `0 0 * * *` (daily at midnight UTC)

## Post-Deployment

### Initial Data Sync

For existing projects with phases and milestones, run a one-time sync:

```bash
# Via API (if you have a sync endpoint)
curl -X POST https://your-domain.com/api/roadmap/sync-all

# Or manually via Prisma Studio
npx prisma studio
```

### Monitoring

Monitor these areas:
- **Alert Creation**: Check that alerts are created for delays
- **Progress Updates**: Verify progress calculates correctly
- **Status Changes**: Ensure status updates based on rules
- **Cron Job**: Check Vercel logs for cron job execution

## Rollback Plan

If issues occur:

1. **Revert Code**: Revert to previous commit
2. **Database Rollback**: 
   ```sql
   -- Remove new columns
   ALTER TABLE "Phase" DROP COLUMN IF EXISTS "lastAutoCalculatedAt";
   ALTER TABLE "Phase" DROP COLUMN IF EXISTS "autoCalculatedProgress";
   ALTER TABLE "Phase" DROP COLUMN IF EXISTS "delayReason";
   
   -- Drop new tables
   DROP TABLE IF EXISTS "MilestoneHistory";
   DROP TABLE IF EXISTS "PhaseHistory";
   ```

## Troubleshooting

### Migration Fails

**Error**: "Migration failed to apply"
- **Solution**: Use `prisma db push` instead of migrations
- Check database connection string
- Verify database permissions

### Build Fails

**Error**: "Cannot find module"
- **Solution**: Run `npm install` and `npx prisma generate`
- Clear `.next` folder: `rm -rf .next`
- Rebuild: `npm run build`

### Auto-Calculation Not Working

**Check**:
1. Verify API routes are calling `recalculatePhase()`
2. Check server logs for errors
3. Verify milestones have `isCompleted` field set correctly
4. Ensure phase has milestones before testing

### Cron Job Not Running

**Check**:
1. Verify `vercel.json` has cron configuration
2. Check Vercel dashboard for cron job status
3. Verify `CRON_SECRET` is set if using auth
4. Test manually: `curl https://your-domain.com/api/cron/roadmap-sync`

## Support

For issues or questions:
- Check `ROADMAP_AUTO_TRACKING_IMPLEMENTATION.md` for feature details
- Review API route implementations in `app/api/`
- Check service logic in `lib/services/`
