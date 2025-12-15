import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/db';
import { recalculatePhase, updatePhaseStatus } from '@/lib/services/roadmap-auto-tracker';
import { checkAndCreatePhaseAlerts } from '@/lib/services/roadmap-alerts';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Get previous state for alert checking
    const previousPhase = await prisma.phase.findUnique({
      where: { id },
      select: {
        progressPercentage: true,
        status: true,
        milestones: true,
      },
    });

    const phase = await prisma.phase.update({
      where: { id },
      data: {
        ...(body.status && { status: body.status }),
        // Only allow manual progress override if explicitly set
        ...(body.progressPercentage !== undefined && {
          progressPercentage: body.progressPercentage,
          autoCalculatedProgress: false, // Mark as manual if explicitly set
        }),
        ...(body.phaseName && { phaseName: body.phaseName }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.startDate && { startDate: new Date(body.startDate) }),
        ...(body.targetEndDate && {
          targetEndDate: new Date(body.targetEndDate),
        }),
        ...(body.delayReason !== undefined && { delayReason: body.delayReason }),
      },
      include: {
        project: true,
        milestones: true,
      },
    });

    // Auto-calculate progress and status if dates changed or if not manually set
    // Only auto-calculate if progress wasn't manually set in this update
    if (body.progressPercentage === undefined || phase.milestones.length > 0) {
      try {
        // If dates changed, recalculate status
        if (body.startDate || body.targetEndDate) {
          await updatePhaseStatus(id);
        }

        // If milestones exist and progress wasn't manually set, recalculate
        if (phase.milestones.length > 0 && body.progressPercentage === undefined) {
          await recalculatePhase(id);
        }

        // Check for alerts
        await checkAndCreatePhaseAlerts(
          id,
          previousPhase?.progressPercentage ?? undefined,
          previousPhase?.status ?? undefined
        );
      } catch (error) {
        console.error('Auto-calculation error:', error);
        // Continue even if auto-calculation fails
      }
    }

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

