import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
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

    // Delete file if it exists
    if (project.screenshotUrl) {
      const filepath = join(process.cwd(), 'public', project.screenshotUrl);
      if (existsSync(filepath)) {
        await unlink(filepath);
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
      { error: 'Failed to delete screenshot' },
      { status: 500 }
    );
  }
}

