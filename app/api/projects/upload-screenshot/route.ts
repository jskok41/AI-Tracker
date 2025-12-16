import { NextRequest, NextResponse } from 'next/server';
import { put, del } from '@vercel/blob';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import { canEditProject } from '@/lib/permissions';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type. Only images are allowed.' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
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

    return NextResponse.json({ url: blob.url, success: true });
  } catch (error) {
    console.error('Upload error:', error);
    
    // Check for specific Blob Storage errors
    if (error instanceof Error && error.message.includes('No token found')) {
      return NextResponse.json(
        { 
          error: 'Blob Storage not configured. Please set up Vercel Blob Storage in your project settings.',
          setupRequired: true
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload screenshot' },
      { status: 500 }
    );
  }
}

