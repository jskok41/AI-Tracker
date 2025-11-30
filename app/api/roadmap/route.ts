import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

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
        },
      });

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
          phase: true,
        },
      });

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

