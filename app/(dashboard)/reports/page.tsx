import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, TrendingUp, DollarSign, Target } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { ExportReportButton } from '@/components/reports/export-report-button';
import { DetailedReportDialog } from '@/components/reports/detailed-report-dialog';
import { ReportsPageClient } from '@/components/reports/reports-page-client';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

async function getReportData() {
  // Get all projects with their data
  const projects = await prisma.aIProject.findMany({
    include: {
      roiCalculations: {
        orderBy: { calculationDate: 'desc' },
        take: 1,
      },
      kpiDefinitions: {
        where: { isActive: true },
      },
      riskAssessments: {
        where: { status: 'OPEN' },
      },
    },
  });

  // Calculate summary metrics
  const totalProjects = projects.length;
  const projectsWithROI = projects.filter(p => p.roiCalculations.length > 0);
  
  const avgROI = projectsWithROI.length > 0
    ? projectsWithROI.reduce((sum, p) => {
        const roi = p.roiCalculations[0];
        const totalCost = (roi.implementationCost || 0) + (roi.operationalCost || 0) + (roi.maintenanceCost || 0);
        const totalBenefits = (roi.costSavings || 0) + (roi.revenueIncrease || 0) + (roi.productivityGainsValue || 0);
        const roiPercentage = totalCost > 0 ? ((totalBenefits - totalCost) / totalCost) * 100 : 0;
        return sum + roiPercentage;
      }, 0) / projectsWithROI.length
    : 0;

  const totalCostSavings = projects.reduce((sum, p) => {
    if (p.roiCalculations.length > 0) {
      return sum + (p.roiCalculations[0].costSavings || 0);
    }
    return sum;
  }, 0);

  const totalBudgetAllocated = projects.reduce((sum, p) => sum + (p.budgetAllocated || 0), 0);
  const totalBudgetSpent = projects.reduce((sum, p) => sum + (p.budgetSpent || 0), 0);

  return {
    projects,
    totalProjects,
    avgROI,
    totalCostSavings,
    totalBudgetAllocated,
    totalBudgetSpent,
  };
}

export default async function ReportsPage() {
  const data = await getReportData();

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights and exportable reports
          </p>
        </div>
        <ExportReportButton />
      </div>

      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Executive Summary</CardTitle>
          <CardDescription>High-level overview of AI initiatives performance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Target className="h-4 w-4" />
                <span className="text-sm">Total Projects</span>
              </div>
              <div className="text-2xl font-bold">{data.totalProjects}</div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">Average ROI</span>
              </div>
              <div className="text-2xl font-bold">{formatPercentage(data.avgROI)}</div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm">Total Cost Savings</span>
              </div>
              <div className="text-2xl font-bold">{formatCurrency(data.totalCostSavings)}</div>
            </div>
          </div>

          {/* Budget Summary */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-3">Budget Summary</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Budget Allocated:</span>
                <p className="text-lg font-semibold">{formatCurrency(data.totalBudgetAllocated)}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Budget Spent:</span>
                <p className="text-lg font-semibold">{formatCurrency(data.totalBudgetSpent)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Project Performance Reports</CardTitle>
          <CardDescription>Detailed metrics for each AI initiative</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.projects.map((project) => {
              const latestROI = project.roiCalculations[0];
              const roiPercentage = latestROI ? (
                ((latestROI.costSavings || 0) + (latestROI.revenueIncrease || 0) + (latestROI.productivityGainsValue || 0) -
                ((latestROI.implementationCost || 0) + (latestROI.operationalCost || 0) + (latestROI.maintenanceCost || 0))) /
                Math.max(1, (latestROI.implementationCost || 0) + (latestROI.operationalCost || 0) + (latestROI.maintenanceCost || 0))
              ) * 100 : null;

              return (
                <div key={project.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{project.name}</h4>
                      <p className="text-sm text-muted-foreground">{project.description}</p>
                    </div>
                    <Badge>{project.status}</Badge>
                  </div>

                  <div className="grid gap-4 md:grid-cols-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">ROI:</span>
                      <p className="font-medium">
                        {roiPercentage !== null ? formatPercentage(roiPercentage) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Active KPIs:</span>
                      <p className="font-medium">{project.kpiDefinitions.length}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Open Risks:</span>
                      <p className="font-medium">{project.riskAssessments.length}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Budget Used:</span>
                      <p className="font-medium">
                        {project.budgetAllocated && project.budgetSpent
                          ? formatPercentage((project.budgetSpent / project.budgetAllocated) * 100)
                          : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <ReportsPageClient projectId={project.id} />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Report Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Report Templates</CardTitle>
          <CardDescription>Pre-configured reports for different stakeholders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="border rounded-lg p-4 space-y-3">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <h4 className="font-semibold">Executive Summary</h4>
                <p className="text-sm text-muted-foreground">
                  High-level overview for leadership
                </p>
              </div>
              <ExportReportButton reportType="executive" variant="outline" className="w-full" />
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <h4 className="font-semibold">Financial Report</h4>
                <p className="text-sm text-muted-foreground">
                  Detailed ROI and cost analysis
                </p>
              </div>
              <ExportReportButton reportType="financial" variant="outline" className="w-full" />
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <h4 className="font-semibold">Technical Report</h4>
                <p className="text-sm text-muted-foreground">
                  Performance metrics and KPIs
                </p>
              </div>
              <ExportReportButton reportType="technical" variant="outline" className="w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

