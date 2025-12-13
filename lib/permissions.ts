'use server';

import { auth } from '@/lib/auth';

/**
 * Check if the current user is a guest (view-only access)
 */
export async function isGuest(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === 'GUEST';
}

/**
 * Check if the current user has edit permissions
 * Returns false for guests, true for all other roles
 */
export async function canEdit(): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;
  // Only allow edit if role exists and is NOT 'GUEST'
  // If role is null/undefined, default to no edit access for safety
  return session.user.role !== null && session.user.role !== undefined && session.user.role !== 'GUEST';
}

/**
 * Get the current user's role
 */
export async function getUserRole(): Promise<string | null | undefined> {
  const session = await auth();
  return session?.user?.role;
}
