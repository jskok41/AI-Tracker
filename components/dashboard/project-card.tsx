import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from './status-badge';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import type { ProjectCategory, ProjectStatus } from '@prisma/client';
import { TrendingUp, AlertTriangle, Target } from 'lucide-react';

interface ProjectCardProps {
  id: string;
  name: string;
  description?: string | null;
  category: ProjectCategory;
  status: ProjectStatus;
  budgetAllocated?: number | null;
  budgetSpent?: number | null;
  latestROI?: number | null;
  activeKPIs?: number;
  openRisks?: number;
  department?: { id: string; name: string } | null;
}

export function ProjectCard({
  id,
  name,
  description,
  category,
  status,
  budgetAllocated,
  budgetSpent,
  latestROI,
  activeKPIs = 0,
  openRisks = 0,
  department,
}: ProjectCardProps) {
  const budgetProgress = budgetAllocated && budgetSpent
    ? (budgetSpent / budgetAllocated) * 100
    : 0;

  return (
    <Link href={`/projects/${id}`}>
      <Card className="transition-all hover:shadow-lg cursor-pointer cyberpunk:bg-black/40 cyberpunk:backdrop-blur-sm cyberpunk:border-[#00FF41]/30 cyberpunk:shadow-[0_0_20px_rgba(0,255,65,0.1)] cyberpunk:hover:shadow-[0_0_30px_rgba(0,255,65,0.2)]">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg cyberpunk:text-white cyberpunk:drop-shadow-[0_0_8px_rgba(0,255,65,0.5)]">{name}</CardTitle>
              <CardDescription className="line-clamp-2 cyberpunk:text-[#00FF41]/70">
                {description || 'No description'}
              </CardDescription>
            </div>
            <StatusBadge status={status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Category and Department Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs cyberpunk:bg-black/50 cyberpunk:border-[#00FF41]/50 cyberpunk:text-[#00FF41]">
              {category.replace(/_/g, ' ')}
            </Badge>
            {department && (
              <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/40 border-blue-300 dark:border-blue-800/40 text-xs cyberpunk:bg-black/50 cyberpunk:border-[#00FF41]/50 cyberpunk:text-[#00FF41]/90">
                  <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500 dark:bg-blue-400 cyberpunk:bg-[#00FF41] cyberpunk:shadow-[0_0_4px_rgba(0,255,65,0.5)]" />
                  {department.name}
                </div>
              </Badge>
            )}
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground cyberpunk:text-[#00FF41]/70" />
              <div>
                <div className="text-xs text-muted-foreground cyberpunk:text-[#00FF41]/70">ROI</div>
                <div className="font-medium cyberpunk:text-white">
                  {latestROI !== null && latestROI !== undefined 
                    ? formatPercentage(latestROI) 
                    : 'N/A'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground cyberpunk:text-[#00FF41]/70" />
              <div>
                <div className="text-xs text-muted-foreground cyberpunk:text-[#00FF41]/70">KPIs</div>
                <div className="font-medium cyberpunk:text-white">{activeKPIs}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground cyberpunk:text-[#00FF41]/70" />
              <div>
                <div className="text-xs text-muted-foreground cyberpunk:text-[#00FF41]/70">Risks</div>
                <div className="font-medium cyberpunk:text-white">{openRisks}</div>
              </div>
            </div>
          </div>

          {/* Budget Progress */}
          {budgetAllocated && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground cyberpunk:text-[#00FF41]/70">Budget</span>
                <span className="font-medium cyberpunk:text-white">
                  {formatCurrency(budgetSpent || 0)} / {formatCurrency(budgetAllocated)}
                </span>
              </div>
              <Progress value={budgetProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

