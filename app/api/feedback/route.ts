import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const userId = searchParams.get('userId');

    const where: any = {};

    if (projectId) {
      where.projectId = projectId;
    }

    if (userId) {
      where.userId = userId;
    }

    const feedback = await prisma.userFeedback.findMany({
      where,
      include: {
        user: true,
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });

    return NextResponse.json(feedback);
  } catch (error) {
    console.error('Feedback fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const feedback = await prisma.userFeedback.create({
      data: {
        projectId: body.projectId,
        userId: body.userId,
        rating: body.rating,
        sentiment: body.sentiment,
        feedbackText: body.feedbackText,
        category: body.category,
      },
      include: {
        user: true,
        project: true,
      },
    });

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    console.error('Feedback creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create feedback' },
      { status: 500 }
    );
  }
}

