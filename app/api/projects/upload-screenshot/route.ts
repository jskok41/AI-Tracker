import { NextRequest, NextResponse } from 'next/server';
import { put, del } from '@vercel/blob';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import { canEditProject } from '@/lib/permissions';
import { validateFileUpload, checkRateLimit, getSecurityHeaders } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Security: Rate limiting for file uploads
    if (!checkRateLimit(`upload-${session.user.id}`, 5, 60000)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429, headers: getSecurityHeaders() }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const projectId = formData.get('projectId') as string;

    if (!file || !projectId) {
      return NextResponse.json({ error: 'Missing file or projectId' }, { status: 400 });
    }

    // Check permissions
    const canEdit = await canEditProject(projectId);
    if (!canEdit) {
      return NextResponse.json({ error: 'You do not have permission to edit this project' }, { status: 403 });
    }

    // Security: Comprehensive file validation
    const validation = validateFileUpload(file, {
      maxSize: 5 * 1024 * 1024,
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    });

    if (!validation.valid) {
      console.error('[Security] File validation failed:', validation.error);
      return NextResponse.json(
        { error: validation.error },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    // Check if Blob Storage is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { 
          error: 'Blob Storage not configured. Please set up Vercel Blob Storage in your project settings. See BLOB-STORAGE-SETUP.md for instructions.',
          setupRequired: true
        },
        { status: 503 }
      );
    }

    // Get existing screenshot URL to delete old one
    const existingProject = await prisma.aIProject.findUnique({
      where: { id: projectId },
      select: { screenshotUrl: true },
    });

    // Delete old screenshot if exists
    if (existingProject?.screenshotUrl && existingProject.screenshotUrl.startsWith('https://')) {
      try {
        await del(existingProject.screenshotUrl);
      } catch (error) {
        console.error('Error deleting old screenshot:', error);
        // Continue even if deletion fails
      }
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'png';
    const filename = `projects/${projectId}-${timestamp}.${extension}`;

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
      contentType: file.type,
    });

    // Update project in database
    await prisma.aIProject.update({
      where: { id: projectId },
      data: { screenshotUrl: blob.url },
    });

    return NextResponse.json(
      { url: blob.url, success: true },
      { headers: getSecurityHeaders() }
    );
  } catch (error) {
    console.error('Upload error:', error);
    
    // Check for specific Blob Storage errors
    if (error instanceof Error && error.message.includes('No token found')) {
      return NextResponse.json(
        { 
          error: 'Blob Storage not configured. Please set up Vercel Blob Storage in your project settings.',
          setupRequired: true
        },
        { status: 503, headers: getSecurityHeaders() }
      );
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload screenshot' },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}

