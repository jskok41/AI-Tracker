import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

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

    const alerts = await prisma.alert.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        acknowledgedByUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { status: 'asc' },
        { severity: 'desc' },
        { triggeredAt: 'desc' },
      ],
    });

    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Alerts fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const alert = await prisma.alert.create({
      data: {
        projectId: body.projectId,
        alertTitle: body.alertTitle,
        alertMessage: body.alertMessage,
        severity: body.severity,
        status: body.status || 'ACTIVE',
        metadata: body.metadata ? JSON.stringify(body.metadata) : null,
      },
      include: {
        project: true,
      },
    });

    return NextResponse.json(alert, { status: 201 });
  } catch (error) {
    console.error('Alert creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, acknowledgedBy } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Alert ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};

    if (status) {
      updateData.status = status;
      if (status === 'ACKNOWLEDGED' && !updateData.acknowledgedAt) {
        updateData.acknowledgedAt = new Date();
        if (acknowledgedBy) {
          updateData.acknowledgedBy = acknowledgedBy;
        }
      } else if (status === 'RESOLVED' && !updateData.resolvedAt) {
        updateData.resolvedAt = new Date();
      }
    }

    const alert = await prisma.alert.update({
      where: { id },
      data: updateData,
      include: {
        project: true,
        acknowledgedByUser: true,
      },
    });

    return NextResponse.json(alert);
  } catch (error) {
    console.error('Alert update error:', error);
    return NextResponse.json(
      { error: 'Failed to update alert' },
      { status: 500 }
    );
  }
}

