import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { MetricCard } from '@/components/dashboard/metric-card';
import { formatDate } from '@/lib/utils';
import { DollarSign, TrendingUp, Target, AlertTriangle, Calendar, User, Map } from 'lucide-react';
import prisma from '@/lib/db';
import { format } from 'date-fns';
import { ProjectStatusControl } from '@/components/dashboard/project-status-control';
import { ProjectTabs } from '@/components/dashboard/project-tabs';

export const dynamic = 'force-dynamic';

async function getProject(id: string) {
  const project = await prisma.aIProject.findUnique({
    where: { id },
    include: {
      department: true,
      owner: true,
      kpiDefinitions: {
        where: { isActive: true },
        include: {
          metricsTimeseries: {
            orderBy: { time: 'desc' },
            take: 30,
          },
        },
      },
      roiCalculations: {
        orderBy: { calculationDate: 'desc' },
      },
      riskAssessments: {
        include: { owner: true },
        orderBy: { identifiedDate: 'desc' },
      },
      userFeedback: {
        include: { user: true },
        orderBy: { submittedAt: 'desc' },
        take: 10,
      },
      phases: {
        orderBy: { phaseOrder: 'asc' },
        include: {
          milestones: {
            orderBy: { targetDate: 'asc' },
          },
        },
      },
    },
  });

  if (!project) {
    return null;
  }

  // Calculate latest ROI
  const latestROI = project.roiCalculations[0];
  const roiPercentage = latestROI ? (
    ((latestROI.costSavings || 0) + (latestROI.revenueIncrease || 0) + (latestROI.productivityGainsValue || 0) -
    ((latestROI.implementationCost || 0) + (latestROI.operationalCost || 0) + (latestROI.maintenanceCost || 0))) /
    Math.max(1, (latestROI.implementationCost || 0) + (latestROI.operationalCost || 0) + (latestROI.maintenanceCost || 0))
  ) * 100 : null;

  return {
    ...project,
    latestROI: roiPercentage,
  };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) {
    notFound();
  }

  // Fetch users and projects for dialogs
  const [users, allProjects] = await Promise.all([
    prisma.user.findMany({ orderBy: { name: 'asc' } }),
    prisma.aIProject.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  // Prepare chart data for first KPI
  const firstKPI = project.kpiDefinitions[0];
  const chartData = firstKPI?.metricsTimeseries.reverse().map(m => ({
    date: format(new Date(m.time), 'MMM dd'),
    value: m.metricValue,
  })) || [];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
              <StatusBadge status={project.status} />
            </div>
            <p className="text-muted-foreground">{project.description}</p>
          </div>
          <Badge variant="outline">{project.category.replace(/_/g, ' ')}</Badge>
        </div>

        {/* Project Meta */}
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Owner:</span>
            <span className="font-medium">{project.owner.name}</span>
          </div>
          {project.department && (
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Department:</span>
              <span className="font-medium">{project.department.name}</span>
            </div>
          )}
          {project.startDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Started:</span>
              <span className="font-medium">{formatDate(project.startDate)}</span>
            </div>
          )}
          {project.phases.length > 0 && (
            <Link href={`/roadmap?projectId=${project.id}`}>
              <Button variant="outline" size="sm">
                <Map className="h-4 w-4 mr-2" />
                View Roadmap
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="ROI"
          value={project.latestROI || 0}
          format="percentage"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Budget Spent"
          value={project.budgetSpent || 0}
          format="currency"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Active KPIs"
          value={project.kpiDefinitions.length}
          icon={<Target className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Open Risks"
          value={project.riskAssessments.filter(r => r.status === 'OPEN').length}
          icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* Status Control */}
      <ProjectStatusControl projectId={project.id} currentStatus={project.status} />

      {/* Tabs */}
      <ProjectTabs
        project={project}
        firstKPI={firstKPI}
        chartData={chartData}
        users={users.map((u) => ({ id: u.id, name: u.name }))}
        projects={allProjects}
      />
    </div>
  );
}

