# Guest Permissions Fix

## Issue
Guest users were able to create and edit projects, prompts, and risks even though they should have view-only access.

## Root Causes Found

1. **Permission Logic Bug**: The `useCanEdit()` hook was returning `true` when `role` was `null` or `undefined` because `null !== 'GUEST'` evaluates to `true`.

2. **Missing Permission Checks in Dialogs**: Dialog components (`NewProjectDialog`, `EditProjectDialog`, etc.) didn't check permissions before allowing form submission.

3. **Direct Dialog Usage**: One instance where `NewRiskDialog` was used directly instead of through the conditional wrapper.

## Fixes Applied

### 1. Fixed Permission Logic
**File**: `lib/hooks/use-permissions.ts` and `lib/permissions.ts`

**Before**:
```typescript
return session.user.role !== 'GUEST';
// This returns true if role is null/undefined!
```

**After**:
```typescript
return session.user.role !== null && 
       session.user.role !== undefined && 
       session.user.role !== 'GUEST';
// Now explicitly checks role exists and is not GUEST
```

### 2. Added Permission Checks in All Dialog Components

Added `useCanEdit()` checks in:
- ✅ `components/dashboard/new-project-dialog.tsx`
- ✅ `components/dashboard/edit-project-dialog.tsx`
- ✅ `components/dashboard/new-prompt-dialog.tsx`
- ✅ `components/dashboard/edit-prompt-dialog.tsx`
- ✅ `components/dashboard/new-risk-dialog.tsx`
- ✅ `components/dashboard/edit-risk-dialog.tsx`

Each dialog now checks permissions before:
- Form submission (create/update)
- Delete actions

### 3. Fixed Direct Dialog Usage

**File**: `app/(dashboard)/risks/page.tsx`

Changed:
```typescript
<NewRiskDialog projects={projects} users={users} />
```

To:
```typescript
<ConditionalNewRiskButton projects={projects} users={users} />
```

## Security Layers

Now there are **three layers** of protection:

1. **UI Layer**: Conditional wrappers hide buttons for guests
2. **Component Layer**: Dialogs check permissions before submission
3. **Server Layer**: Server actions check permissions (already implemented)

## Testing

To verify the fix works:

1. **Login as Guest**:
   ```bash
   # Create guest account if not exists
   GUEST_EMAIL=guest@example.com GUEST_PASSWORD=guest123 npx tsx scripts/create-guest-account.ts
   ```

2. **Test Create Actions**:
   - Try to create a project → Should show error toast
   - Try to create a prompt → Should show error toast
   - Try to create a risk → Should show error toast

3. **Test Edit Actions**:
   - Try to edit a project → Should show error toast
   - Try to edit a prompt → Should show error toast
   - Try to edit a risk → Should show error toast

4. **Test Delete Actions**:
   - Try to delete a project → Should show error toast
   - Try to delete a prompt → Should show error toast
   - Try to delete a risk → Should show error toast

5. **Verify UI**:
   - "New Project" button should not appear
   - "New Prompt" button should not appear
   - "New Risk" button should not appear
   - Edit buttons on cards should not appear

## Error Messages

Guests will now see clear error messages:
- "You do not have permission to create projects. Guest users have view-only access."
- "You do not have permission to update projects. Guest users have view-only access."
- "You do not have permission to delete projects. Guest users have view-only access."

(Similar messages for prompts and risks)

## Deployment

After deploying these changes:
1. Guest users will be properly restricted
2. All create/edit/delete actions will be blocked
3. Clear error messages will guide users
4. Server-side checks provide final security layer
