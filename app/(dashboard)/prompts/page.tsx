import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { NewPromptDialog } from '@/components/dashboard/new-prompt-dialog';
import { PromptsList } from '@/components/dashboard/prompts-list';
import { Plus, Search, Copy, Star, TrendingUp } from 'lucide-react';
import { formatNumber, formatRelativeTime } from '@/lib/utils';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

async function getPrompts(departmentIds?: string[]) {
  const where: any = {
    isActive: true,
  };
  
  // Filter by departments if provided (via associated projects)
  // Only show prompts that have a project and that project's department is selected
  if (departmentIds && departmentIds.length > 0) {
    where.project = {
      departmentId: {
        in: departmentIds,
      },
    };
    // Only include prompts that have a project (projectId is not null)
    where.projectId = {
      not: null,
    };
  }

  const prompts = await prisma.promptLibrary.findMany({
    where,
    include: {
      author: {
        select: {
          name: true,
          email: true,
        },
      },
      project: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      usageCount: 'desc',
    },
  });

  return prompts.map(prompt => ({
    ...prompt,
    tagsArray: prompt.tags ? prompt.tags.split(',').map(t => t.trim()) : [],
  }));
}

async function getPromptStats(departmentIds?: string[]) {
  const baseWhere: any = { isActive: true };
  
  // Filter by departments if provided (via associated projects)
  if (departmentIds && departmentIds.length > 0) {
    baseWhere.project = {
      departmentId: {
        in: departmentIds,
      },
    };
    // Only include prompts that have a project (projectId is not null)
    baseWhere.projectId = {
      not: null,
    };
  }

  const totalPrompts = await prisma.promptLibrary.count({
    where: baseWhere,
  });

  const totalUsage = await prisma.promptLibrary.aggregate({
    where: baseWhere,
    _sum: {
      usageCount: true,
    },
  });

  const avgRatingWhere = {
    ...baseWhere,
    averageRating: { not: null },
  };

  const avgRating = await prisma.promptLibrary.aggregate({
    where: avgRatingWhere,
    _avg: {
      averageRating: true,
    },
  });

  const topCategoriesWhere = {
    ...baseWhere,
    category: { not: null },
  };

  const topCategories = await prisma.promptLibrary.groupBy({
    by: ['category'],
    where: topCategoriesWhere,
    _count: true,
    orderBy: {
      _count: {
        category: 'desc',
      },
    },
    take: 5,
  });

  return {
    totalPrompts,
    totalUsage: totalUsage._sum.usageCount || 0,
    avgRating: avgRating._avg.averageRating || 0,
    topCategories,
  };
}

export default async function PromptsPage({
  searchParams,
}: {
  searchParams: Promise<{ departmentId?: string | string[] }>;
}) {
  const params = await searchParams;
  // Handle multiple departmentId params
  const departmentIds = params.departmentId 
    ? (Array.isArray(params.departmentId) ? params.departmentId : [params.departmentId])
    : undefined;
  
  const [prompts, stats, projects, users] = await Promise.all([
    getPrompts(departmentIds),
    getPromptStats(departmentIds),
    prisma.aIProject.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    prisma.user.findMany({
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight cyberpunk:text-white cyberpunk:drop-shadow-[0_0_10px_rgba(0,255,65,0.5)]">
            Prompt Library
          </h1>
          <p className="text-muted-foreground cyberpunk:text-[#00FF41]/70">
            Centralized repository of AI prompts for your organization
          </p>
        </div>
        <NewPromptDialog projects={projects} users={users} />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Prompts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPrompts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalUsage)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</div>
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search prompts by title, text, or tags..." 
                className="pl-10"
              />
            </div>
            <Button variant="outline">Filters</Button>
          </div>
        </CardContent>
      </Card>

      {/* Prompts Grid */}
      {prompts.length > 0 ? (
        <PromptsList 
          prompts={prompts} 
          projects={projects} 
          users={users} 
        />
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="mx-auto max-w-md space-y-3 text-center">
              <h3 className="text-lg font-semibold">No prompts yet</h3>
              <p className="text-sm text-muted-foreground">
                Start building your organization's prompt library by adding your first prompt.
              </p>
              <NewPromptDialog 
                projects={projects} 
                users={users}
                triggerButton={
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Prompt
                  </Button>
                }
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

