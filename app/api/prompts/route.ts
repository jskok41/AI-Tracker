import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import type { PromptFormData } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'recent';

    const where: any = {
      isActive: true,
    };

    if (projectId) {
      where.projectId = projectId;
    }

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { promptTitle: { contains: search, mode: 'insensitive' } },
        { promptText: { contains: search, mode: 'insensitive' } },
        { tags: { contains: search, mode: 'insensitive' } },
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'popular') {
      orderBy = { usageCount: 'desc' };
    } else if (sortBy === 'rating') {
      orderBy = { averageRating: 'desc' };
    }

    const prompts = await prisma.promptLibrary.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy,
    });

    // Transform tags from string to array
    const transformedPrompts = prompts.map(prompt => ({
      ...prompt,
      tagsArray: prompt.tags ? prompt.tags.split(',').map(t => t.trim()) : [],
    }));

    return NextResponse.json(transformedPrompts);
  } catch (error) {
    console.error('Prompts fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: PromptFormData = await request.json();

    const prompt = await prisma.promptLibrary.create({
      data: {
        projectId: body.projectId,
        promptTitle: body.promptTitle,
        promptText: body.promptText,
        category: body.category,
        tags: body.tags ? body.tags.join(',') : null,
        authorId: body.authorId,
        useCase: body.useCase,
      },
      include: {
        author: true,
        project: true,
      },
    });

    return NextResponse.json(prompt, { status: 201 });
  } catch (error) {
    console.error('Prompt creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create prompt' },
      { status: 500 }
    );
  }
}

