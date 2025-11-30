# Authentication & Enhanced UI Implementation Guide

## ✅ Completed So Far

### 1. Dependencies Installed
- `next-auth@beta` - NextAuth.js v5 for authentication
- `@auth/prisma-adapter` - Prisma adapter for NextAuth
- `bcryptjs` - Password hashing
- `nodemailer` - Email service
- `react-hook-form` & `@hookform/resolvers` - Form handling

### 2. Database Schema Updated
Added to Prisma schema:
- User model enhanced with `password`, `emailVerified`, `image` fields
- `Account` model for OAuth providers
- `Session` model for session management
- `VerificationToken` model for email verification
- `PasswordResetToken` model for password resets

### 3. Auth Configuration Created
- `/lib/auth.ts` - NextAuth configuration with Credentials provider
- `/lib/auth-actions.ts` - Server actions for register, login, password reset
- `/lib/email.ts` - Email service for password reset and welcome emails
- `/app/api/auth/[...nextauth]/route.ts` - NextAuth API route

## 🔨 Still To Implement

### Phase 1: Auth Pages (High Priority)
1. **/app/auth/login/page.tsx** - Login page
2. **/app/auth/register/page.tsx** - Registration page
3. **/app/auth/forgot-password/page.tsx** - Request password reset
4. **/app/auth/reset-password/page.tsx** - Reset password with token

### Phase 2: Middleware & Route Protection
5. **/middleware.ts** - Protect dashboard routes
6. Update header to show actual user info and working sign out

### Phase 3: Edit Functionality
7. Create edit dialogs for:
   - Projects (`/components/dashboard/edit-project-dialog.tsx`)
   - Prompts (`/components/dashboard/edit-prompt-dialog.tsx`)
   - Risks (`/components/dashboard/edit-risk-dialog.tsx`)

8. Add update server actions in `/lib/actions.ts`:
   - `updateProject`
   - `updatePrompt`
   - `updateRisk`
   - `deleteProject`
   - `deletePrompt`
   - `deleteRisk`

### Phase 4: Enhanced Forms
9. Update form components to allow creating users on-the-fly:
   - Add "Create New User" option in dropdown
   - Show input field when selected
   - Call `createUser` action

### Phase 5: Environment Variables
Add to Vercel:
```
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
NEXTAUTH_URL=https://your-app.vercel.app
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@your-app.com
```

## 📋 Next Steps

### Step 1: Run Database Migration
```bash
npx prisma db push
npx prisma generate
```

### Step 2: Create Auth Pages
Need to create 4 auth pages with forms

### Step 3: Create Middleware
Protect routes that require authentication

### Step 4: Add Edit Dialogs
Reuse dialog structure from create dialogs

### Step 5: Update Forms
Add dynamic user creation

### Step 6: Test & Deploy
Full testing and deployment to Vercel

## 🎯 Priority Order
1. Database migration (required first!)
2. Auth pages (login/register)
3. Middleware
4. Update Sign Out
5. Edit dialogs
6. Enhanced forms

Would you like me to continue implementing these features?

