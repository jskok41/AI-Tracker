'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { AreaChartComponent } from '@/components/dashboard/area-chart';
import { formatCurrency, formatDate, formatPercentage } from '@/lib/utils';
import { Edit, Plus, Map } from 'lucide-react';
import { EditPhaseDialog } from '@/components/dashboard/edit-phase-dialog';
import { AddPhaseDialog } from '@/components/dashboard/add-phase-dialog';
import { AddMetricDialog } from '@/components/dashboard/add-metric-dialog';
import { Timeline } from '@/components/roadmap/timeline';
import { AddROIDialog } from '@/components/dashboard/add-roi-dialog';
import { AddFeedbackDialog } from '@/components/dashboard/add-feedback-dialog';
import { EditRiskDialog } from '@/components/dashboard/edit-risk-dialog';
import { NewRiskDialog } from '@/components/dashboard/new-risk-dialog';

interface ProjectTabsProps {
  project: {
    id: string;
    startDate: Date | null;
    targetCompletionDate: Date | null;
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
      id: string;
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
      riskDescription: string | null;
      severity: string;
      status: string;
      owner: { name: string };
      mitigationPlan: string | null;
      projectId: string;
      ownerId: string;
      category: string | null;
      likelihood: number;
    }>;
    userFeedback: Array<{
      id: string;
      user: { name: string };
      rating: number | null;
      sentiment: string | null;
      feedbackText: string | null;
      submittedAt: Date;
    }>;
    phases: Array<{
      id: string;
      phaseName: string;
      status: string;
      progressPercentage: number | null;
      milestones: Array<{
        id: string;
        milestoneName: string;
        isCompleted: boolean;
      }>;
    }>;
  };
  firstKPI: {
    kpiName: string;
    description: string | null;
  } | null;
  chartData: Array<{ date: string; value: number }>;
  users: Array<{ id: string; name: string }>;
  projects: Array<{ id: string; name: string }>;
}

export function ProjectTabs({
  project,
  firstKPI,
  chartData,
  users,
  projects,
}: ProjectTabsProps) {
  const [editingPhase, setEditingPhase] = useState<string | null>(null);
  const [editingROI, setEditingROI] = useState<string | null>(null);
  const [editingRisk, setEditingRisk] = useState<string | null>(null);

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
        <TabsTrigger value="metrics">Metrics</TabsTrigger>
        <TabsTrigger value="roi">ROI</TabsTrigger>
        <TabsTrigger value="risks">Risks</TabsTrigger>
        <TabsTrigger value="feedback">Feedback</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        {/* KPI Chart */}
        {firstKPI && chartData.length > 0 && (
          <AreaChartComponent
            title={firstKPI.kpiName}
            description={firstKPI.description || undefined}
            data={chartData}
            dataKey="value"
            xAxisKey="date"
          />
        )}

      </TabsContent>

      <TabsContent value="roadmap" className="space-y-4">
        {/* Roadmap Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Project Roadmap</h2>
            <p className="text-muted-foreground">
              Track phases, milestones, and implementation progress
            </p>
          </div>
          <AddPhaseDialog projectId={project.id} existingPhasesCount={project.phases.length} />
        </div>

        {/* Project Timeline Info */}
        {(project.startDate || project.targetCompletionDate) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Project Timeline</CardTitle>
              <CardDescription>
                Overall project schedule and boundaries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-6 text-sm">
                {project.startDate && (
                  <div>
                    <span className="text-muted-foreground">Project Start: </span>
                    <span className="font-medium">{formatDate(project.startDate)}</span>
                  </div>
                )}
                {project.targetCompletionDate && (
                  <div>
                    <span className="text-muted-foreground">Target Completion: </span>
                    <span className="font-medium">{formatDate(project.targetCompletionDate)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Roadmap Timeline */}
        {project.phases.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Implementation Timeline</CardTitle>
              <CardDescription>
                Project phases with milestones and deliverables
                {project.startDate && project.targetCompletionDate && (
                  <span className="block mt-1">
                    Project timeline: {formatDate(project.startDate)} → {formatDate(project.targetCompletionDate)}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Timeline 
                phases={project.phases as any}
                currentPhaseId={project.phases.find(p => p.status === 'IN_PROGRESS')?.id}
                projectStartDate={project.startDate}
                projectTargetCompletionDate={project.targetCompletionDate}
              />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-12">
              <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/20">
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="rounded-full bg-muted p-3">
                      <Map className="h-6 w-6 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">No roadmap phases yet</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      Create phases to track your project's implementation progress, milestones, and timeline.
                    </p>
                  </div>
                  <AddPhaseDialog 
                    projectId={project.id} 
                    existingPhasesCount={0}
                    triggerButton={
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create First Phase
                      </Button>
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Phases Summary */}
        {project.phases.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Phases Summary</CardTitle>
              <CardDescription>
                Quick overview of all project phases with edit functionality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {project.phases.map((phase) => (
                  <div key={phase.id} className="space-y-2 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{phase.phaseName}</h4>
                        <StatusBadge status={phase.status as any} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {phase.progressPercentage ?? 0}% complete
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingPhase(phase.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {phase.description && (
                      <p className="text-sm text-muted-foreground">{phase.description}</p>
                    )}
                    {phase.milestones.length > 0 && (
                      <div className="ml-4 space-y-1 text-sm">
                        {phase.milestones.map((milestone) => (
                          <div
                            key={milestone.id}
                            className="flex items-center gap-2 text-muted-foreground"
                          >
                            <div
                              className={`h-2 w-2 rounded-full ${
                                milestone.isCompleted
                                  ? 'bg-green-500'
                                  : 'bg-gray-300'
                              }`}
                            />
                            <span>{milestone.milestoneName}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {editingPhase === phase.id && (
                      <EditPhaseDialog
                        phase={phase}
                        open={editingPhase === phase.id}
                        onOpenChange={(open) =>
                          !open && setEditingPhase(null)
                        }
                      />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="metrics" className="space-y-4">
        <div className="flex justify-end">
          <AddMetricDialog
            projectId={project.id}
            kpis={project.kpiDefinitions.map((k) => ({
              id: k.id,
              kpiName: k.kpiName,
            }))}
          />
        </div>
        <div className="grid gap-4">
          {project.kpiDefinitions.map((kpi) => {
            const latestValue = kpi.metricsTimeseries[0]?.metricValue;
            return (
              <Card key={kpi.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{kpi.kpiName}</CardTitle>
                      <CardDescription>{kpi.description}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {latestValue !== undefined
                          ? latestValue.toFixed(2)
                          : 'N/A'}
                      </div>
                      {kpi.targetValue && (
                        <div className="text-sm text-muted-foreground">
                          Target: {kpi.targetValue} {kpi.unit}
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </TabsContent>

      <TabsContent value="roi" className="space-y-4">
        <div className="flex justify-end">
          <AddROIDialog projectId={project.id} />
        </div>
        {project.roiCalculations.length > 0 ? (
          <div className="grid gap-4">
            {project.roiCalculations.map((roi) => {
              const totalCost =
                (roi.implementationCost || 0) +
                (roi.operationalCost || 0) +
                (roi.maintenanceCost || 0);
              const totalBenefits =
                (roi.costSavings || 0) +
                (roi.revenueIncrease || 0) +
                (roi.productivityGainsValue || 0);
              const roiCalc =
                totalCost > 0 ? ((totalBenefits - totalCost) / totalCost) * 100 : 0;

              return (
                <Card key={roi.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{formatDate(roi.calculationDate)}</CardTitle>
                      <div className="flex items-center gap-2">
                        <div className="text-2xl font-bold text-primary">
                          {formatPercentage(roiCalc)} ROI
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingROI(roi.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <h4 className="font-medium">Costs</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Implementation:
                            </span>
                            <span>
                              {formatCurrency(roi.implementationCost || 0)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Operational:
                            </span>
                            <span>{formatCurrency(roi.operationalCost || 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Maintenance:
                            </span>
                            <span>
                              {formatCurrency(roi.maintenanceCost || 0)}
                            </span>
                          </div>
                          <div className="flex justify-between font-medium border-t pt-1">
                            <span>Total:</span>
                            <span>{formatCurrency(totalCost)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">Benefits</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Cost Savings:
                            </span>
                            <span>{formatCurrency(roi.costSavings || 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Revenue Increase:
                            </span>
                            <span>
                              {formatCurrency(roi.revenueIncrease || 0)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Productivity Gains:
                            </span>
                            <span>
                              {formatCurrency(roi.productivityGainsValue || 0)}
                            </span>
                          </div>
                          <div className="flex justify-between font-medium border-t pt-1">
                            <span>Total:</span>
                            <span>{formatCurrency(totalBenefits)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {roi.notes && (
                      <div className="mt-4 text-sm text-muted-foreground">
                        <strong>Notes:</strong> {roi.notes}
                      </div>
                    )}
                  </CardContent>
                  {editingROI === roi.id && (
                    <AddROIDialog
                      projectId={project.id}
                      roi={{
                        ...roi,
                        calculationDate: roi.calculationDate.toISOString(),
                      }}
                      open={editingROI === roi.id}
                      onOpenChange={(open) => !open && setEditingROI(null)}
                    />
                  )}
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No ROI calculations yet
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="risks" className="space-y-4">
        <div className="flex justify-end">
          <NewRiskDialog
            projects={projects}
            users={users.map((u) => ({ ...u, email: '' }))}
          />
        </div>
        {project.riskAssessments.length > 0 ? (
          <div className="grid gap-4">
            {project.riskAssessments.map((risk) => (
              <Card key={risk.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{risk.riskTitle}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{risk.severity}</Badge>
                      <StatusBadge status={risk.status as any} />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingRisk(risk.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>{risk.riskDescription}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">Owner:</span>
                      <span>{risk.owner.name}</span>
                    </div>
                    {risk.mitigationPlan && (
                      <div>
                        <span className="text-muted-foreground">Mitigation:</span>
                        <p className="mt-1">{risk.mitigationPlan}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                {editingRisk === risk.id && (
                  <EditRiskDialog
                    risk={risk}
                    open={editingRisk === risk.id}
                    onOpenChange={(open) => !open && setEditingRisk(null)}
                    projects={projects}
                    users={users.map((u) => ({ ...u, email: '' }))}
                  />
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No risks identified
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="feedback" className="space-y-4">
        <div className="flex justify-end">
          <AddFeedbackDialog projectId={project.id} users={users} />
        </div>
        {project.userFeedback.length > 0 ? (
          <div className="grid gap-4">
            {project.userFeedback.map((feedback) => (
              <Card key={feedback.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{feedback.user.name}</span>
                      {feedback.sentiment && (
                        <Badge variant="outline">{feedback.sentiment}</Badge>
                      )}
                    </div>
                    {feedback.rating && (
                      <div className="flex items-center gap-1">
                        {'⭐'.repeat(feedback.rating)}
                      </div>
                    )}
                  </div>
                </CardHeader>
                {feedback.feedbackText && (
                  <CardContent>
                    <p className="text-sm">{feedback.feedbackText}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatDate(feedback.submittedAt)}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No feedback yet
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
}

