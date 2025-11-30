'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Download, TrendingUp, DollarSign, Target, AlertTriangle, Calendar, User, Building2 } from 'lucide-react';
import { formatCurrency, formatPercentage, formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/dashboard/status-badge';

interface DetailedReportDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ProjectReportData {
  id: string;
  name: string;
  description: string | null;
  status: string;
  category: string;
  department: string | null;
  owner: string | null;
  startDate: Date | null;
  targetCompletionDate: Date | null;
  budgetAllocated: number | null;
  budgetSpent: number | null;
  roi: number | null;
  activeKPIs: number;
  openRisks: number;
  kpiDefinitions: Array<{
    id: string;
    kpiName: string;
    description: string | null;
    targetValue: number | null;
    unit: string | null;
    metricsTimeseries: Array<{
      time: Date;
      metricValue: number;
    }>;
  }>;
  roiCalculations: Array<{
    calculationDate: Date;
    implementationCost: number | null;
    operationalCost: number | null;
    maintenanceCost: number | null;
    costSavings: number | null;
    revenueIncrease: number | null;
    productivityGainsValue: number | null;
    notes: string | null;
  }>;
  riskAssessments: Array<{
    id: string;
    riskTitle: string;
    severity: string;
    status: string;
    owner: { name: string };
  }>;
  phases: Array<{
    id: string;
    phaseName: string;
    status: string;
    progressPercentage: number | null;
    startDate: Date | null;
    targetEndDate: Date | null;
    milestones: Array<{
      milestoneName: string;
      isCompleted: boolean;
    }>;
  }>;
}

export function DetailedReportDialog({ projectId, open, onOpenChange }: DetailedReportDialogProps) {
  const [loading, setLoading] = useState(true);
  const [projectData, setProjectData] = useState<ProjectReportData | null>(null);

  useEffect(() => {
    if (open && projectId) {
      fetchProjectReport();
    }
  }, [open, projectId]);

  const fetchProjectReport = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reports/export?format=json&projectId=${projectId}`);
      if (!response.ok) throw new Error('Failed to fetch report');
      const data = await response.json();
      if (data.projects && data.projects.length > 0) {
        setProjectData(data.projects[0]);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'json' | 'pdf') => {
    try {
      const response = await fetch(`/api/reports/export?format=${format}&projectId=${projectId}`);
      if (!response.ok) throw new Error('Failed to export report');
      
      if (format === 'json') {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `project-report-${projectData?.name.replace(/\s+/g, '-')}-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        // PDF export would be handled here when implemented
        alert('PDF export coming soon');
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Failed to export report. Please try again.');
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading report...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!projectData) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">No data available</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const latestROI = projectData.roiCalculations[0];
  const totalCost = latestROI
    ? (latestROI.implementationCost || 0) + (latestROI.operationalCost || 0) + (latestROI.maintenanceCost || 0)
    : 0;
  const totalBenefits = latestROI
    ? (latestROI.costSavings || 0) + (latestROI.revenueIncrease || 0) + (latestROI.productivityGainsValue || 0)
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">{projectData.name} - Detailed Report</DialogTitle>
              <DialogDescription>
                Comprehensive project performance analysis
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleExport('json')}>
                <Download className="mr-2 h-4 w-4" />
                Export JSON
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Project Overview */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Project Overview</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground w-32">Status:</span>
                  <StatusBadge status={projectData.status as any} />
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground w-32">Category:</span>
                  <Badge variant="outline">{projectData.category.replace(/_/g, ' ')}</Badge>
                </div>
                {projectData.department && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground w-28">Department:</span>
                    <span className="font-medium">{projectData.department}</span>
                  </div>
                )}
                {projectData.owner && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground w-28">Owner:</span>
                    <span className="font-medium">{projectData.owner}</span>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                {projectData.startDate && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground w-32">Start Date:</span>
                    <span className="font-medium">{formatDate(projectData.startDate)}</span>
                  </div>
                )}
                {projectData.targetCompletionDate && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground w-32">Target Completion:</span>
                    <span className="font-medium">{formatDate(projectData.targetCompletionDate)}</span>
                  </div>
                )}
                {projectData.budgetAllocated && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground w-32">Budget:</span>
                    <span className="font-medium">
                      {formatCurrency(projectData.budgetSpent || 0)} / {formatCurrency(projectData.budgetAllocated)}
                      {projectData.budgetSpent && projectData.budgetAllocated && (
                        <span className="text-muted-foreground ml-2">
                          ({formatPercentage((projectData.budgetSpent / projectData.budgetAllocated) * 100)})
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
            {projectData.description && (
              <div className="pt-2">
                <p className="text-sm text-muted-foreground">{projectData.description}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Key Metrics */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Key Performance Indicators</h3>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">ROI</span>
                </div>
                <div className="text-2xl font-bold">
                  {projectData.roi !== null ? formatPercentage(projectData.roi) : 'N/A'}
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Target className="h-4 w-4" />
                  <span className="text-sm">Active KPIs</span>
                </div>
                <div className="text-2xl font-bold">{projectData.activeKPIs}</div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">Open Risks</span>
                </div>
                <div className="text-2xl font-bold">{projectData.openRisks}</div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Target className="h-4 w-4" />
                  <span className="text-sm">Phases</span>
                </div>
                <div className="text-2xl font-bold">{projectData.phases.length}</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* ROI Analysis */}
          {latestROI && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">ROI Analysis</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Costs</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Implementation:</span>
                      <span className="font-medium">{formatCurrency(latestROI.implementationCost || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Operational:</span>
                      <span className="font-medium">{formatCurrency(latestROI.operationalCost || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Maintenance:</span>
                      <span className="font-medium">{formatCurrency(latestROI.maintenanceCost || 0)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total Costs:</span>
                      <span>{formatCurrency(totalCost)}</span>
                    </div>
                  </div>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Benefits</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cost Savings:</span>
                      <span className="font-medium">{formatCurrency(latestROI.costSavings || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Revenue Increase:</span>
                      <span className="font-medium">{formatCurrency(latestROI.revenueIncrease || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Productivity Gains:</span>
                      <span className="font-medium">{formatCurrency(latestROI.productivityGainsValue || 0)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total Benefits:</span>
                      <span>{formatCurrency(totalBenefits)}</span>
                    </div>
                  </div>
                </div>
              </div>
              {latestROI.notes && (
                <div className="border rounded-lg p-4 bg-muted/50">
                  <h4 className="font-medium mb-2">Notes</h4>
                  <p className="text-sm text-muted-foreground">{latestROI.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* KPIs */}
          {projectData.kpiDefinitions.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Key Performance Indicators</h3>
                <div className="space-y-3">
                  {projectData.kpiDefinitions.map((kpi) => {
                    const latestValue = kpi.metricsTimeseries[0]?.metricValue;
                    return (
                      <div key={kpi.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium">{kpi.kpiName}</h4>
                            {kpi.description && (
                              <p className="text-sm text-muted-foreground mt-1">{kpi.description}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold">
                              {latestValue !== undefined ? latestValue.toFixed(2) : 'N/A'}
                              {kpi.unit && <span className="text-sm text-muted-foreground ml-1">{kpi.unit}</span>}
                            </div>
                            {kpi.targetValue && (
                              <div className="text-xs text-muted-foreground">
                                Target: {kpi.targetValue} {kpi.unit}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Risks */}
          {projectData.riskAssessments.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Risk Assessment</h3>
                <div className="space-y-2">
                  {projectData.riskAssessments.map((risk) => (
                    <div key={risk.id} className="border rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium">{risk.riskTitle}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Owner: {risk.owner.name}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{risk.severity}</Badge>
                        <StatusBadge status={risk.status as any} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Phases */}
          {projectData.phases.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Project Phases</h3>
                <div className="space-y-3">
                  {projectData.phases.map((phase) => (
                    <div key={phase.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{phase.phaseName}</h4>
                        <StatusBadge status={phase.status as any} />
                      </div>
                      <div className="grid gap-2 text-sm">
                        {phase.startDate && (
                          <div className="text-muted-foreground">
                            Start: {formatDate(phase.startDate)}
                          </div>
                        )}
                        {phase.targetEndDate && (
                          <div className="text-muted-foreground">
                            Target: {formatDate(phase.targetEndDate)}
                          </div>
                        )}
                        {phase.progressPercentage !== null && (
                          <div className="text-muted-foreground">
                            Progress: {phase.progressPercentage}%
                          </div>
                        )}
                        {phase.milestones.length > 0 && (
                          <div className="mt-2">
                            <span className="text-muted-foreground">Milestones: </span>
                            <span className="font-medium">
                              {phase.milestones.filter(m => m.isCompleted).length} / {phase.milestones.length} completed
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Report Footer */}
          <Separator />
          <div className="text-center text-sm text-muted-foreground py-4">
            Report generated on {formatDate(new Date())}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

