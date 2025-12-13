'use client';

import { useSession } from 'next-auth/react';

/**
 * Hook to check if current user is a guest
 */
export function useIsGuest(): boolean {
  const { data: session } = useSession();
  return session?.user?.role === 'GUEST';
}

/**
 * Hook to check if current user has edit permissions
 */
export function useCanEdit(): boolean {
  const { data: session, status } = useSession();
  // Return false if session is loading or not authenticated
  if (status === 'loading' || !session?.user) return false;
  // Only allow edit if role exists and is NOT 'GUEST'
  // If role is null/undefined, default to no edit access for safety
  return session.user.role !== null && session.user.role !== undefined && session.user.role !== 'GUEST';
}

/**
 * Hook to get current user role
 */
export function useUserRole(): string | null | undefined {
  const { data: session } = useSession();
  return session?.user?.role;
}
