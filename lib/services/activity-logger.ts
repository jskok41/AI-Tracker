'use server';

import prisma from '@/lib/db';
import { ActivityType } from '@prisma/client';

interface LogActivityParams {
  type: ActivityType;
  userId: string;
  projectId?: string;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
}

/**
 * Log an activity to the database
 * This is used to track all user actions for the Recent Activity view
 */
export async function logActivity({
  type,
  userId,
  projectId,
  title,
  description,
  metadata,
}: LogActivityParams) {
  try {
    const activity = await prisma.activity.create({
      data: {
        type,
        userId,
        projectId: projectId || null,
        title,
        description: description || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
    // Log success for debugging (remove in production if needed)
    console.log('Activity logged successfully:', activity.id, type);
    return activity;
  } catch (error) {
    // Don't throw errors for activity logging - it's non-critical
    console.error('Failed to log activity:', error);
    // Log more details for debugging
    if (error instanceof Error) {
      console.error('Activity log error details:', error.message, {
        type,
        userId,
        projectId,
        title,
      });
    }
    return null;
  }
}

/**
 * Get recent activities (Admin only)
 */
export async function getRecentActivities(limit: number = 20) {
  try {
    const activities = await prisma.activity.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
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
    });

    return activities.map(activity => ({
      ...activity,
      createdAt: activity.createdAt instanceof Date ? activity.createdAt : new Date(activity.createdAt),
      metadata: activity.metadata ? JSON.parse(activity.metadata) : null,
    }));
  } catch (error) {
    console.error('Failed to fetch activities:', error);
    // Log more details for debugging
    if (error instanceof Error) {
      console.error('Activity fetch error details:', error.message, error.stack);
    }
    return [];
  }
}

