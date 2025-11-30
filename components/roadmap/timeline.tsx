'use client';

import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { formatDate, getDaysUntil, isOverdue } from '@/lib/utils';
import { CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react';
import type { Phase, Milestone, PhaseStatus } from '@prisma/client';

interface PhaseWithMilestones extends Phase {
  milestones: Milestone[];
}

interface TimelineProps {
  phases: PhaseWithMilestones[];
  currentPhaseId?: string;
  projectStartDate?: Date | null;
  projectTargetCompletionDate?: Date | null;
}

export function Timeline({ phases, currentPhaseId, projectStartDate, projectTargetCompletionDate }: TimelineProps) {
  const getPhaseIcon = (status: PhaseStatus) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="h-6 w-6 text-green-600" />;
      case 'IN_PROGRESS':
        return <Clock className="h-6 w-6 text-blue-600" />;
      case 'DELAYED':
        return <AlertCircle className="h-6 w-6 text-red-600" />;
      default:
        return <Circle className="h-6 w-6 text-gray-400" />;
    }
  };

  const getMilestoneIcon = (isCompleted: boolean, targetDate?: Date | null) => {
    if (isCompleted) {
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    }
    if (targetDate && isOverdue(targetDate)) {
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
    return <Circle className="h-4 w-4 text-gray-400" />;
  };

  // Check if phases are within project timeline
  const phasesWithinTimeline = phases.filter(phase => {
    if (!projectStartDate || !projectTargetCompletionDate) return true;
    const phaseStart = phase.startDate || projectStartDate;
    const phaseEnd = phase.targetEndDate || phase.endDate || projectTargetCompletionDate;
    return phaseStart >= projectStartDate && phaseEnd <= projectTargetCompletionDate;
  });

  const hasPhasesOutsideTimeline = phases.length > phasesWithinTimeline.length;

  return (
    <div className="relative space-y-8">
      {/* Project Timeline Boundaries */}
      {(projectStartDate || projectTargetCompletionDate) && (
        <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-dashed">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500" />
              <span className="font-medium">Project Timeline:</span>
            </div>
            {projectStartDate && (
              <span>
                <span className="text-muted-foreground">Start: </span>
                <span className="font-medium">{formatDate(projectStartDate)}</span>
              </span>
            )}
            {projectTargetCompletionDate && (
              <span>
                <span className="text-muted-foreground">Target Completion: </span>
                <span className="font-medium">{formatDate(projectTargetCompletionDate)}</span>
              </span>
            )}
            {hasPhasesOutsideTimeline && (
              <Badge variant="outline" className="ml-auto">
                Some phases outside timeline
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Timeline Line */}
      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

      {phases.map((phase, index) => {
        const isLast = index === phases.length - 1;
        const isCurrent = phase.id === currentPhaseId;
        const daysUntilEnd = phase.targetEndDate ? getDaysUntil(phase.targetEndDate) : null;

        return (
          <div key={phase.id} className="relative pl-14">
            {/* Phase Icon */}
            <div className="absolute left-2 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-background border-2 border-border">
              {getPhaseIcon(phase.status)}
            </div>

            {/* Phase Card */}
            <Card className={isCurrent ? 'border-primary shadow-lg' : ''}>
              <CardContent className="pt-6 space-y-4">
                {/* Phase Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{phase.phaseName}</h3>
                      {isCurrent && <Badge>Current</Badge>}
                    </div>
                    {phase.description && (
                      <p className="text-sm text-muted-foreground">{phase.description}</p>
                    )}
                  </div>
                  <StatusBadge status={phase.status} />
                </div>

                {/* Phase Dates */}
                <div className="flex gap-6 text-sm">
                  {phase.startDate && (
                    <div>
                      <span className="text-muted-foreground">Start: </span>
                      <span className="font-medium">{formatDate(phase.startDate)}</span>
                    </div>
                  )}
                  {phase.targetEndDate && (
                    <div>
                      <span className="text-muted-foreground">Target: </span>
                      <span className="font-medium">{formatDate(phase.targetEndDate)}</span>
                      {daysUntilEnd !== null && daysUntilEnd > 0 && (
                        <span className="ml-1 text-muted-foreground">({daysUntilEnd} days)</span>
                      )}
                    </div>
                  )}
                  {phase.endDate && (
                    <div>
                      <span className="text-muted-foreground">Completed: </span>
                      <span className="font-medium">{formatDate(phase.endDate)}</span>
                    </div>
                  )}
                </div>

                {/* Progress */}
                {phase.progressPercentage !== null && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{phase.progressPercentage}%</span>
                    </div>
                    <Progress value={phase.progressPercentage} />
                  </div>
                )}

                {/* Milestones */}
                {phase.milestones.length > 0 && (
                  <div className="space-y-3 pt-2 border-t">
                    <h4 className="text-sm font-medium">Milestones</h4>
                    <div className="space-y-2">
                      {phase.milestones.map((milestone) => {
                        const daysUntilMilestone = milestone.targetDate ? getDaysUntil(milestone.targetDate) : null;
                        
                        return (
                          <div key={milestone.id} className="flex items-start gap-3">
                            <div className="mt-0.5">
                              {getMilestoneIcon(milestone.isCompleted, milestone.targetDate)}
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className={`text-sm font-medium ${milestone.isCompleted ? 'text-muted-foreground line-through' : ''}`}>
                                  {milestone.milestoneName}
                                </span>
                                {milestone.targetDate && (
                                  <span className="text-xs text-muted-foreground">
                                    {formatDate(milestone.targetDate)}
                                    {!milestone.isCompleted && daysUntilMilestone !== null && daysUntilMilestone < 0 && (
                                      <span className="ml-1 text-red-600">(Overdue)</span>
                                    )}
                                  </span>
                                )}
                              </div>
                              {milestone.description && (
                                <p className="text-xs text-muted-foreground">{milestone.description}</p>
                              )}
                              {milestone.deliverables && (
                                <p className="text-xs text-muted-foreground">
                                  <strong>Deliverables:</strong> {milestone.deliverables}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}

