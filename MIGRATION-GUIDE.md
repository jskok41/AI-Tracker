# User Access Control Migration Guide

This guide explains how to migrate to the new user access control system with ADMIN, MEMBER, and GUEST roles.

## Overview

The system now supports three user roles:
- **ADMIN**: Full edit access, can assign user roles and manage all projects
- **MEMBER**: Can edit/add projects, but only their own projects (can assign other members to their projects)
- **GUEST**: View-only access (default for new users)

## Database Migration Steps

### 1. Create and Run Migration

```bash
cd ai-benefits-tracker
npx prisma migrate dev --name add_user_roles_and_project_members
```

This will:
- Add `UserRole` enum (ADMIN, MEMBER, GUEST)
- Update `User.role` field to use the enum with default GUEST
- Create `ProjectMember` table for project-level access control

### 2. Migrate Existing Users

After running the migration, you need to update existing users:

**Option A: Set all existing users to GUEST (recommended for security)**
```sql
UPDATE "User" SET role = 'GUEST' WHERE role IS NULL OR role NOT IN ('ADMIN', 'MEMBER', 'GUEST');
```

**Option B: Set all existing users to MEMBER (if they should have edit access)**
```sql
UPDATE "User" SET role = 'MEMBER' WHERE role IS NULL OR role NOT IN ('ADMIN', 'MEMBER', 'GUEST');
```

**Option C: Set specific users to ADMIN**
```sql
-- Replace 'admin@example.com' with your admin email
UPDATE "User" SET role = 'ADMIN' WHERE email = 'admin@example.com';
```

### 3. Verify Migration

Check that all users have valid roles:
```sql
SELECT id, email, name, role FROM "User";
```

All users should have one of: ADMIN, MEMBER, or GUEST.

## Features

### Settings Page

Access the Settings page at `/settings`:
- **Admin users**: Can see all users and assign roles
- **Member users**: Can see their own projects and assign members
- **Guest users**: Can see their access level information

### Project Member Assignment

Project owners (and admins) can assign members to their projects:
1. Go to Settings page
2. Find your project in "Project Member Assignment" section
3. Click "Manage Members"
4. Select users to add as members
5. Members can now edit that project

### Permission Checks

The system enforces permissions at multiple levels:
1. **UI Level**: Edit buttons are hidden for guests
2. **Component Level**: Dialogs check permissions before submission
3. **Server Level**: All actions check permissions before execution

## Default Behavior

- **New user registration**: Defaults to GUEST role
- **Guest users**: View-only access, cannot create or edit anything
- **Member users**: Can create projects and edit their own projects
- **Admin users**: Full access to everything

## Troubleshooting

### Users can't edit projects they own

Check:
1. User role is MEMBER or ADMIN (not GUEST)
2. User is the project owner (`ownerId` matches user ID)
3. Or user is assigned as a project member

### Admin can't change user roles

Check:
1. User is logged in as ADMIN
2. Not trying to remove their own admin role
3. Settings page is accessible at `/settings`

### Migration errors

If you encounter migration errors:
1. Check database connection
2. Ensure Prisma schema is up to date
3. Run `npx prisma generate` to regenerate Prisma client
4. Check for existing data conflicts

## Security Notes

- Guest users are enforced at both UI and server levels
- Project-level permissions are checked for all edit operations
- Admins cannot remove their own admin role (prevents lockout)
- All permission checks happen server-side for security

