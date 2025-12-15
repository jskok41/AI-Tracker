import { Suspense } from 'react';
import { SettingsPageClient } from '@/components/settings/settings-page-client';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';

async function getUsers() {
  const session = await auth();
  if (!session?.user) {
    return [];
  }

  // Only admins can see all users
  const isAdmin = session.user.role === 'ADMIN';
  if (!isAdmin) {
    return [];
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      department: {
        select: {
          id: true,
          name: true,
        },
      },
      createdAt: true,
      _count: {
        select: {
          ownedProjects: true,
          projectMemberships: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return users;
}

async function getProjects() {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  // Get projects the user owns (for member assignment)
  const projects = await prisma.aIProject.findMany({
    where: {
      OR: [
        { ownerId: session.user.id },
        ...(session.user.role === 'ADMIN' ? [{}] : []), // Admin can see all projects
      ],
    },
    select: {
      id: true,
      name: true,
      ownerId: true,
      members: {
        select: {
          userId: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  return projects;
}

async function getAllUsersForAssignment() {
  const session = await auth();
  if (!session?.user) {
    return [];
  }

  // Get all users for project member assignment
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return users;
}

export default async function SettingsPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/login');
  }

  const isAdmin = session.user.role === 'ADMIN';
  const users = isAdmin ? await getUsers() : [];
  const projects = await getProjects();
  const allUsers = await getAllUsersForAssignment();

  // Transform users to match expected format
  const transformedUsers = users.map(user => ({
    ...user,
    createdAt: user.createdAt.toISOString(),
  }));

  // Transform allUsers to match expected format
  const transformedAllUsers = allUsers.map(user => ({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role || null,
  }));

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>
      <Suspense fallback={<div>Loading settings...</div>}>
        <SettingsPageClient
          currentUser={{
            id: session.user.id || '',
            email: session.user.email || '',
            name: session.user.name || '',
            role: session.user.role || null,
          }}
          users={transformedUsers}
          projects={projects}
          allUsers={transformedAllUsers}
        />
      </Suspense>
    </div>
  );
}

