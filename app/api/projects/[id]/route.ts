import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const project = await prisma.aIProject.findUnique({
      where: { id },
      include: {
        department: true,
        owner: true,
        kpiDefinitions: {
          where: { isActive: true },
          include: {
            metricsTimeseries: {
              orderBy: { time: 'desc' },
              take: 1,
            },
          },
        },
        baselineMetrics: true,
        roiCalculations: {
          orderBy: { calculationDate: 'desc' },
        },
        userFeedback: {
          include: { user: true },
          orderBy: { submittedAt: 'desc' },
        },
        riskAssessments: {
          include: { owner: true },
        },
        complianceChecks: {
          orderBy: { lastCheckedAt: 'desc' },
        },
        alerts: {
          orderBy: { triggeredAt: 'desc' },
          take: 5,
        },
        phases: {
          orderBy: { phaseOrder: 'asc' },
          include: {
            milestones: {
              orderBy: { targetDate: 'asc' },
            },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Project fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
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

    const project = await prisma.aIProject.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.status && { status: body.status }),
        ...(body.category && { category: body.category }),
        ...(body.departmentId !== undefined && { departmentId: body.departmentId }),
        ...(body.startDate && { startDate: new Date(body.startDate) }),
        ...(body.targetCompletionDate && { targetCompletionDate: new Date(body.targetCompletionDate) }),
        ...(body.actualCompletionDate && { actualCompletionDate: new Date(body.actualCompletionDate) }),
        ...(body.budgetAllocated !== undefined && { budgetAllocated: body.budgetAllocated }),
        ...(body.budgetSpent !== undefined && { budgetSpent: body.budgetSpent }),
        ...(body.expectedRoiPercentage !== undefined && { expectedRoiPercentage: body.expectedRoiPercentage }),
        ...(body.strategicPriority !== undefined && { strategicPriority: body.strategicPriority }),
      },
      include: {
        department: true,
        owner: true,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('Project update error:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
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

    await prisma.aIProject.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Project deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}

