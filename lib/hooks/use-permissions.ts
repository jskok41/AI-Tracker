'use client';

import { useSession } from 'next-auth/react';

type UserRole = 'ADMIN' | 'MEMBER' | 'GUEST';

/**
 * Hook to check if current user is a guest
 */
export function useIsGuest(): boolean {
  const { data: session } = useSession();
  return session?.user?.role === 'GUEST';
}

/**
 * Hook to check if current user is an admin
 */
export function useIsAdmin(): boolean {
  const { data: session } = useSession();
  return session?.user?.role === 'ADMIN';
}

/**
 * Hook to check if current user is a member
 */
export function useIsMember(): boolean {
  const { data: session } = useSession();
  return session?.user?.role === 'MEMBER';
}

/**
 * Hook to check if current user has edit permissions
 */
export function useCanEdit(): boolean {
  const { data: session, status } = useSession();
  // Return false if session is loading or not authenticated
  if (status === 'loading' || !session?.user) return false;
  const role = session.user.role as UserRole | null | undefined;
  return role === 'ADMIN' || role === 'MEMBER';
}

/**
 * Hook to get current user role
 */
export function useUserRole(): UserRole | null | undefined {
  const { data: session } = useSession();
  return session?.user?.role as UserRole | null | undefined;
}
