import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/db';
import { recalculatePhase } from '@/lib/services/roadmap-auto-tracker';
import { checkAndCreatePhaseAlerts, checkAndCreateMilestoneAlerts } from '@/lib/services/roadmap-alerts';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      );
    }

    const project = await prisma.aIProject.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        name: true,
        startDate: true,
        targetCompletionDate: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const phases = await prisma.phase.findMany({
      where: { projectId },
      include: {
        milestones: {
          orderBy: { targetDate: 'asc' },
        },
        dependsOn: {
          include: {
            requiredPhase: true,
          },
        },
      },
      orderBy: { phaseOrder: 'asc' },
    });

    // Calculate overall progress
    const totalPhases = phases.length;
    const completedPhases = phases.filter(p => p.status === 'COMPLETED').length;
    const overallProgress = totalPhases > 0 ? (completedPhases / totalPhases) * 100 : 0;

    // Find current phase (first IN_PROGRESS or first NOT_STARTED)
    const currentPhase = phases.find(p => p.status === 'IN_PROGRESS') || 
                        phases.find(p => p.status === 'NOT_STARTED') ||
                        phases[phases.length - 1];

    const roadmap = {
      projectId: project.id,
      projectName: project.name,
      projectStartDate: project.startDate,
      projectTargetCompletionDate: project.targetCompletionDate,
      phases,
      overallProgress,
      currentPhase,
    };

    return NextResponse.json(roadmap);
  } catch (error) {
    console.error('Roadmap fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch roadmap' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body;

    if (type === 'phase') {
      const phase = await prisma.phase.create({
        data: {
          projectId: body.projectId,
          phaseName: body.phaseName,
          description: body.description,
          phaseOrder: body.phaseOrder,
          startDate: body.startDate ? new Date(body.startDate) : null,
          targetEndDate: body.targetEndDate ? new Date(body.targetEndDate) : null,
          status: body.status || 'NOT_STARTED',
          progressPercentage: body.progressPercentage || 0,
        },
        include: {
          project: true,
          milestones: true,
        },
      });

      // Auto-calculate progress and status if milestones exist
      if (phase.milestones.length > 0) {
        try {
          await recalculatePhase(phase.id);
          await checkAndCreatePhaseAlerts(phase.id);
        } catch (error) {
          console.error('Auto-calculation error:', error);
          // Continue even if auto-calculation fails
        }
      }

      // Revalidate roadmap and project pages
      revalidatePath('/roadmap');
      revalidatePath(`/projects/${body.projectId}`);
      revalidatePath('/projects');

      return NextResponse.json(phase, { status: 201 });
    } else if (type === 'milestone') {
      const milestone = await prisma.milestone.create({
        data: {
          phaseId: body.phaseId,
          milestoneName: body.milestoneName,
          description: body.description,
          targetDate: body.targetDate ? new Date(body.targetDate) : null,
          deliverables: body.deliverables,
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
        const previousPhase = await prisma.phase.findUnique({
          where: { id: body.phaseId },
          select: { progressPercentage: true, status: true },
        });

        const result = await recalculatePhase(body.phaseId);
        await checkAndCreatePhaseAlerts(
          body.phaseId,
          previousPhase?.progressPercentage ?? undefined,
          previousPhase?.status ?? undefined
        );
        await checkAndCreateMilestoneAlerts(milestone.id, false);
      } catch (error) {
        console.error('Auto-calculation error:', error);
        // Continue even if auto-calculation fails
      }

      // Revalidate roadmap and project pages
      revalidatePath('/roadmap');
      revalidatePath(`/projects/${milestone.phase.projectId}`);
      revalidatePath('/projects');

      return NextResponse.json(milestone, { status: 201 });
    }

    return NextResponse.json(
      { error: 'Invalid type. Must be "phase" or "milestone"' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Roadmap creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create roadmap item' },
      { status: 500 }
    );
  }
}

