# Vercel Blob Storage Setup Guide

## Error: "Vercel Blob: No token found"

This error occurs because Vercel Blob Storage hasn't been set up yet. Follow these steps:

## Step 1: Create Blob Storage in Vercel Dashboard

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/justins-projects-4264a4ab/ai-benefits-tracker
   - Or use: `vercel open`

2. **Navigate to Storage:**
   - Click on the **"Storage"** tab in the top navigation
   - Or go to: Settings → Storage

3. **Create Blob Store:**
   - Click **"Create Database"** button
   - Select **"Blob"** from the options
   - Name it: `screenshots` (or any name you prefer)
   - Click **"Create"**

4. **Wait for Provisioning:**
   - Vercel will automatically create the Blob store
   - The `BLOB_READ_WRITE_TOKEN` environment variable will be automatically added to your project

## Step 2: Verify Environment Variable

1. Go to: **Settings → Environment Variables**
2. Look for: `BLOB_READ_WRITE_TOKEN`
3. It should be automatically set for all environments (Production, Preview, Development)

## Step 3: Redeploy

After the Blob store is created, redeploy:

```bash
vercel --prod
```

Or the next deployment will automatically pick up the new environment variable.

## Alternative: Manual Token Setup

If you need to set the token manually:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Click "Add New"
3. Key: `BLOB_READ_WRITE_TOKEN`
4. Value: (Get from Vercel Blob Storage settings)
5. Environment: Production, Preview, Development
6. Click "Save"

## Troubleshooting

**Issue:** Token still not found after setup
- **Solution:** Wait 1-2 minutes for propagation, then redeploy

**Issue:** Blob Storage not available in my region
- **Solution:** Blob Storage is available in all Vercel regions

**Issue:** Want to use a different storage solution
- **Solution:** We can modify the code to use AWS S3, Cloudinary, or another service

## Free Tier Limits

Vercel Blob Storage free tier includes:
- 1 GB storage
- 1 GB bandwidth/month
- Perfect for screenshot uploads!

