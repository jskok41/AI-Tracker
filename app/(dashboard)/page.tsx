import { MetricCard } from '@/components/dashboard/metric-card';
import { ProjectCard } from '@/components/dashboard/project-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatRelativeTime } from '@/lib/utils';
import { DollarSign, TrendingUp, AlertTriangle, FolderKanban, Target, Users } from 'lucide-react';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

async function getDashboardData() {
  // Get all projects
  const projects = await prisma.aIProject.findMany({
    include: {
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

  // Get critical risks
  const criticalRisks = await prisma.riskAssessment.count({
    where: {
      severity: 'CRITICAL',
      status: 'OPEN',
    },
  });

  // Get projects by status
  const projectsByStatus = await prisma.aIProject.groupBy({
    by: ['status'],
    _count: true,
  });

  // Get projects by category
  const projectsByCategory = await prisma.aIProject.groupBy({
    by: ['category'],
    _count: true,
  });

  // Get recent alerts
  const recentAlerts = await prisma.alert.findMany({
    take: 5,
    orderBy: { triggeredAt: 'desc' },
    include: { project: true },
  });

  // Get top projects for showcase
  const topProjects = projects
    .slice(0, 4)
    .map(project => {
      const latestROI = project.roiCalculations[0];
      const roiPercentage = latestROI ? (
        ((latestROI.costSavings || 0) + (latestROI.revenueIncrease || 0) + (latestROI.productivityGainsValue || 0) -
        ((latestROI.implementationCost || 0) + (latestROI.operationalCost || 0) + (latestROI.maintenanceCost || 0))) /
        Math.max(1, (latestROI.implementationCost || 0) + (latestROI.operationalCost || 0) + (latestROI.maintenanceCost || 0))
      ) * 100 : null;

      return {
        ...project,
        latestROI: roiPercentage,
        activeKPIs: project._count.kpiDefinitions,
        openRisks: project._count.riskAssessments,
      };
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
    topProjects,
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Benefits Dashboard</h1>
        <p className="text-muted-foreground">
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
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Projects by Status</CardTitle>
            <CardDescription>Current distribution of AI projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.projectsByStatus.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-sm capitalize">{item.status.toLowerCase().replace(/_/g, ' ')}</span>
                  </div>
                  <span className="text-sm font-medium">{item._count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Projects by Category</CardTitle>
            <CardDescription>AI initiatives breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.projectsByCategory.map((item) => (
                <div key={item.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <span className="text-sm capitalize">{item.category.toLowerCase().replace(/_/g, ' ')}</span>
                  </div>
                  <span className="text-sm font-medium">{item._count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Featured Projects */}
      <div>
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Featured Projects</h2>
          <p className="text-sm text-muted-foreground">Key AI initiatives and their current status</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {data.topProjects.map((project) => (
            <ProjectCard
              key={project.id}
              id={project.id}
              name={project.name}
              description={project.description}
              category={project.category}
              status={project.status}
              budgetAllocated={project.budgetAllocated}
              budgetSpent={project.budgetSpent}
              latestROI={project.latestROI}
              activeKPIs={project.activeKPIs}
              openRisks={project.openRisks}
            />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates from your AI projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recentAlerts.length > 0 ? (
              data.recentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-4 border-b pb-4 last:border-0 last:pb-0">
                  <div className={`mt-1 rounded-full p-2 ${
                    alert.severity === 'CRITICAL' ? 'bg-red-100' :
                    alert.severity === 'WARNING' ? 'bg-yellow-100' :
                    alert.severity === 'ERROR' ? 'bg-orange-100' :
                    'bg-blue-100'
                  }`}>
                    <AlertTriangle className={`h-4 w-4 ${
                      alert.severity === 'CRITICAL' ? 'text-red-600' :
                      alert.severity === 'WARNING' ? 'text-yellow-600' :
                      alert.severity === 'ERROR' ? 'text-orange-600' :
                      'text-blue-600'
                    }`} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{alert.alertTitle}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(alert.triggeredAt)}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.alertMessage}</p>
                    {alert.project && (
                      <p className="text-xs text-muted-foreground">
                        Project: {alert.project.name}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

