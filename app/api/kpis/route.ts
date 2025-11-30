import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import type { KPIFormData } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    const where: any = {};
    if (projectId) {
      where.projectId = projectId;
    }

    const kpis = await prisma.kPIDefinition.findMany({
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
        createdAt: 'desc',
      },
    });

    return NextResponse.json(kpis);
  } catch (error) {
    console.error('KPI fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch KPIs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: KPIFormData = await request.json();

    const kpi = await prisma.kPIDefinition.create({
      data: {
        projectId: body.projectId,
        kpiName: body.kpiName,
        metricType: body.metricType,
        description: body.description,
        targetValue: body.targetValue,
        unit: body.unit,
        calculationFormula: body.calculationFormula,
        dataSource: body.dataSource,
        collectionFrequency: body.collectionFrequency,
      },
      include: {
        project: true,
      },
    });

    return NextResponse.json(kpi, { status: 201 });
  } catch (error) {
    console.error('KPI creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create KPI' },
      { status: 500 }
    );
  }
}

