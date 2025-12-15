import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/db';
import { recalculatePhase } from '@/lib/services/roadmap-auto-tracker';
import { checkAndCreatePhaseAlerts, checkAndCreateMilestoneAlerts } from '@/lib/services/roadmap-alerts';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phaseId, milestoneName, description, targetDate, deliverables, isCompleted } = body;

    if (!phaseId || !milestoneName) {
      return NextResponse.json(
        { error: 'phaseId and milestoneName are required' },
        { status: 400 }
      );
    }

    // Get previous phase state
    const previousPhase = await prisma.phase.findUnique({
      where: { id: phaseId },
      select: {
        progressPercentage: true,
        status: true,
        projectId: true,
      },
    });

    if (!previousPhase) {
      return NextResponse.json(
        { error: 'Phase not found' },
        { status: 404 }
      );
    }

    const milestone = await prisma.milestone.create({
      data: {
        phaseId,
        milestoneName,
        description,
        targetDate: targetDate ? new Date(targetDate) : null,
        deliverables,
        isCompleted: isCompleted ?? false,
        completedDate: isCompleted ? new Date() : null,
      },
      include: {
        phase: {
          include: {
            project: true,
          },
        },
      },
    });

    // Auto-calculate phase progress when milestone is created
    try {
      await recalculatePhase(phaseId);
      await checkAndCreatePhaseAlerts(
        phaseId,
        previousPhase.progressPercentage ?? undefined,
        previousPhase.status ?? undefined
      );
      await checkAndCreateMilestoneAlerts(milestone.id, false);
    } catch (error) {
      console.error('Auto-calculation error:', error);
      // Continue even if auto-calculation fails
    }

    // Revalidate roadmap and project pages
    revalidatePath('/roadmap');
    revalidatePath(`/projects/${previousPhase.projectId}`);
    revalidatePath('/projects');

    return NextResponse.json(milestone, { status: 201 });
  } catch (error) {
    console.error('Milestone creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create milestone' },
      { status: 500 }
    );
  }
}
