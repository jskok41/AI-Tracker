# User Access Control Implementation

## Overview

This document describes the user access control system implemented for the AI Benefits Tracker application.

## User Roles

### ADMIN
- **Full edit access** to all projects and data
- Can assign user roles (ADMIN, MEMBER, GUEST)
- Can assign members to any project
- Can manage all users via Settings page

### MEMBER
- Can create new projects
- Can edit projects they own
- Can edit projects they are assigned to as members
- Can assign members to projects they own
- Cannot change user roles
- Cannot edit projects they don't own or aren't assigned to

### GUEST (Default)
- **View-only access**
- Cannot create projects
- Cannot edit any projects
- Cannot assign members
- Cannot change user roles
- Default role for new user registrations

## Implementation Details

### Database Schema

1. **UserRole Enum**: `ADMIN`, `MEMBER`, `GUEST`
2. **User Model**: 
   - `role` field uses `UserRole` enum
   - Default value: `GUEST`
3. **ProjectMember Model**: Many-to-many relationship between Users and Projects
   - Allows project owners to assign members
   - Members can edit projects they're assigned to

### Permission System

#### Server-Side (`lib/permissions.ts`)
- `isAdmin()`: Check if user is admin
- `isMember()`: Check if user is member
- `isGuest()`: Check if user is guest
- `canEdit()`: Check if user can edit (ADMIN or MEMBER)
- `canEditProject(projectId)`: Check if user can edit specific project
- `canAssignProjectMembers(projectId)`: Check if user can assign members

#### Client-Side (`lib/hooks/use-permissions.ts`)
- `useIsAdmin()`: Hook to check if user is admin
- `useIsMember()`: Hook to check if user is member
- `useIsGuest()`: Hook to check if user is guest
- `useCanEdit()`: Hook to check if user can edit
- `useUserRole()`: Hook to get current user role

### Settings Page

Located at `/settings`:
- **Admin Section**: User management table with role assignment
- **Project Member Assignment**: For project owners to assign members
- **Access Level Info**: Shows current user's role and permissions

### API Routes

1. **`/api/users`** (GET, PATCH)
   - GET: List all users (Admin only)
   - PATCH: Update user role (Admin only)

2. **`/api/projects/[id]/members`** (GET, POST, DELETE)
   - GET: Get project members
   - POST: Add member to project
   - DELETE: Remove member from project

### Project Actions

All project actions check permissions:
- `createProject()`: Checks `canEdit()`
- `updateProject()`: Checks `canEditProject(projectId)`
- `updateProjectStatus()`: Checks `canEditProject(projectId)`
- `deleteProject()`: Checks `canEditProject(projectId)`

## Usage Examples

### Assigning a User Role (Admin Only)

1. Navigate to Settings page
2. Find user in "User Access Control" table
3. Select new role from dropdown (ADMIN, MEMBER, or GUEST)
4. Role is updated immediately

### Assigning Members to a Project

1. Navigate to Settings page
2. Find your project in "Project Member Assignment" section
3. Click "Manage Members"
4. Select users to add as members
5. Click "Add Selected Members"
6. Members can now edit the project

### Checking Permissions in Code

**Server-side:**
```typescript
import { canEditProject, isAdmin } from '@/lib/permissions';

if (await isAdmin()) {
  // Admin-only code
}

if (await canEditProject(projectId)) {
  // User can edit this project
}
```

**Client-side:**
```typescript
import { useCanEdit, useIsAdmin } from '@/lib/hooks/use-permissions';

const canEdit = useCanEdit();
const isAdmin = useIsAdmin();

if (canEdit) {
  // Show edit button
}
```

## Security Features

1. **Multi-layer Protection**: Permissions checked at UI, component, and server levels
2. **Server-side Enforcement**: All actions verify permissions server-side
3. **Admin Protection**: Admins cannot remove their own admin role
4. **Project-level Access**: Members can only edit projects they own or are assigned to
5. **Default Security**: New users default to GUEST (most restrictive)

## Migration

See `MIGRATION-GUIDE.md` for detailed migration instructions.

## Files Modified/Created

### Schema
- `prisma/schema.prisma`: Added UserRole enum and ProjectMember model

### Permissions
- `lib/permissions.ts`: Updated with new permission functions
- `lib/hooks/use-permissions.ts`: Updated with new hooks

### Actions
- `lib/actions.ts`: Added permission checks to project actions
- `lib/auth-actions.ts`: Updated registration to default to GUEST

### API Routes
- `app/api/users/route.ts`: User management API
- `app/api/projects/[id]/members/route.ts`: Project member management API

### UI Components
- `app/(dashboard)/settings/page.tsx`: Settings page
- `components/settings/settings-page-client.tsx`: Settings page client component
- `components/dashboard/sidebar.tsx`: Added Settings link

## Testing Checklist

- [ ] Admin can view all users
- [ ] Admin can change user roles
- [ ] Admin cannot remove their own admin role
- [ ] Member can create projects
- [ ] Member can edit their own projects
- [ ] Member can assign members to their projects
- [ ] Member cannot edit projects they don't own
- [ ] Guest cannot create or edit projects
- [ ] Project members can edit assigned projects
- [ ] Settings page shows correct sections based on role

