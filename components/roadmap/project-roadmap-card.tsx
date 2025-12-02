'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Timeline } from '@/components/roadmap/timeline';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { formatDate } from '@/lib/utils';
import { ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import type { Phase, Milestone } from '@prisma/client';

interface PhaseWithMilestones extends Phase {
  milestones: Milestone[];
}

interface ProjectRoadmapCardProps {
  project: {
    id: string;
    name: string;
    status: string;
    startDate: Date | null;
    targetCompletionDate: Date | null;
    phases: PhaseWithMilestones[];
  };
  defaultOpen?: boolean;
}

export function ProjectRoadmapCard({ project, defaultOpen = false }: ProjectRoadmapCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Calculate overall progress
  const totalPhases = project.phases.length;
  const completedPhases = project.phases.filter(p => p.status === 'COMPLETED').length;
  const overallProgress = totalPhases > 0 ? (completedPhases / totalPhases) * 100 : 0;

  // Find current phase
  const currentPhase = project.phases.find(p => p.status === 'IN_PROGRESS') || 
                       project.phases.find(p => p.status === 'NOT_STARTED');

  // Count milestones
  const totalMilestones = project.phases.reduce((sum, p) => sum + p.milestones.length, 0);
  const completedMilestones = project.phases.reduce(
    (sum, p) => sum + p.milestones.filter(m => m.isCompleted).length, 
    0
  );

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="transition-all">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-1">
                  {isOpen ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <StatusBadge status={project.status as any} />
                    <Link 
                      href={`/projects/${project.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="hover:text-primary transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary" />
                    </Link>
                  </div>
                  <CardDescription>
                    {project.startDate && project.targetCompletionDate ? (
                      <span>
                        {formatDate(project.startDate)} → {formatDate(project.targetCompletionDate)}
                      </span>
                    ) : (
                      'No timeline set'
                    )}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Progress</div>
                  <div className="font-semibold">{overallProgress.toFixed(0)}%</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Phases</div>
                  <div className="font-semibold">{completedPhases}/{totalPhases}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Milestones</div>
                  <div className="font-semibold">{completedMilestones}/{totalMilestones}</div>
                </div>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-6">
            {/* Project Overview Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Overall Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">{overallProgress.toFixed(0)}%</div>
                    <Progress value={overallProgress} />
                    <p className="text-xs text-muted-foreground">
                      {completedPhases} of {totalPhases} phases completed
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Current Phase
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <div className="text-lg font-bold">
                      {currentPhase ? currentPhase.phaseName : 'All Complete'}
                    </div>
                    {currentPhase && (
                      <p className="text-xs text-muted-foreground">
                        {currentPhase.progressPercentage ?? 0}% progress
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Milestones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold">
                      {completedMilestones}/{totalMilestones}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {totalMilestones > 0 
                        ? `${((completedMilestones / totalMilestones) * 100).toFixed(0)}% complete` 
                        : 'No milestones'}
                    </p>
                  </div>
                </CardContent>
              </Card>
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

            {/* Timeline */}
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
                    phases={project.phases}
                    currentPhaseId={currentPhase?.id}
                    projectStartDate={project.startDate}
                    projectTargetCompletionDate={project.targetCompletionDate}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    No phases defined for this project yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

