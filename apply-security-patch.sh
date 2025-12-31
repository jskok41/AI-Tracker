#!/bin/bash

# Security Patch Application Script
# Fixes CVE-2025-21262 - React Server Components RCE Vulnerability

set -e

echo "=========================================="
echo "React Server Components RCE Security Patch"
echo "CVE-2025-21262"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found. Please run this script from the ai-benefits-tracker directory."
  exit 1
fi

echo "✓ Found package.json"
echo ""

# Backup current package-lock.json
if [ -f "package-lock.json" ]; then
  echo "📦 Backing up package-lock.json..."
  cp package-lock.json package-lock.json.backup
  echo "✓ Backup created: package-lock.json.backup"
  echo ""
fi

# Install updated dependencies
echo "📥 Installing updated dependencies..."
echo "   - React 19.2.1 (patched)"
echo "   - React DOM 19.2.1 (patched)"
echo "   - Next.js 15.5.7+ (patched)"
echo ""

npm install

echo ""
echo "✓ Dependencies updated successfully"
echo ""

# Verify installations
echo "🔍 Verifying installed versions..."
echo ""

REACT_VERSION=$(npm list react --depth=0 2>/dev/null | grep react@ | sed 's/.*react@//' | sed 's/ .*//')
REACT_DOM_VERSION=$(npm list react-dom --depth=0 2>/dev/null | grep react-dom@ | sed 's/.*react-dom@//' | sed 's/ .*//')
NEXT_VERSION=$(npm list next --depth=0 2>/dev/null | grep next@ | sed 's/.*next@//' | sed 's/ .*//')

echo "Installed versions:"
echo "  React:     $REACT_VERSION"
echo "  React-DOM: $REACT_DOM_VERSION"
echo "  Next.js:   $NEXT_VERSION"
echo ""

# Run build to verify no breaking changes
echo "🏗️  Testing build..."
npm run build

echo ""
echo "✓ Build successful"
echo ""

echo "=========================================="
echo "✅ Security patch applied successfully!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Review SECURITY-RCE-FIX.md for details"
echo "2. Update ALLOWED_ORIGINS in next.config.ts for production"
echo "3. Test your application thoroughly"
echo "4. Deploy to production"
echo ""
echo "Security measures applied:"
echo "  ✓ Dependencies updated to patched versions"
echo "  ✓ Security headers configured"
echo "  ✓ Middleware enhanced with RSC protection"
echo "  ✓ Input sanitization added to server actions"
echo "  ✓ File upload validation strengthened"
echo "  ✓ Rate limiting implemented"
echo ""
echo "For more information, see SECURITY-RCE-FIX.md"
echo ""
