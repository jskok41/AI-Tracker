'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { StatusBadge } from './status-badge';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import type { ProjectCategory, ProjectStatus } from '@prisma/client';
import { 
  ChevronDown, 
  ChevronRight, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  DollarSign,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Project {
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
  startDate?: Date | null;
  targetCompletionDate?: Date | null;
  // Key Highlight Remarks
  team?: string | null;
  ownerContact?: string | null;
  problemStatement?: string | null;
  aiMlApproach?: string | null;
  deploymentEnvironment?: string | null;
  benefitRealized?: string | null;
  validationMethod?: string | null;
  currentBlockers?: string | null;
  nextSteps?: string | null;
}

interface ExpandableProjectListProps {
  projects: Project[];
}

// Color mapping for project categories
const categoryColors: Record<ProjectCategory, { bg: string; border: string; text: string }> = {
  AI_AGENT: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  AI_INITIATIVE: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
  GEN_AI_PRODUCTION: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
  PROMPT_LIBRARY: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
  RISK_MANAGEMENT: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
  OTHER: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700' },
};

function getCategoryColor(category: ProjectCategory) {
  return categoryColors[category] || { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700' };
}

function formatCategoryName(category: ProjectCategory): string {
  return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export function ExpandableProjectList({ projects }: ExpandableProjectListProps) {
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  const toggleProject = (projectId: string) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  return (
    <div className="space-y-2">
      {projects.map((project) => {
        const isExpanded = expandedProjects.has(project.id);
        const categoryColor = getCategoryColor(project.category);
        const budgetProgress = project.budgetAllocated && project.budgetSpent
          ? (project.budgetSpent / project.budgetAllocated) * 100
          : 0;

        return (
          <div
            key={project.id}
            className={cn(
              'border rounded-lg transition-all overflow-hidden',
              categoryColor.border,
              isExpanded && 'shadow-md'
            )}
          >
            {/* Collapsible Header */}
            <Collapsible open={isExpanded} onOpenChange={() => toggleProject(project.id)}>
              <CollapsibleTrigger className="w-full">
                <div className={cn(
                  'flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors',
                  categoryColor.bg
                )}>
                  {/* Category Color Marker */}
                  <div className={cn(
                    'w-1 h-12 rounded-full flex-shrink-0',
                    categoryColor.border.replace('border-', 'bg-')
                  )} />

                  {/* Expand/Collapse Icon */}
                  <div className="flex-shrink-0">
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>

                  {/* Project Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-lg truncate">{project.name}</h3>
                      <StatusBadge status={project.status} />
                      <Badge 
                        variant="outline" 
                        className={cn('text-xs', categoryColor.text, categoryColor.border)}
                      >
                        {formatCategoryName(project.category)}
                      </Badge>
                    </div>
                    {project.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {project.description}
                      </p>
                    )}
                  </div>

                  {/* Quick Stats */}
                  <div className="hidden md:flex items-center gap-6 text-sm">
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">ROI</div>
                      <div className="font-semibold">
                        {project.latestROI !== null && project.latestROI !== undefined
                          ? formatPercentage(project.latestROI)
                          : 'N/A'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">KPIs</div>
                      <div className="font-semibold">{project.activeKPIs || 0}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Risks</div>
                      <div className="font-semibold">{project.openRisks || 0}</div>
                    </div>
                  </div>
                </div>
              </CollapsibleTrigger>

              {/* Expanded Content - Bar View UI */}
              <CollapsibleContent>
                <div className="p-6 bg-background border-t">
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {/* ROI Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">ROI</span>
                        </div>
                        <span className="text-sm font-semibold">
                          {project.latestROI !== null && project.latestROI !== undefined
                            ? formatPercentage(project.latestROI)
                            : 'N/A'}
                        </span>
                      </div>
                      {project.latestROI !== null && project.latestROI !== undefined && (
                        <Progress 
                          value={Math.min(Math.abs(project.latestROI), 500)} 
                          className="h-2"
                        />
                      )}
                    </div>

                    {/* KPIs Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Active KPIs</span>
                        </div>
                        <span className="text-sm font-semibold">{project.activeKPIs || 0}</span>
                      </div>
                      <Progress 
                        value={project.activeKPIs ? Math.min((project.activeKPIs / 10) * 100, 100) : 0} 
                        className="h-2"
                      />
                    </div>

                    {/* Risks Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Open Risks</span>
                        </div>
                        <span className="text-sm font-semibold">{project.openRisks || 0}</span>
                      </div>
                      <Progress 
                        value={project.openRisks ? Math.min((project.openRisks / 5) * 100, 100) : 0} 
                        className="h-2"
                      />
                    </div>

                    {/* Budget Bar */}
                    {project.budgetAllocated && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Budget</span>
                          </div>
                          <span className="text-sm font-semibold">
                            {formatCurrency(project.budgetSpent || 0)} / {formatCurrency(project.budgetAllocated)}
                          </span>
                        </div>
                        <Progress value={budgetProgress} className="h-2" />
                      </div>
                    )}
                  </div>

                  {/* Additional Details */}
                  <div className="mt-6 pt-6 border-t grid gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-muted-foreground">Project Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Category:</span>
                          <Badge variant="outline" className={cn(categoryColor.text, categoryColor.border)}>
                            {formatCategoryName(project.category)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Status:</span>
                          <StatusBadge status={project.status} />
                        </div>
                        {project.startDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Start Date:</span>
                            <span className="font-medium">
                              {new Date(project.startDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {project.targetCompletionDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Target Completion:</span>
                            <span className="font-medium">
                              {new Date(project.targetCompletionDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-muted-foreground">Quick Actions</h4>
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/projects/${project.id}`}>
                          <Badge variant="outline" className="cursor-pointer hover:bg-muted flex items-center gap-1">
                            View Details
                            <ExternalLink className="h-3 w-3" />
                          </Badge>
                        </Link>
                        {project.activeKPIs && project.activeKPIs > 0 && (
                          <Link href={`/projects/${project.id}#metrics`}>
                            <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                              View Metrics
                            </Badge>
                          </Link>
                        )}
                        {project.openRisks && project.openRisks > 0 && (
                          <Link href={`/risks?projectId=${project.id}`}>
                            <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                              View Risks
                            </Badge>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Key Highlight Remarks */}
                  {(project.team || project.ownerContact || project.problemStatement || 
                    project.aiMlApproach || project.deploymentEnvironment || 
                    project.benefitRealized || project.validationMethod || 
                    project.currentBlockers || project.nextSteps) && (
                    <div className="mt-6 pt-6 border-t">
                      <h4 className="text-sm font-semibold text-muted-foreground mb-4">Key Highlight Remarks</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        {project.team && (
                          <div className="space-y-1">
                            <div className="text-xs font-medium text-muted-foreground">Department & Team</div>
                            <div className="text-sm">{project.team}</div>
                          </div>
                        )}
                        {project.ownerContact && (
                          <div className="space-y-1">
                            <div className="text-xs font-medium text-muted-foreground">Owner Contact</div>
                            <div className="text-sm">{project.ownerContact}</div>
                          </div>
                        )}
                        {project.problemStatement && (
                          <div className="space-y-1 md:col-span-2">
                            <div className="text-xs font-medium text-muted-foreground">Problem Statement</div>
                            <div className="text-sm whitespace-pre-wrap">{project.problemStatement}</div>
                          </div>
                        )}
                        {project.aiMlApproach && (
                          <div className="space-y-1 md:col-span-2">
                            <div className="text-xs font-medium text-muted-foreground">AI/ML Approach</div>
                            <div className="text-sm whitespace-pre-wrap">{project.aiMlApproach}</div>
                          </div>
                        )}
                        {project.deploymentEnvironment && (
                          <div className="space-y-1 md:col-span-2">
                            <div className="text-xs font-medium text-muted-foreground">Deployment Status & Environment</div>
                            <div className="text-sm whitespace-pre-wrap">{project.deploymentEnvironment}</div>
                          </div>
                        )}
                        {project.benefitRealized && (
                          <div className="space-y-1 md:col-span-2">
                            <div className="text-xs font-medium text-muted-foreground">Benefit Realized</div>
                            <div className="text-sm whitespace-pre-wrap">{project.benefitRealized}</div>
                          </div>
                        )}
                        {project.validationMethod && (
                          <div className="space-y-1 md:col-span-2">
                            <div className="text-xs font-medium text-muted-foreground">Validation Method</div>
                            <div className="text-sm whitespace-pre-wrap">{project.validationMethod}</div>
                          </div>
                        )}
                        {project.currentBlockers && (
                          <div className="space-y-1 md:col-span-2">
                            <div className="text-xs font-medium text-muted-foreground">Current Blockers / Support Needed</div>
                            <div className="text-sm whitespace-pre-wrap">{project.currentBlockers}</div>
                          </div>
                        )}
                        {project.nextSteps && (
                          <div className="space-y-1 md:col-span-2">
                            <div className="text-xs font-medium text-muted-foreground">Next Steps</div>
                            <div className="text-sm whitespace-pre-wrap">{project.nextSteps}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        );
      })}
    </div>
  );
}

