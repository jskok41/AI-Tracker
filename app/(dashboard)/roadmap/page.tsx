import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { ProjectRoadmapCard } from '@/components/roadmap/project-roadmap-card';
import { RoadmapRefreshButton } from '@/components/roadmap/roadmap-refresh-button';
import { Button } from '@/components/ui/button';
import prisma from '@/lib/db';
import { FolderKanban } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getAllProjectsWithRoadmaps() {
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
    orderBy: {
      name: 'asc',
    },
  });
}

export default async function RoadmapPage() {
  const projects = await getAllProjectsWithRoadmaps();

  // Calculate overall statistics across all projects
  const totalProjects = projects.length;
  const totalPhases = projects.reduce((sum, p) => sum + p.phases.length, 0);
  const completedPhases = projects.reduce(
    (sum, p) => sum + p.phases.filter(ph => ph.status === 'COMPLETED').length,
    0
  );
  const totalMilestones = projects.reduce(
    (sum, p) => sum + p.phases.reduce((phaseSum, ph) => phaseSum + ph.milestones.length, 0),
    0
  );
  const completedMilestones = projects.reduce(
    (sum, p) => sum + p.phases.reduce(
      (phaseSum, ph) => phaseSum + ph.milestones.filter(m => m.isCompleted).length,
      0
    ),
    0
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Project Roadmap</h1>
          <p className="text-muted-foreground">
            Track project phases, milestones, and implementation progress across all projects
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Refresh Button */}
          <RoadmapRefreshButton />
          
          {/* View All Projects Link */}
          <Link href="/projects">
            <Button variant="outline" size="sm">
              <FolderKanban className="h-4 w-4 mr-2" />
              View All Projects
            </Button>
          </Link>
        </div>
      </div>

      {/* Overall Statistics */}
      {totalProjects > 0 && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Total Projects</div>
                <div className="text-2xl font-bold">{totalProjects}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Total Phases</div>
                <div className="text-2xl font-bold">{completedPhases}/{totalPhases}</div>
                <div className="text-xs text-muted-foreground">
                  {totalPhases > 0 ? `${((completedPhases / totalPhases) * 100).toFixed(0)}% complete` : 'No phases'}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Total Milestones</div>
                <div className="text-2xl font-bold">{completedMilestones}/{totalMilestones}</div>
                <div className="text-xs text-muted-foreground">
                  {totalMilestones > 0 ? `${((completedMilestones / totalMilestones) * 100).toFixed(0)}% complete` : 'No milestones'}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Active Projects</div>
                <div className="text-2xl font-bold">
                  {projects.filter(p => 
                    p.status === 'PLANNING' || 
                    p.status === 'PILOT' || 
                    p.status === 'SCALING' || 
                    p.status === 'PRODUCTION'
                  ).length}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Projects List */}
      {projects.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              No projects with roadmap data found. Create phases and milestones for your projects to view them here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {projects.map((project, index) => (
            <ProjectRoadmapCard 
              key={project.id} 
              project={project}
              defaultOpen={index === 0} // Open first project by default
            />
          ))}
        </div>
      )}
    </div>
  );
}

