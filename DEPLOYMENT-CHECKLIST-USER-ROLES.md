# Deployment Checklist - User Access Control Feature

## Pre-Deployment Steps

### 1. Database Migration
Before deploying, you need to run the database migration to add the new UserRole enum and ProjectMember table:

**For Production Database:**
```bash
# Connect to your production database and run:
npx prisma migrate deploy
```

**Or use Prisma Studio:**
```bash
npx prisma studio
# Then manually update the schema
```

**Important:** The migration will:
- Add `UserRole` enum (ADMIN, MEMBER, GUEST)
- Update `User.role` field to use enum with default GUEST
- Create `ProjectMember` table for project-level access control

### 2. Set Initial Admin User

After migration, set at least one user as ADMIN:

```sql
-- Replace 'your-admin-email@example.com' with your admin email
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-admin-email@example.com';
```

### 3. Update Existing Users

Set existing users to appropriate roles:

```sql
-- Option A: Set all existing users to MEMBER (if they should have edit access)
UPDATE "User" SET role = 'MEMBER' WHERE role IS NULL OR role NOT IN ('ADMIN', 'MEMBER', 'GUEST');

-- Option B: Set all existing users to GUEST (most secure)
UPDATE "User" SET role = 'GUEST' WHERE role IS NULL OR role NOT IN ('ADMIN', 'MEMBER', 'GUEST');
```

## Deployment Steps

### 1. Verify Environment Variables

Ensure these are set in Vercel:
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- Email configuration (if using email features)

### 2. Deploy to Vercel

```bash
cd ai-benefits-tracker
vercel --prod
```

The build process will:
1. Generate Prisma client
2. Push database schema changes (`prisma db push`)
3. Build Next.js application

### 3. Verify Deployment

After deployment, test:

1. **Settings Page Access**
   - Navigate to `/settings`
   - Should load without errors
   - Admin users should see "User Access Control" section
   - Member users should see "Project Member Assignment" section

2. **Role Assignment (Admin)**
   - Go to Settings
   - Change a user's role
   - Verify role updates correctly

3. **Project Member Assignment**
   - Go to Settings
   - Find a project you own
   - Click "Manage Members"
   - Add a member
   - Verify member can edit the project

4. **Permission Enforcement**
   - Login as GUEST user
   - Verify edit buttons are hidden
   - Verify cannot create projects
   - Verify cannot edit projects

## Post-Deployment

### 1. Set Admin Users

If you haven't already, set admin users:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email IN ('admin1@example.com', 'admin2@example.com');
```

### 2. Assign Project Members

For existing projects, assign members as needed:
- Go to Settings page
- Find project
- Click "Manage Members"
- Add team members

### 3. Monitor Logs

Check Vercel logs for any errors:
```bash
vercel logs
```

## Rollback Plan

If issues occur:

1. **Revert Code:**
   ```bash
   git revert <commit-hash>
   vercel --prod
   ```

2. **Database Rollback:**
   - Restore from backup if needed
   - Or manually revert schema changes

## Troubleshooting

### Issue: "Invalid enum value"
**Solution:** Ensure all users have valid roles (ADMIN, MEMBER, or GUEST)

### Issue: Settings page shows errors
**Solution:** 
- Check database connection
- Verify Prisma client is generated
- Check Vercel logs for errors

### Issue: Users can't edit projects
**Solution:**
- Verify user role is MEMBER or ADMIN (not GUEST)
- Check if user owns the project or is assigned as member
- Verify permissions are checked server-side

### Issue: Migration fails
**Solution:**
- Check database connection
- Verify schema is correct
- Try `prisma db push` instead of migrate

## Files Changed

- `prisma/schema.prisma` - Added UserRole enum and ProjectMember model
- `lib/permissions.ts` - Updated permission functions
- `lib/hooks/use-permissions.ts` - Updated client hooks
- `lib/actions.ts` - Added permission checks
- `lib/auth-actions.ts` - Default to GUEST role
- `app/(dashboard)/settings/page.tsx` - New settings page
- `components/settings/settings-page-client.tsx` - Settings UI
- `app/api/users/route.ts` - User management API
- `app/api/projects/[id]/members/route.ts` - Project member API
- `components/dashboard/sidebar.tsx` - Added Settings link

## Success Criteria

✅ Settings page loads without errors
✅ Admin can view and change user roles
✅ Project owners can assign members
✅ Members can edit their assigned projects
✅ Guests have view-only access
✅ All permission checks work correctly

