'use server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/db';

type UserRole = 'ADMIN' | 'MEMBER' | 'GUEST';

/**
 * Check if the current user is a guest (view-only access)
 */
export async function isGuest(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === 'GUEST';
}

/**
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === 'ADMIN';
}

/**
 * Check if the current user is a member (not guest, not admin)
 */
export async function isMember(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === 'MEMBER';
}

/**
 * Check if the current user has edit permissions
 * Returns false for guests, true for ADMIN and MEMBER
 */
export async function canEdit(): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;
  const role = session.user.role as UserRole | null | undefined;
  return role === 'ADMIN' || role === 'MEMBER';
}

/**
 * Check if the current user can edit a specific project
 * - ADMIN: can edit all projects
 * - MEMBER: can edit if they own the project or are assigned as a member
 * - GUEST: cannot edit any project
 */
export async function canEditProject(projectId: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;
  
  const role = session.user.role as UserRole | null | undefined;
  const userId = session.user.id;

  // Admin can edit all projects
  if (role === 'ADMIN') return true;

  // Guest cannot edit any project
  if (role === 'GUEST') return false;

  // Member can edit if they own the project or are assigned as a member
  if (role === 'MEMBER') {
    const project = await prisma.aIProject.findUnique({
      where: { id: projectId },
      include: {
        members: true,
      },
    });

    if (!project) return false;

    // Check if user is the owner
    if (project.ownerId === userId) return true;

    // Check if user is assigned as a member
    const isMember = project.members.some(member => member.userId === userId);
    return isMember;
  }

  return false;
}

/**
 * Check if the current user can assign members to a project
 * - ADMIN: can assign members to any project
 * - MEMBER: can assign members only to projects they own
 * - GUEST: cannot assign members
 */
export async function canAssignProjectMembers(projectId: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;
  
  const role = session.user.role as UserRole | null | undefined;
  const userId = session.user.id;

  // Admin can assign members to any project
  if (role === 'ADMIN') return true;

  // Guest cannot assign members
  if (role === 'GUEST') return false;

  // Member can assign members only to projects they own
  if (role === 'MEMBER') {
    const project = await prisma.aIProject.findUnique({
      where: { id: projectId },
    });

    return project?.ownerId === userId;
  }

  return false;
}

/**
 * Get the current user's role
 */
export async function getUserRole(): Promise<UserRole | null | undefined> {
  const session = await auth();
  return session?.user?.role as UserRole | null | undefined;
}
