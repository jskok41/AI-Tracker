#!/bin/bash

# AI Benefits Tracker - Vercel Deployment Script
# This script automates the deployment process to Vercel with Postgres

set -e  # Exit on error

echo "🚀 AI Benefits Tracker - Vercel Deployment"
echo "=========================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed"
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
    echo "✅ Vercel CLI installed"
else
    echo "✅ Vercel CLI is already installed"
fi

echo ""
echo "🔐 Logging in to Vercel..."
vercel login

echo ""
echo "📊 Checking current directory..."
pwd

echo ""
echo "🔧 Generating Prisma Client..."
npx prisma generate

echo ""
echo "🚀 Deploying to Vercel (Preview)..."
vercel

echo ""
echo "✅ Preview deployment complete!"
echo ""
echo "📝 Next Steps:"
echo "1. Go to your Vercel Dashboard: https://vercel.com/dashboard"
echo "2. Navigate to your project → Storage tab"
echo "3. Create a new Postgres database"
echo "4. Once database is created, pull environment variables:"
echo "   vercel env pull .env.local"
echo "5. Run migrations locally:"
echo "   npx prisma migrate dev --name init_postgres"
echo "6. Seed the database (optional):"
echo "   npx tsx prisma/seed.ts"
echo "7. Deploy to production:"
echo "   vercel --prod"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT.md"
echo ""

read -p "Would you like to open Vercel Dashboard now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    open "https://vercel.com/dashboard"
fi

echo ""
echo "🎉 Deployment initiated successfully!"

