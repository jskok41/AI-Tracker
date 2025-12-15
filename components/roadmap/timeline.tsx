'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate, getDaysUntil, isOverdue } from '@/lib/utils';
import { CheckCircle2, Circle, Clock, AlertCircle, Edit } from 'lucide-react';
import { EditPhaseDialog } from '@/components/dashboard/edit-phase-dialog';
import { DelayWarning } from '@/components/roadmap/delay-warning';
import { AutoProgressIndicator } from '@/components/roadmap/auto-progress-indicator';
import type { Phase, Milestone, PhaseStatus } from '@prisma/client';

interface PhaseWithMilestones extends Omit<Phase, 'autoCalculatedProgress' | 'lastAutoCalculatedAt' | 'delayReason'> {
  milestones: Milestone[];
  autoCalculatedProgress?: boolean | null;
  lastAutoCalculatedAt?: Date | null;
  delayReason?: string | null;
}

interface TimelineProps {
  phases: PhaseWithMilestones[];
  currentPhaseId?: string;
  projectStartDate?: Date | null;
  projectTargetCompletionDate?: Date | null;
}

export function Timeline({ phases, currentPhaseId, projectStartDate, projectTargetCompletionDate }: TimelineProps) {
  const [editingPhase, setEditingPhase] = useState<string | null>(null);
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
    <div className="relative space-y-6">
      {/* Timeline Line - Enhanced */}
      <div className="absolute left-7 top-0 bottom-0 w-1 bg-gradient-to-b from-border via-border to-border" />

      {phases.map((phase, index) => {
        const isLast = index === phases.length - 1;
        const isCurrent = phase.id === currentPhaseId;
        const daysUntilEnd = phase.targetEndDate ? getDaysUntil(phase.targetEndDate) : null;

        return (
          <div key={phase.id} className="relative pl-16">
            {/* Phase Icon - Enhanced Enterprise Style */}
            <div className={`absolute left-3 top-2 flex h-10 w-10 items-center justify-center rounded-full bg-background border-3 shadow-md ${
              isCurrent ? 'border-primary border-2' : 'border-border border-2'
            }`}>
              {getPhaseIcon(phase.status)}
            </div>

            {/* Phase Card - Enterprise Style */}
            <Card className={isCurrent ? 'border-primary border-2 shadow-lg' : 'border-2'}>
              <CardContent className="pt-6 space-y-4">
                {/* Phase Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-xl font-bold">{phase.phaseName}</h3>
                      {isCurrent && (
                        <Badge className="bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 font-semibold">
                          Current
                        </Badge>
                      )}
                    </div>
                    {phase.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {phase.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusBadge status={phase.status} />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingPhase(phase.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Phase Dates - Enterprise Layout */}
                <div className="flex flex-wrap gap-6 text-sm">
                  {phase.startDate && (
                    <div>
                      <span className="text-muted-foreground font-medium">Start: </span>
                      <span className="font-semibold">{formatDate(phase.startDate)}</span>
                    </div>
                  )}
                  {phase.targetEndDate && (
                    <div>
                      <span className="text-muted-foreground font-medium">Target: </span>
                      <span className="font-semibold">{formatDate(phase.targetEndDate)}</span>
                      {daysUntilEnd !== null && daysUntilEnd > 0 && (
                        <span className="ml-1 text-muted-foreground">({daysUntilEnd} days remaining)</span>
                      )}
                    </div>
                  )}
                  {phase.endDate && (
                    <div>
                      <span className="text-muted-foreground font-medium">Completed: </span>
                      <span className="font-semibold">{formatDate(phase.endDate)}</span>
                    </div>
                  )}
                </div>

                {/* Delay Warning */}
                <DelayWarning
                  status={phase.status}
                  targetEndDate={phase.targetEndDate}
                  delayReason={phase.delayReason}
                  progressPercentage={phase.progressPercentage}
                />

                {/* Progress Bar - Enterprise Style */}
                {phase.progressPercentage !== null && (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground font-medium">Progress</span>
                        <AutoProgressIndicator
                          autoCalculated={phase.autoCalculatedProgress ?? false}
                          lastCalculatedAt={phase.lastAutoCalculatedAt}
                        />
                      </div>
                      <span className="font-semibold">{phase.progressPercentage}%</span>
                    </div>
                    <Progress value={phase.progressPercentage} className="h-2.5" />
                  </div>
                )}

                {/* Milestones - Enterprise Style */}
                {phase.milestones.length > 0 && (
                  <div className="space-y-4 pt-4 border-t-2">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Milestones
                    </h4>
                    <div className="space-y-3">
                      {phase.milestones.map((milestone) => {
                        const daysUntilMilestone = milestone.targetDate ? getDaysUntil(milestone.targetDate) : null;
                        
                        return (
                          <div key={milestone.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                            <div className="mt-0.5 flex-shrink-0">
                              {getMilestoneIcon(milestone.isCompleted, milestone.targetDate)}
                            </div>
                            <div className="flex-1 space-y-1.5 min-w-0">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <span className={`text-sm font-semibold ${milestone.isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                  {milestone.milestoneName}
                                </span>
                                {milestone.targetDate && (
                                  <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
                                    {formatDate(milestone.targetDate)}
                                    {!milestone.isCompleted && daysUntilMilestone !== null && daysUntilMilestone < 0 && (
                                      <span className="ml-1 text-red-600 font-semibold">(Overdue)</span>
                                    )}
                                  </span>
                                )}
                              </div>
                              {milestone.description && (
                                <p className="text-xs text-muted-foreground leading-relaxed">{milestone.description}</p>
                              )}
                              {milestone.deliverables && (
                                <div className="text-xs">
                                  <span className="font-semibold text-muted-foreground">Deliverables: </span>
                                  <span className="text-muted-foreground">{milestone.deliverables}</span>
                                </div>
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
            {editingPhase === phase.id && (
              <EditPhaseDialog
                phase={{
                  id: phase.id,
                  phaseName: phase.phaseName,
                  status: phase.status,
                  progressPercentage: phase.progressPercentage,
                }}
                open={editingPhase === phase.id}
                onOpenChange={(open) => !open && setEditingPhase(null)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

