import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/db';
import { recalculatePhase } from '@/lib/services/roadmap-auto-tracker';
import { checkAndCreatePhaseAlerts, checkAndCreateMilestoneAlerts } from '@/lib/services/roadmap-alerts';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const milestone = await prisma.milestone.findUnique({
      where: { id },
      include: {
        phase: {
          include: {
            project: true,
          },
        },
      },
    });

    if (!milestone) {
      return NextResponse.json(
        { error: 'Milestone not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(milestone);
  } catch (error) {
    console.error('Milestone fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch milestone' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Get previous milestone and phase state
    const previousMilestone = await prisma.milestone.findUnique({
      where: { id },
      select: {
        isCompleted: true,
        phaseId: true,
      },
    });

    if (!previousMilestone) {
      return NextResponse.json(
        { error: 'Milestone not found' },
        { status: 404 }
      );
    }

    const previousPhase = await prisma.phase.findUnique({
      where: { id: previousMilestone.phaseId },
      select: {
        progressPercentage: true,
        status: true,
        projectId: true,
      },
    });

    // Prepare update data
    const updateData: any = {};
    if (body.milestoneName !== undefined) updateData.milestoneName = body.milestoneName;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.targetDate !== undefined) updateData.targetDate = body.targetDate ? new Date(body.targetDate) : null;
    if (body.deliverables !== undefined) updateData.deliverables = body.deliverables;
    
    // Handle completion status change
    if (body.isCompleted !== undefined) {
      updateData.isCompleted = body.isCompleted;
      updateData.completedDate = body.isCompleted ? new Date() : null;
    }

    const milestone = await prisma.milestone.update({
      where: { id },
      data: updateData,
      include: {
        phase: {
          include: {
            project: true,
          },
        },
      },
    });

    // Log milestone history if completion status changed
    if (body.isCompleted !== undefined && body.isCompleted !== previousMilestone.isCompleted) {
      await prisma.milestoneHistory.create({
        data: {
          milestoneId: id,
          isCompleted: body.isCompleted,
          previousCompleted: previousMilestone.isCompleted,
          completedDate: body.isCompleted ? new Date() : null,
          changeReason: 'manual',
        },
      });
    }

    // Auto-calculate phase progress when milestone completion changes
    if (body.isCompleted !== undefined && body.isCompleted !== previousMilestone.isCompleted) {
      try {
        await recalculatePhase(previousMilestone.phaseId);
        await checkAndCreatePhaseAlerts(
          previousMilestone.phaseId,
          previousPhase?.progressPercentage ?? undefined,
          previousPhase?.status ?? undefined
        );
        await checkAndCreateMilestoneAlerts(id, previousMilestone.isCompleted);
      } catch (error) {
        console.error('Auto-calculation error:', error);
        // Continue even if auto-calculation fails
      }
    }

    // Revalidate roadmap and project pages
    if (previousPhase) {
      revalidatePath('/roadmap');
      revalidatePath(`/projects/${previousPhase.projectId}`);
      revalidatePath('/projects');
    }

    return NextResponse.json(milestone);
  } catch (error) {
    console.error('Milestone update error:', error);
    return NextResponse.json(
      { error: 'Failed to update milestone' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get milestone to find phase before deletion
    const milestone = await prisma.milestone.findUnique({
      where: { id },
      select: {
        phaseId: true,
        phase: {
          select: {
            projectId: true,
          },
        },
      },
    });

    if (!milestone) {
      return NextResponse.json(
        { error: 'Milestone not found' },
        { status: 404 }
      );
    }

    await prisma.milestone.delete({
      where: { id },
    });

    // Auto-calculate phase progress after milestone deletion
    try {
      const previousPhase = await prisma.phase.findUnique({
        where: { id: milestone.phaseId },
        select: {
          progressPercentage: true,
          status: true,
        },
      });

      await recalculatePhase(milestone.phaseId);
      await checkAndCreatePhaseAlerts(
        milestone.phaseId,
        previousPhase?.progressPercentage ?? undefined,
        previousPhase?.status ?? undefined
      );
    } catch (error) {
      console.error('Auto-calculation error:', error);
      // Continue even if auto-calculation fails
    }

    // Revalidate roadmap and project pages
    revalidatePath('/roadmap');
    revalidatePath(`/projects/${milestone.phase.projectId}`);
    revalidatePath('/projects');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Milestone deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete milestone' },
      { status: 500 }
    );
  }
}
