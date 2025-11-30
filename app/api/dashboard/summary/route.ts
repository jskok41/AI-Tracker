import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import type { DashboardSummary } from '@/lib/types';

export async function GET() {
  try {
    // Get project counts
    const [totalProjects, projectsByStatus, projectsByCategory] = await Promise.all([
      prisma.aIProject.count(),
      prisma.aIProject.groupBy({
        by: ['status'],
        _count: true,
      }),
      prisma.aIProject.groupBy({
        by: ['category'],
        _count: true,
      }),
    ]);

    // Get active projects count
    const activeProjects = await prisma.aIProject.count({
      where: {
        status: {
          in: ['PILOT', 'SCALING', 'PRODUCTION'],
        },
      },
    });

    // Get completed projects count
    const completedProjects = await prisma.aIProject.count({
      where: {
        status: 'COMPLETED',
      },
    });

    // Get all projects with their latest ROI
    const projects = await prisma.aIProject.findMany({
      include: {
        roiCalculations: {
          orderBy: {
            calculationDate: 'desc',
          },
          take: 1,
        },
      },
    });

    // Calculate average ROI from latest calculations
    const projectsWithROI = projects.filter(p => p.roiCalculations.length > 0);
    const averageROI = projectsWithROI.length > 0
      ? projectsWithROI.reduce((sum, p) => {
          const roi = p.roiCalculations[0];
          const totalCost = (roi.implementationCost || 0) + (roi.operationalCost || 0) + (roi.maintenanceCost || 0);
          const totalBenefits = (roi.costSavings || 0) + (roi.revenueIncrease || 0) + (roi.productivityGainsValue || 0);
          const roiPercentage = totalCost > 0 ? ((totalBenefits - totalCost) / totalCost) * 100 : 0;
          return sum + roiPercentage;
        }, 0) / projectsWithROI.length
      : 0;

    // Calculate total cost savings
    const totalCostSavings = projects.reduce((sum, p) => {
      if (p.roiCalculations.length > 0) {
        return sum + (p.roiCalculations[0].costSavings || 0);
      }
      return sum;
    }, 0);

    // Get average user satisfaction
    const feedbackAgg = await prisma.userFeedback.aggregate({
      _avg: {
        rating: true,
      },
    });
    const averageUserSatisfaction = feedbackAgg._avg.rating || 0;

    // Get critical risks count
    const criticalRisks = await prisma.riskAssessment.count({
      where: {
        severity: 'CRITICAL',
        status: 'OPEN',
      },
    });

    // Get active alerts count
    const activeAlerts = await prisma.alert.count({
      where: {
        status: 'ACTIVE',
      },
    });

    // Transform grouped data to records
    const statusRecord = projectsByStatus.reduce((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {} as Record<string, number>);

    const categoryRecord = projectsByCategory.reduce((acc, item) => {
      acc[item.category] = item._count;
      return acc;
    }, {} as Record<string, number>);

    // Get recent activity (last 10 items)
    const [recentAlerts, recentFeedback, recentPhases] = await Promise.all([
      prisma.alert.findMany({
        take: 5,
        orderBy: { triggeredAt: 'desc' },
        include: { project: true },
      }),
      prisma.userFeedback.findMany({
        take: 3,
        orderBy: { submittedAt: 'desc' },
        include: { project: true, user: true },
      }),
      prisma.phase.findMany({
        take: 2,
        where: { status: 'COMPLETED' },
        orderBy: { updatedAt: 'desc' },
        include: { project: true },
      }),
    ]);

    const recentActivity = [
      ...recentAlerts.map(alert => ({
        id: alert.id,
        type: 'alert' as const,
        title: alert.alertTitle,
        description: alert.alertMessage || undefined,
        timestamp: alert.triggeredAt,
        severity: alert.severity,
        projectId: alert.projectId || undefined,
        projectName: alert.project?.name || undefined,
      })),
      ...recentFeedback.map(feedback => ({
        id: feedback.id,
        type: 'feedback' as const,
        title: `Feedback from ${feedback.user.name}`,
        description: feedback.feedbackText || undefined,
        timestamp: feedback.submittedAt,
        projectId: feedback.projectId,
        projectName: feedback.project.name,
      })),
      ...recentPhases.map(phase => ({
        id: phase.id,
        type: 'milestone' as const,
        title: `${phase.phaseName} completed`,
        description: phase.description || undefined,
        timestamp: phase.updatedAt,
        projectId: phase.projectId,
        projectName: phase.project.name,
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);

    const summary: DashboardSummary = {
      totalProjects,
      activeProjects,
      completedProjects,
      averageROI,
      totalCostSavings,
      averageUserSatisfaction,
      criticalRisks,
      activeAlerts,
      projectsByStatus: statusRecord,
      projectsByCategory: categoryRecord,
      recentActivity,
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Dashboard summary error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard summary' },
      { status: 500 }
    );
  }
}

