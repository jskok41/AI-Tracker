import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const phase = await prisma.phase.update({
      where: { id },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.progressPercentage !== undefined && {
          progressPercentage: body.progressPercentage,
        }),
        ...(body.phaseName && { phaseName: body.phaseName }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.startDate && { startDate: new Date(body.startDate) }),
        ...(body.targetEndDate && {
          targetEndDate: new Date(body.targetEndDate),
        }),
      },
      include: {
        project: true,
        milestones: true,
      },
    });

    // Revalidate roadmap and project pages to reflect changes
    revalidatePath('/roadmap');
    revalidatePath(`/projects/${phase.projectId}`);
    revalidatePath('/projects');

    return NextResponse.json(phase);
  } catch (error) {
    console.error('Phase update error:', error);
    return NextResponse.json(
      { error: 'Failed to update phase' },
      { status: 500 }
    );
  }
}

