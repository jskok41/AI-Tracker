import { ProjectsList } from '@/components/dashboard/projects-list';
import { NewProjectDialog } from '@/components/dashboard/new-project-dialog';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

async function getProjects(category?: string | null, departmentIds?: string | string[] | null) {
  const where: any = {};
  
  if (category) {
    // Check if it's a standard enum category or a custom category
    const standardCategories = ['AI_AGENT', 'AI_INITIATIVE', 'PROMPT_LIBRARY', 'GEN_AI_PRODUCTION', 'RISK_MANAGEMENT', 'OTHER'];
    if (standardCategories.includes(category)) {
      where.category = category;
      // If it's OTHER and we're looking for a custom category, also filter by description
      if (category === 'OTHER') {
        // We'll filter client-side for custom categories
      }
    } else {
      // Custom category - filter by OTHER category and description contains the custom name
      where.category = 'OTHER';
      where.description = {
        contains: `Custom Category: ${category}`,
        mode: 'insensitive',
      };
    }
  }
  
  // Handle multiple department IDs
  if (departmentIds) {
    const ids = Array.isArray(departmentIds) ? departmentIds : [departmentIds];
    if (ids.length > 0) {
      where.departmentId = {
        in: ids,
      };
    }
  }

  const projects = await prisma.aIProject.findMany({
    where,
    include: {
      department: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          kpiDefinitions: true,
          riskAssessments: { where: { status: 'OPEN' } },
        },
      },
      roiCalculations: {
        orderBy: { calculationDate: 'desc' },
        take: 1,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return projects.map(project => {
    const latestROI = project.roiCalculations[0];
    const roiPercentage = latestROI ? (
      ((latestROI.costSavings || 0) + (latestROI.revenueIncrease || 0) + (latestROI.productivityGainsValue || 0) -
      ((latestROI.implementationCost || 0) + (latestROI.operationalCost || 0) + (latestROI.maintenanceCost || 0))) /
      Math.max(1, (latestROI.implementationCost || 0) + (latestROI.operationalCost || 0) + (latestROI.maintenanceCost || 0))
    ) * 100 : null;

    return {
      ...project,
      latestROI: roiPercentage,
      activeKPIs: project._count.kpiDefinitions,
      openRisks: project._count.riskAssessments,
    };
  });
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; departmentId?: string | string[] }>;
}) {
  const params = await searchParams;
  // Handle multiple departmentId params (URL can have ?departmentId=id1&departmentId=id2)
  const departmentIds = params.departmentId 
    ? (Array.isArray(params.departmentId) ? params.departmentId : [params.departmentId])
    : undefined;
  
  const [projects, departments, users] = await Promise.all([
    getProjects(params.category, departmentIds),
    prisma.department.findMany({ orderBy: { name: 'asc' } }),
    prisma.user.findMany({ 
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' } 
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Projects</h1>
          <p className="text-muted-foreground">
            Manage and track all your AI initiatives
          </p>
        </div>
        <NewProjectDialog departments={departments} users={users} />
      </div>

      {/* Projects Grid */}
      {projects.length > 0 ? (
        <ProjectsList 
          projects={projects} 
          departments={departments} 
          users={users} 
        />
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <div className="mx-auto max-w-md space-y-3">
            <h3 className="text-lg font-semibold">No projects yet</h3>
            <p className="text-sm text-muted-foreground">
              Get started by creating your first AI project to track its benefits and ROI.
            </p>
            <NewProjectDialog departments={departments} users={users} />
          </div>
        </div>
      )}
    </div>
  );
}

