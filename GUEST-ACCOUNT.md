# Guest Account - View-Only Access

This document explains how to create and use a Guest account with view-only access to the AI Benefits Tracker.

## Overview

Guest accounts have **view-only access** - they can browse and view all data but cannot:
- Create new projects, prompts, or risks
- Edit existing projects, prompts, or risks
- Delete any data
- Update project status

## Creating a Guest Account

### Option 1: Using the Script (Recommended)

Run the provided script to create a guest account:

```bash
cd ai-benefits-tracker
npx tsx scripts/create-guest-account.ts
```

This will create a guest account with:
- **Email**: `guest@example.com`
- **Password**: `guest123`
- **Role**: `GUEST`

### Option 2: Custom Credentials

You can customize the guest account credentials using environment variables:

```bash
GUEST_EMAIL=guest@yourcompany.com \
GUEST_PASSWORD=your-secure-password \
GUEST_NAME="Guest User" \
npx tsx scripts/create-guest-account.ts
```

### Option 3: Manual Creation via Registration

1. Go to `/auth/register`
2. Fill in the registration form
3. Set the **Role** field to `GUEST` (if available in the UI)
4. Complete registration

## Login as Guest

1. Navigate to `/auth/login`
2. Enter the guest account credentials:
   - Email: `guest@example.com` (or your custom email)
   - Password: `guest123` (or your custom password)
3. Click "Sign In"

## What Guest Users Can Do

✅ **View Access:**
- Browse all projects, prompts, and risks
- View project details, metrics, and ROI calculations
- View prompt library and risk assessments
- Access reports and dashboards
- View all data in read-only mode

❌ **Restricted Actions:**
- Cannot create new projects, prompts, or risks
- Cannot edit any existing data
- Cannot delete any data
- Edit buttons are hidden in the UI
- Server actions will return permission errors if attempted

## Technical Implementation

### Permission Checks

The system uses role-based access control:

1. **Server Actions**: All create, update, and delete actions check permissions using `canEdit()` from `lib/permissions.ts`
2. **UI Components**: Edit/create/delete buttons are conditionally rendered based on `useCanEdit()` hook
3. **Role Storage**: User role is stored in the `User.role` field in the database

### Files Modified

- `lib/permissions.ts` - Server-side permission checks
- `lib/hooks/use-permissions.ts` - Client-side permission hooks
- `lib/actions.ts` - All server actions now check permissions
- UI components updated to hide edit buttons for guests:
  - `components/dashboard/projects-list.tsx`
  - `components/dashboard/prompts-list.tsx`
  - `components/dashboard/risks-list.tsx`
  - `components/dashboard/conditional-*.tsx` - Conditional button wrappers

## Security Notes

- Guest accounts are regular user accounts with `role = 'GUEST'`
- Permission checks are enforced at both UI and server levels
- Server actions will reject unauthorized requests even if UI is bypassed
- Guest users can still log in and access the application normally

## Troubleshooting

### Guest account cannot log in
- Verify the account exists: Check database `User` table
- Verify password: Use the script to reset password
- Check role: Ensure `role` field is set to `GUEST`

### Guest can see edit buttons
- Clear browser cache and refresh
- Verify session role is `GUEST` (check browser dev tools → Application → Cookies)
- Check that `useCanEdit()` hook is working correctly

### Permission errors when trying to edit
- This is expected behavior for guest accounts
- Error messages will indicate "Guest users have view-only access"

## Example Usage

```typescript
// Server-side permission check
import { canEdit } from '@/lib/permissions';

export async function createProject(formData: FormData) {
  if (!(await canEdit())) {
    return { success: false, error: 'Guest users have view-only access.' };
  }
  // ... rest of the function
}

// Client-side permission check
import { useCanEdit } from '@/lib/hooks/use-permissions';

export function MyComponent() {
  const canEdit = useCanEdit();
  
  return (
    <>
      {canEdit && <Button>Edit</Button>}
    </>
  );
}
```
