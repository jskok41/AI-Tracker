import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const kpiId = searchParams.get('kpiId');
    const timeRange = searchParams.get('timeRange') || '30d';

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      );
    }

    // Calculate date range
    const now = new Date();
    const daysMap: Record<string, number> = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365,
    };
    const days = daysMap[timeRange] || 30;
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);

    const where: any = {
      projectId,
      time: {
        gte: startDate,
      },
    };

    if (kpiId) {
      where.kpiId = kpiId;
    }

    const metrics = await prisma.metricTimeseries.findMany({
      where,
      include: {
        kpi: true,
      },
      orderBy: {
        time: 'desc',
      },
    });

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Metrics fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const metric = await prisma.metricTimeseries.create({
      data: {
        time: body.time ? new Date(body.time) : new Date(),
        projectId: body.projectId,
        kpiId: body.kpiId,
        metricValue: body.metricValue,
        metadata: body.metadata ? JSON.stringify(body.metadata) : null,
      },
      include: {
        kpi: true,
      },
    });

    return NextResponse.json(metric, { status: 201 });
  } catch (error) {
    console.error('Metric creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create metric' },
      { status: 500 }
    );
  }
}

