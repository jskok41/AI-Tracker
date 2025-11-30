import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const agentName = searchParams.get('agentName');
    const timeRange = searchParams.get('timeRange') || '30d';

    // Calculate date range
    const now = new Date();
    const daysMap: Record<string, number> = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
    };
    const days = daysMap[timeRange] || 30;
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);

    const where: any = {
      measurementTimestamp: {
        gte: startDate,
      },
    };

    if (projectId) {
      where.projectId = projectId;
    }

    if (agentName) {
      where.agentName = agentName;
    }

    const agentPerformance = await prisma.agentPerformance.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        measurementTimestamp: 'desc',
      },
    });

    return NextResponse.json(agentPerformance);
  } catch (error) {
    console.error('Agent performance fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent performance' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const agentPerformance = await prisma.agentPerformance.create({
      data: {
        projectId: body.projectId,
        agentName: body.agentName,
        measurementTimestamp: body.measurementTimestamp ? new Date(body.measurementTimestamp) : new Date(),
        tasksAssigned: body.tasksAssigned,
        tasksCompleted: body.tasksCompleted,
        tasksFailed: body.tasksFailed,
        successRate: body.successRate,
        averageCompletionTime: body.averageCompletionTime,
        errorRate: body.errorRate,
        autonomyScore: body.autonomyScore,
        accuracyScore: body.accuracyScore,
        userSatisfactionScore: body.userSatisfactionScore,
        metadata: body.metadata ? JSON.stringify(body.metadata) : null,
      },
      include: {
        project: true,
      },
    });

    return NextResponse.json(agentPerformance, { status: 201 });
  } catch (error) {
    console.error('Agent performance creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create agent performance record' },
      { status: 500 }
    );
  }
}

