# Security Patch Quick Start Guide

## 🚨 Critical: React Server Components RCE Fix

**CVE-2025-21262** - This vulnerability allows unauthenticated remote code execution.

## Quick Apply (5 minutes)

### Step 1: Apply the Patch

```bash
cd ai-benefits-tracker
./apply-security-patch.sh
```

If you get a permission error:
```bash
chmod +x apply-security-patch.sh
./apply-security-patch.sh
```

### Step 2: Update Production Configuration

Edit `next.config.ts` and update the allowed origins:

```typescript
experimental: {
  serverActions: {
    bodySizeLimit: '2mb',
    allowedOrigins: ['your-production-domain.com'], // ⚠️ UPDATE THIS!
  },
},
```

### Step 3: Deploy

```bash
# Test locally first
npm run dev

# Then deploy
git add .
git commit -m "fix: apply CVE-2025-21262 security patch"
git push origin main
```

## What Was Fixed?

✅ **Dependencies Updated**
- React 19.2.0 → 19.2.1 (patched)
- Next.js 15.5.7 (already patched, confirmed secure)

✅ **Security Measures Added**
- Request validation middleware
- Input sanitization on all server actions
- Rate limiting (prevents abuse)
- File upload validation
- Security headers
- CSRF protection

✅ **Protected Components**
- All server actions (`lib/actions.ts`)
- File uploads (`app/api/projects/upload-screenshot/route.ts`)
- Middleware request validation
- All API routes

## Verification Checklist

After applying the patch:

- [ ] Dependencies updated (`npm list react react-dom next`)
- [ ] Application builds without errors (`npm run build`)
- [ ] Local testing works (`npm run dev`)
- [ ] Production domain updated in `next.config.ts`
- [ ] Deployed to production
- [ ] Security headers present (check with browser DevTools)

## Testing Security Features

### Test Rate Limiting
Try creating 15 projects rapidly:
- Expected: "Rate limit exceeded" after 10 projects

### Test Input Validation
Try submitting a form with `__proto__` in a field:
- Expected: "Invalid request data detected"

### Test File Upload Protection
Try uploading a non-image file:
- Expected: "File type ... is not allowed"

### Test Security Headers
```bash
curl -I https://your-domain.com
```
Should see:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

## Monitoring

Watch your logs for security events:

```bash
# Vercel logs
vercel logs

# Look for these patterns:
[Security] Invalid RSC request detected
[Security] Invalid FormData in createProject
[Security] File validation failed
```

## Rollback (if needed)

If you encounter issues:

```bash
# Restore the backup
cp package-lock.json.backup package-lock.json
npm install

# Or revert the commit
git revert HEAD
git push origin main
```

## Need Help?

1. Check full documentation: `SECURITY-RCE-FIX.md`
2. Review your application logs
3. Test in development environment first
4. Verify all environment variables are set

## Important Notes

⚠️ **This is a critical security patch** - Deploy as soon as possible

⚠️ **Don't skip production configuration** - Update `allowedOrigins`

⚠️ **Test thoroughly** - Verify all features work after patching

✅ **Keep monitoring** - Watch logs for suspicious activity

---

**Patch Version:** 1.0.0  
**Applied:** December 31, 2025  
**Status:** Ready for deployment
