import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Timeline } from '@/components/roadmap/timeline';
import { ProjectSelector } from '@/components/roadmap/project-selector';
import { Progress } from '@/components/ui/progress';
import { formatDate } from '@/lib/utils';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

async function getAllProjects() {
  return await prisma.aIProject.findMany({
    where: {
      phases: {
        some: {},
      },
    },
    select: {
      id: true,
      name: true,
      status: true,
    },
    orderBy: {
      name: 'asc',
    },
  });
}

async function getProjectRoadmap(projectId?: string) {
  // Get first project with phases if no projectId specified
  if (!projectId) {
    const firstProject = await prisma.aIProject.findFirst({
      where: {
        phases: {
          some: {},
        },
      },
      select: {
        id: true,
        name: true,
        startDate: true,
        targetCompletionDate: true,
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

    if (!firstProject) return null;

    return firstProject;
  }

  const project = await prisma.aIProject.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      name: true,
      startDate: true,
      targetCompletionDate: true,
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

  return project;
}

export default async function RoadmapPage({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string }>;
}) {
  const { projectId } = await searchParams;
  const projects = await getAllProjects();
  const project = await getProjectRoadmap(projectId);

  if (!project) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Project Roadmap</h1>
          <p className="text-muted-foreground">
            Visualize project phases and milestones
          </p>
        </div>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              No projects with roadmap data found. Create phases and milestones for your projects to view them here.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Project Roadmap</h1>
          <p className="text-muted-foreground">
            Track project phases, milestones, and implementation progress
          </p>
        </div>
        
        {/* Project Selector */}
        {projects.length > 1 && (
          <ProjectSelector projects={projects} currentProjectId={project.id} />
        )}
      </div>

      {/* Project Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
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
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Phase
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-2xl font-bold">
                {currentPhase ? currentPhase.phaseName : 'All Complete'}
              </div>
              {currentPhase && (
                <p className="text-xs text-muted-foreground">
                  {currentPhase.progressPercentage}% progress
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
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
            <CardTitle>Project Timeline</CardTitle>
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
      <Card>
        <CardHeader>
          <CardTitle>{project.name} - Implementation Timeline</CardTitle>
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
    </div>
  );
}

