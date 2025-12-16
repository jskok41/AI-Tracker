import { NextRequest, NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import { canEditProject } from '@/lib/permissions';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: projectId } = await params;

    // Check permissions
    const canEdit = await canEditProject(projectId);
    if (!canEdit) {
      return NextResponse.json({ error: 'You do not have permission to edit this project' }, { status: 403 });
    }

    // Get project to find screenshot URL
    const project = await prisma.aIProject.findUnique({
      where: { id: projectId },
      select: { screenshotUrl: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Delete file from Vercel Blob if it exists and is a blob URL
    if (project.screenshotUrl && project.screenshotUrl.startsWith('https://')) {
      // Only try to delete if Blob Storage is configured
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        try {
          await del(project.screenshotUrl);
        } catch (error) {
          console.error('Error deleting screenshot from blob:', error);
          // Continue even if deletion fails (file might not exist)
        }
      }
    }

    // Update project in database
    await prisma.aIProject.update({
      where: { id: projectId },
      data: { screenshotUrl: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete screenshot error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete screenshot' },
      { status: 500 }
    );
  }
}

