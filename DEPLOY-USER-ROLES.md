# 🚀 Deploy User Access Control Feature

## Quick Deployment Guide

### Step 1: Database Migration (Required)

**Before deploying, you MUST run the database migration:**

```bash
cd ai-benefits-tracker

# For production database
npx prisma migrate deploy

# OR if using db push (for Vercel Postgres)
npx prisma db push
```

**Important:** This will:
- Add `UserRole` enum (ADMIN, MEMBER, GUEST)
- Update `User.role` to use enum (defaults to GUEST)
- Create `ProjectMember` table

### Step 2: Set Admin User

After migration, set at least one admin user:

```sql
-- Connect to your database and run:
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-admin-email@example.com';
```

### Step 3: Deploy to Vercel

```bash
vercel --prod
```

The `vercel-build` script will automatically:
1. Generate Prisma client
2. Push schema changes (`prisma db push`)
3. Build Next.js app

### Step 4: Verify Deployment

1. **Access Settings Page**
   - Go to `/settings`
   - Should load without errors

2. **Test Admin Features** (if you're admin)
   - See "User Access Control" section
   - Change a user's role
   - Verify it updates

3. **Test Project Member Assignment**
   - Find a project you own
   - Click "Manage Members"
   - Add a member
   - Verify member can edit project

4. **Test Guest Access**
   - Login as GUEST user
   - Verify edit buttons are hidden
   - Verify cannot create/edit projects

## What's New

### Settings Page (`/settings`)
- **Admin Section**: Manage all users and assign roles
- **Project Member Assignment**: Assign members to your projects
- **Access Level Info**: See your current role and permissions

### New Features
- ✅ Three user roles: ADMIN, MEMBER, GUEST
- ✅ Role-based access control
- ✅ Project-level permissions
- ✅ Member assignment to projects
- ✅ Default GUEST role for new users

## Environment Variables

Ensure these are set in Vercel:
- `POSTGRES_PRISMA_URL` - Database connection URL
- `POSTGRES_URL_NON_POOLING` - Direct database URL
- `NEXTAUTH_SECRET` - Auth secret
- `NEXTAUTH_URL` - Your app URL

## Troubleshooting

### Build Fails
- Check database connection
- Verify environment variables are set
- Check Vercel logs: `vercel logs`

### Settings Page Errors
- Verify database migration completed
- Check Prisma client is generated
- Verify user has valid role (ADMIN, MEMBER, or GUEST)

### Users Can't Edit Projects
- Check user role is MEMBER or ADMIN (not GUEST)
- Verify user owns project or is assigned as member
- Check server logs for permission errors

## Migration Notes

**Existing Users:**
- Users with `role = null` will default to GUEST
- Update existing users to MEMBER if they need edit access:
  ```sql
  UPDATE "User" SET role = 'MEMBER' WHERE role IS NULL;
  ```

**New Users:**
- All new registrations default to GUEST
- Admin must promote users to MEMBER or ADMIN

## Files Changed

- `prisma/schema.prisma` - Schema changes
- `lib/permissions.ts` - Permission functions
- `lib/actions.ts` - Permission checks added
- `app/(dashboard)/settings/` - New settings page
- `app/api/users/` - User management API
- `app/api/projects/[id]/members/` - Project member API

## Success! ✅

After deployment:
- Settings page accessible at `/settings`
- Admin can manage user roles
- Project owners can assign members
- Permissions enforced at all levels

**Need Help?** Check `DEPLOYMENT-CHECKLIST-USER-ROLES.md` for detailed troubleshooting.

