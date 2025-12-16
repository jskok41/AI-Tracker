import { MetricCard } from '@/components/dashboard/metric-card';
import { ExpandableProjectList } from '@/components/dashboard/expandable-project-list';
import { CyberpunkChartsWrapper } from '@/components/dashboard/cyberpunk-charts-wrapper';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatRelativeTime } from '@/lib/utils';
import { DollarSign, TrendingUp, AlertTriangle, FolderKanban, Target, Users } from 'lucide-react';
import prisma from '@/lib/db';
import { auth } from '@/lib/auth';
import { getRecentActivities } from '@/lib/services/activity-logger';

export const dynamic = 'force-dynamic';

async function getDashboardData(departmentIds?: string[]) {
  const where: any = {};
  
  // Filter by departments if provided
  if (departmentIds && departmentIds.length > 0) {
    where.departmentId = {
      in: departmentIds,
    };
  }

  // Get all projects
  const projects = await prisma.aIProject.findMany({
    where,
    include: {
      department: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          kpiDefinitions: true,
          riskAssessments: { where: { status: 'OPEN' } },
        },
      },
      roiCalculations: {
        orderBy: { calculationDate: 'desc' },
        take: 1,
      },
    },
  });

  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => 
    ['PILOT', 'SCALING', 'PRODUCTION'].includes(p.status)
  ).length;

  // Calculate average ROI
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

  // Get critical risks (filtered by selected departments if applicable)
  const criticalRisksWhere: any = {
    severity: 'CRITICAL',
    status: 'OPEN',
  };
  
  if (departmentIds && departmentIds.length > 0) {
    criticalRisksWhere.project = {
      departmentId: {
        in: departmentIds,
      },
    };
  }
  
  const criticalRisks = await prisma.riskAssessment.count({
    where: criticalRisksWhere,
  });

  // Get projects by status with project breakdown
  const projectsByStatusRaw = await prisma.aIProject.groupBy({
    where,
    by: ['status'],
    _count: true,
  });

  // Get all projects to derive project breakdown by Department & Team for each status
  const allProjectsForStatusBreakdown = await prisma.aIProject.findMany({
    where,
    select: {
      status: true,
      name: true,
      team: true,
      department: {
        select: {
          name: true,
        },
      },
    },
  });

  // Group projects by status and derive project breakdown
  const projectsByStatus = projectsByStatusRaw.map((statusItem) => {
    const statusProjects = allProjectsForStatusBreakdown.filter(p => p.status === statusItem.status);
    
    // Group projects by Department & Team (similar to Category breakdown)
    const projectMap = new Map<string, number>();
    
    statusProjects.forEach(project => {
      // Use team field (Department & Team), or department name, or project name, or "Unspecified"
      let projectKey = 'Unspecified';
      
      if (project.team?.trim()) {
        projectKey = project.team.trim();
      } else if (project.department?.name) {
        projectKey = project.department.name;
      } else if (project.name?.trim()) {
        projectKey = project.name.trim();
      }
      
      projectMap.set(projectKey, (projectMap.get(projectKey) || 0) + 1);
    });

    const projects = Array.from(projectMap.entries())
      .map(([projectName, count]) => ({
        projectName,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      status: statusItem.status,
      count: statusItem._count,
      projects: projects.length > 0 ? projects : undefined,
    };
  });

  // Get projects by category with sub-category breakdown
  const projectsByCategoryRaw = await prisma.aIProject.groupBy({
    where,
    by: ['category'],
    _count: true,
  });

  // Get all projects to derive sub-categories from Department & Team
  const allProjectsForSubCategories = await prisma.aIProject.findMany({
    where,
    select: {
      category: true,
      team: true,
      department: {
        select: {
          name: true,
        },
      },
    },
  });

  // Group projects by category and derive sub-categories
  const projectsByCategory = projectsByCategoryRaw.map((cat) => {
    const categoryProjects = allProjectsForSubCategories.filter(p => p.category === cat.category);
    
    // Derive sub-categories from Department & Team
    const subCategoryMap = new Map<string, number>();
    
    categoryProjects.forEach(project => {
      // Use team field (Department & Team), or combine department name with team, or use department name, or "Unspecified"
      let subCategory = 'Unspecified';
      
      if (project.team?.trim()) {
        // Use the team field directly (it contains "Department & team" format)
        subCategory = project.team.trim();
      } else if (project.department?.name) {
        // Fallback to department name if team is not available
        subCategory = project.department.name;
      }
      
      subCategoryMap.set(subCategory, (subCategoryMap.get(subCategory) || 0) + 1);
    });

    const subCategories = Array.from(subCategoryMap.entries())
      .map(([subCategory, count]) => ({
        subCategory,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      category: cat.category,
      count: cat._count,
      subCategories: subCategories.length > 0 ? subCategories : undefined,
    };
  });

  // Get recent alerts (filtered by selected departments if applicable)
  const alertsWhere: any = {};
  if (departmentIds && departmentIds.length > 0) {
    alertsWhere.project = {
      departmentId: {
        in: departmentIds,
      },
    };
  }
  
  const recentAlerts = await prisma.alert.findMany({
    where: alertsWhere,
    take: 5,
    orderBy: { triggeredAt: 'desc' },
    include: { project: true },
  });

  // Get all projects with calculated metrics
  const allProjects = projects
    .map(project => {
      const latestROI = project.roiCalculations[0];
      const roiPercentage = latestROI ? (
        ((latestROI.costSavings || 0) + (latestROI.revenueIncrease || 0) + (latestROI.productivityGainsValue || 0) -
        ((latestROI.implementationCost || 0) + (latestROI.operationalCost || 0) + (latestROI.maintenanceCost || 0))) /
        Math.max(1, (latestROI.implementationCost || 0) + (latestROI.operationalCost || 0) + (latestROI.maintenanceCost || 0))
      ) * 100 : null;

      return {
        id: project.id,
        name: project.name,
        description: project.description,
        category: project.category,
        status: project.status,
        budgetAllocated: project.budgetAllocated,
        budgetSpent: project.budgetSpent,
        startDate: project.startDate,
        targetCompletionDate: project.targetCompletionDate,
        latestROI: roiPercentage,
        activeKPIs: project._count.kpiDefinitions,
        openRisks: project._count.riskAssessments,
        department: project.department,
        // Key Highlight Remarks
        team: project.team,
        ownerContact: project.ownerContact,
        problemStatement: project.problemStatement,
        aiMlApproach: project.aiMlApproach,
        deploymentEnvironment: project.deploymentEnvironment,
        benefitRealized: project.benefitRealized,
        validationMethod: project.validationMethod,
        currentBlockers: project.currentBlockers,
        nextSteps: project.nextSteps,
        screenshotUrl: project.screenshotUrl,
        sharePointLink: (project as any).sharePointLink,
        appLink: (project as any).appLink,
      };
    })
    .sort((a, b) => {
      // Sort by status priority, then by name
      const statusOrder: Record<string, number> = {
        'PRODUCTION': 1,
        'SCALING': 2,
        'PILOT': 3,
        'PLANNING': 4,
        'PAUSED': 5,
        'COMPLETED': 6,
        'CANCELLED': 7,
      };
      const statusDiff = (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99);
      return statusDiff !== 0 ? statusDiff : a.name.localeCompare(b.name);
    });

  return {
    totalProjects,
    activeProjects,
    averageROI,
    totalCostSavings,
    criticalRisks,
    projectsByStatus,
    projectsByCategory,
    recentAlerts,
    allProjects,
  };
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ departmentId?: string | string[] }>;
}) {
  const params = await searchParams;
  // Handle multiple departmentId params
  const departmentIds = params.departmentId 
    ? (Array.isArray(params.departmentId) ? params.departmentId : [params.departmentId])
    : undefined;
  
  const data = await getDashboardData(departmentIds);
  
  // Check if user is admin for Recent Activity view
  const session = await auth();
  const isAdmin = session?.user?.role === 'ADMIN';
  
  // Fetch recent activities for admin users
  let recentActivities: any[] = [];
  if (isAdmin) {
    try {
      recentActivities = await getRecentActivities(20);
      // Ensure createdAt is a Date object for the component
      recentActivities = recentActivities.map(activity => ({
        ...activity,
        createdAt: activity.createdAt instanceof Date ? activity.createdAt : new Date(activity.createdAt),
      }));
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      recentActivities = [];
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight cyberpunk:text-white cyberpunk:drop-shadow-[0_0_10px_rgba(0,255,65,0.5)]">
          AI Benefits Dashboard
        </h1>
        <p className="text-muted-foreground cyberpunk:text-[#00FF41]/70">
          Track and measure the impact of your AI initiatives
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Projects"
          value={data.totalProjects}
          icon={<FolderKanban className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Average ROI"
          value={data.averageROI}
          format="percentage"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Cost Savings"
          value={data.totalCostSavings}
          format="currency"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Critical Risks"
          value={data.criticalRisks}
          icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* Charts Row */}
      <CyberpunkChartsWrapper
        projectsByStatus={data.projectsByStatus}
        projectsByCategory={data.projectsByCategory}
      />

      {/* Projects List */}
      <div>
        <div className="mb-4">
          <h2 className="text-2xl font-bold cyberpunk:text-white cyberpunk:drop-shadow-[0_0_8px_rgba(0,255,65,0.5)]">
            All Projects
          </h2>
          <p className="text-sm text-muted-foreground cyberpunk:text-[#00FF41]/70">
            Expand any project to view detailed metrics and progress
          </p>
        </div>
        {data.allProjects.length > 0 ? (
          <ExpandableProjectList projects={data.allProjects} />
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground cyberpunk:text-[#00FF41]/70">No projects found. Create your first project to get started.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Activity - Admin Only */}
      {isAdmin && (
        <div>
          <RecentActivity activities={recentActivities} />
                </div>
            )}
    </div>
  );
}

