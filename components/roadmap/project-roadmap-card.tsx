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
import { ChevronDown, ChevronRight, ExternalLink, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    department?: { id: string; name: string } | null;
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
      <Card className="transition-all border-2">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors pb-4">
            {/* Enterprise Header Layout */}
            <div className="space-y-4">
              {/* Top Row: Title, Tags, External Link */}
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-1">
                    {isOpen ? (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <CardTitle className="text-xl font-bold">{project.name}</CardTitle>
                      <StatusBadge status={project.status as any} />
                      {project.department && (
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300 text-xs font-medium">
                          <div className="flex items-center gap-1.5">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                            {project.department.name}
                          </div>
                        </Badge>
                      )}
                      <Link 
                        href={`/projects/${project.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="hover:text-primary transition-colors"
                      >
                        <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Row: Project Dates (Centered) */}
              {project.startDate && project.targetCompletionDate && (
                <div className="text-center">
                  <CardDescription className="text-base font-medium">
                    {formatDate(project.startDate)} → {formatDate(project.targetCompletionDate)}
                  </CardDescription>
                </div>
              )}

              {/* Bottom Row: Quick Stats Summary */}
              <div className="flex items-center justify-end gap-6 text-sm">
                <div className="text-right">
                  <div className="text-xs text-muted-foreground font-medium">Progress</div>
                  <div className="text-lg font-bold">{overallProgress.toFixed(0)}%</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground font-medium">Phases</div>
                  <div className="text-lg font-bold">{completedPhases}/{totalPhases}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground font-medium">Milestones</div>
                  <div className="text-lg font-bold">{completedMilestones}/{totalMilestones}</div>
                </div>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-6 space-y-6">
            {/* Enterprise Metric Cards - Top Row */}
            <div className="grid gap-4 md:grid-cols-3">
              {/* Overall Progress Card */}
              <Card className="border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Overall Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-3xl font-bold">{overallProgress.toFixed(0)}%</div>
                  <Progress value={overallProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {completedPhases} of {totalPhases} phases completed
                  </p>
                </CardContent>
              </Card>

              {/* Current Phase Card */}
              <Card className="border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Current Phase
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-xl font-bold">
                    {currentPhase ? currentPhase.phaseName : 'All Complete'}
                  </div>
                  {currentPhase && (
                    <p className="text-sm text-muted-foreground">
                      {currentPhase.progressPercentage ?? 0}% progress
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Milestones Card */}
              <Card className="border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Milestones
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-3xl font-bold">
                    {completedMilestones}/{totalMilestones}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {totalMilestones > 0 
                      ? `${((completedMilestones / totalMilestones) * 100).toFixed(0)}% complete` 
                      : 'No milestones'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Project Timeline Section */}
            {(project.startDate || project.targetCompletionDate) && (
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Project Timeline</CardTitle>
                  <CardDescription className="text-sm">
                    Overall project schedule and boundaries
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-6 text-sm">
                    {project.startDate && (
                      <div>
                        <span className="text-muted-foreground font-medium">Project Start: </span>
                        <span className="font-semibold">{formatDate(project.startDate)}</span>
                      </div>
                    )}
                    {project.targetCompletionDate && (
                      <div>
                        <span className="text-muted-foreground font-medium">Target Completion: </span>
                        <span className="font-semibold">{formatDate(project.targetCompletionDate)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Implementation Timeline Section */}
            {project.phases.length > 0 ? (
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Implementation Timeline</CardTitle>
                  <CardDescription className="text-sm">
                    Project phases with milestones and deliverables
                    {project.startDate && project.targetCompletionDate && (
                      <span className="block mt-1 font-medium">
                        Project timeline: {formatDate(project.startDate)} → {formatDate(project.targetCompletionDate)}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <Timeline 
                    phases={project.phases}
                    currentPhaseId={currentPhase?.id}
                    projectStartDate={project.startDate}
                    projectTargetCompletionDate={project.targetCompletionDate}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Implementation Timeline</CardTitle>
                  <CardDescription className="text-sm">
                    No phases defined for this project yet.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center py-12">
                  <p className="text-sm text-muted-foreground mb-4">
                    Add phases to track your project's implementation progress.
                  </p>
                  <Link href={`/projects/${project.id}`}>
                    <Button variant="outline" size="sm">
                      <Map className="mr-2 h-4 w-4" />
                      Go to Project to Add Phases
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

