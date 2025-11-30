import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import type { RiskFormData } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');
    const severity = searchParams.get('severity');

    const where: any = {};

    if (projectId) {
      where.projectId = projectId;
    }

    if (status) {
      where.status = status;
    }

    if (severity) {
      where.severity = severity;
    }

    const risks = await prisma.riskAssessment.findMany({
      where,
      include: {
        owner: true,
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
      orderBy: [
        { status: 'asc' },
        { severity: 'desc' },
        { likelihood: 'desc' },
      ],
    });

    return NextResponse.json(risks);
  } catch (error) {
    console.error('Risks fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch risks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: RiskFormData = await request.json();

    const risk = await prisma.riskAssessment.create({
      data: {
        projectId: body.projectId,
        riskTitle: body.riskTitle,
        riskDescription: body.riskDescription,
        category: body.category,
        severity: body.severity,
        likelihood: body.likelihood,
        mitigationPlan: body.mitigationPlan,
        ownerId: body.ownerId,
        identifiedDate: new Date(body.identifiedDate),
      },
      include: {
        owner: true,
        project: true,
      },
    });

    return NextResponse.json(risk, { status: 201 });
  } catch (error) {
    console.error('Risk creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create risk' },
      { status: 500 }
    );
  }
}

