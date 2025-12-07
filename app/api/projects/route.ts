import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import type { ProjectFormData } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const departmentIds = searchParams.getAll('departmentId');
    const search = searchParams.get('search');

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    // Handle multiple department IDs
    if (departmentIds.length > 0) {
      where.departmentId = {
        in: departmentIds,
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const projects = await prisma.aIProject.findMany({
      where,
      include: {
        department: true,
        owner: true,
        _count: {
          select: {
            kpiDefinitions: true,
            riskAssessments: { where: { status: 'OPEN' } },
            alerts: { where: { status: 'ACTIVE' } },
          },
        },
        roiCalculations: {
          orderBy: { calculationDate: 'desc' },
          take: 1,
        },
        userFeedback: {
          select: { rating: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform to include computed fields
    const transformedProjects = projects.map(project => {
      const latestROI = project.roiCalculations[0];
      const roiPercentage = latestROI ? (
        ((latestROI.costSavings || 0) + (latestROI.revenueIncrease || 0) + (latestROI.productivityGainsValue || 0) -
        ((latestROI.implementationCost || 0) + (latestROI.operationalCost || 0) + (latestROI.maintenanceCost || 0))) /
        Math.max(1, (latestROI.implementationCost || 0) + (latestROI.operationalCost || 0) + (latestROI.maintenanceCost || 0))
      ) * 100 : null;

      const averageRating = project.userFeedback.length > 0
        ? project.userFeedback.reduce((sum, f) => sum + (f.rating || 0), 0) / project.userFeedback.length
        : null;

      return {
        ...project,
        latestROI: roiPercentage,
        averageRating,
        activeKPIs: project._count.kpiDefinitions,
        openRisks: project._count.riskAssessments,
        activeAlerts: project._count.alerts,
      };
    });

    return NextResponse.json(transformedProjects);
  } catch (error) {
    console.error('Projects fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ProjectFormData = await request.json();

    const project = await prisma.aIProject.create({
      data: {
        name: body.name,
        description: body.description,
        category: body.category,
        status: body.status || 'PLANNING',
        departmentId: body.departmentId,
        ownerId: body.ownerId,
        startDate: body.startDate ? new Date(body.startDate) : null,
        targetCompletionDate: body.targetCompletionDate ? new Date(body.targetCompletionDate) : null,
        budgetAllocated: body.budgetAllocated,
        expectedRoiPercentage: body.expectedRoiPercentage,
        strategicPriority: body.strategicPriority,
      },
      include: {
        department: true,
        owner: true,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Project creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}

