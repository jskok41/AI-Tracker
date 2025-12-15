import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/lib/auth';
import { canAssignProjectMembers } from '@/lib/permissions';
import { logActivity } from '@/lib/services/activity-logger';

// Get project members
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const members = await prisma.projectMember.findMany({
      where: { projectId: id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error('Error fetching project members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project members' },
      { status: 500 }
    );
  }
}

// Add member to project
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: projectId } = await params;

    // Check if user can assign members to this project
    const canAssign = await canAssignProjectMembers(projectId);
    if (!canAssign) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to assign members to this project' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Verify project exists
    const project = await prisma.aIProject.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member of this project' },
        { status: 400 }
      );
    }

    // Create project member
    const projectMember = await prisma.projectMember.create({
      data: {
        projectId,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
    });

    // Log activity
    if (session?.user?.id) {
      await logActivity({
        type: 'PROJECT_MEMBER_ADDED',
        userId: session.user.id,
        projectId,
        title: `Member added to project`,
        description: `${projectMember.user.name} was added as a member`,
        metadata: {
          addedUserId: userId,
          addedUserName: projectMember.user.name,
        },
      });
    }

    return NextResponse.json(projectMember, { status: 201 });
  } catch (error: any) {
    console.error('Error adding project member:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'User is already a member of this project' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to add project member' },
      { status: 500 }
    );
  }
}

// Remove member from project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: projectId } = await params;

    // Check if user can assign members to this project
    const canAssign = await canAssignProjectMembers(projectId);
    if (!canAssign) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to remove members from this project' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Get user details before deletion
    const projectMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    // Delete project member
    await prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    // Log activity
    if (session?.user?.id && projectMember) {
      await logActivity({
        type: 'PROJECT_MEMBER_REMOVED',
        userId: session.user.id,
        projectId,
        title: `Member removed from project`,
        description: `${projectMember.user.name} was removed as a member`,
        metadata: {
          removedUserId: userId,
          removedUserName: projectMember.user.name,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error removing project member:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Project member not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to remove project member' },
      { status: 500 }
    );
  }
}

