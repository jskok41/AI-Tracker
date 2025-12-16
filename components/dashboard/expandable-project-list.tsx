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
  ExternalLink,
  Link as LinkIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProjectScreenshotUpload } from './project-screenshot-upload';

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
  department?: { id: string; name: string } | null;
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
  screenshotUrl?: string | null;
  sharePointLink?: string | null;
  appLink?: string | null;
}

interface ExpandableProjectListProps {
  projects: Project[];
}

// Color mapping for project categories
const categoryColors: Record<ProjectCategory, { bg: string; border: string; text: string }> = {
  AI_AGENT: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800/30', text: 'text-blue-700 dark:text-blue-300' },
  AI_INITIATIVE: { bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800/30', text: 'text-purple-700 dark:text-purple-300' },
  GEN_AI_PRODUCTION: { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800/30', text: 'text-green-700 dark:text-green-300' },
  PROMPT_LIBRARY: { bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800/30', text: 'text-orange-700 dark:text-orange-300' },
  RISK_MANAGEMENT: { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800/30', text: 'text-red-700 dark:text-red-300' },
  OTHER: { bg: 'bg-gray-50 dark:bg-gray-900/20', border: 'border-gray-200 dark:border-gray-800/30', text: 'text-gray-700 dark:text-gray-300' },
};

function getCategoryColor(category: ProjectCategory) {
  return categoryColors[category] || { bg: 'bg-gray-50 dark:bg-gray-900/20', border: 'border-gray-200 dark:border-gray-800/30', text: 'text-gray-700 dark:text-gray-300' };
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
    <div className="space-y-2 cyberpunk-project-list">
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
              isExpanded && 'shadow-md',
              // Force Cyberpunk styling - override category colors
              'cyberpunk:!bg-black/40 cyberpunk:!backdrop-blur-sm cyberpunk:!border-[#00FF41]/30 cyberpunk:shadow-[0_0_20px_rgba(0,255,65,0.1)]',
              isExpanded && 'cyberpunk:shadow-[0_0_30px_rgba(0,255,65,0.2)] cyberpunk:!border-[#00FF41]/50'
            )}
          >
            {/* Collapsible Header */}
            <Collapsible open={isExpanded} onOpenChange={() => toggleProject(project.id)}>
              <CollapsibleTrigger className="w-full">
                <div className={cn(
                  'flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors',
                  categoryColor.bg,
                  // Force Cyberpunk styling - override all category backgrounds
                  'cyberpunk:!bg-transparent cyberpunk:hover:!bg-[#00FF41]/5'
                )}>
                  {/* Category Color Marker */}
                  <div className={cn(
                    'w-1 h-12 rounded-full flex-shrink-0',
                    categoryColor.border.replace('border-', 'bg-'),
                    // Force neon green in Cyberpunk mode
                    'cyberpunk:!bg-[#00FF41] cyberpunk:shadow-[0_0_8px_rgba(0,255,65,0.5)]'
                  )} />

                  {/* Expand/Collapse Icon */}
                  <div className="flex-shrink-0">
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-muted-foreground cyberpunk:text-[#00FF41]/70" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-muted-foreground cyberpunk:text-[#00FF41]/70" />
                    )}
                  </div>

                  {/* Project Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h3 className={cn(
                        'font-semibold text-lg truncate',
                        categoryColor.text,
                        'cyberpunk:!text-[#00FF41] cyberpunk:drop-shadow-[0_0_8px_rgba(0,255,65,0.8)] cyberpunk:font-bold'
                      )}>
                        {project.name}
                      </h3>
                      <StatusBadge status={project.status} />
                      <Badge 
                        variant="outline" 
                        className={cn(
                          'text-xs', 
                          categoryColor.text, 
                          categoryColor.border,
                          // Force Cyberpunk styling for category badge
                          'cyberpunk:!bg-black/50 cyberpunk:!border-[#00FF41]/50 cyberpunk:!text-[#00FF41] cyberpunk:shadow-[0_0_8px_rgba(0,255,65,0.3)]'
                        )}
                      >
                        {formatCategoryName(project.category)}
                      </Badge>
                      {/* Department Capsule */}
                      {project.department && (
                        <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/40 border-blue-300 dark:border-blue-800/40 text-xs cyberpunk:!bg-black/50 cyberpunk:!border-[#00FF41]/50 cyberpunk:!text-[#00FF41] cyberpunk:hover:!bg-[#00FF41]/10">
                          <div className="flex items-center gap-1.5">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 dark:bg-blue-400 cyberpunk:!bg-[#00FF41] cyberpunk:shadow-[0_0_4px_rgba(0,255,65,0.5)]" />
                            {project.department.name}
                          </div>
                        </Badge>
                      )}
                      {/* Team Capsule - Outside Bar UI */}
                      {project.team && (
                        <Badge className="bg-gray-100 dark:bg-gray-800/50 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800/70 border-gray-300 dark:border-gray-700 text-xs cyberpunk:!bg-black/50 cyberpunk:!border-[#00FF41]/50 cyberpunk:!text-[#00FF41] cyberpunk:hover:!bg-[#00FF41]/10">
                          <div className="flex items-center gap-1.5">
                            <div className="h-1.5 w-1.5 rounded-full bg-gray-500 dark:bg-gray-400 cyberpunk:!bg-[#00FF41] cyberpunk:shadow-[0_0_4px_rgba(0,255,65,0.5)]" />
                            {project.team}
                          </div>
                        </Badge>
                      )}
                    </div>
                    {project.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1 cyberpunk:text-[#00FF41]/70">
                        {project.description}
                      </p>
                    )}
                  </div>

                  {/* Quick Stats */}
                  <div className="hidden md:flex items-center gap-6 text-sm">
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground cyberpunk:text-[#00FF41]/70">ROI</div>
                      <div className="font-semibold cyberpunk:text-white">{project.latestROI !== null && project.latestROI !== undefined
                          ? formatPercentage(project.latestROI)
                          : 'N/A'}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground cyberpunk:text-[#00FF41]/70">KPIs</div>
                      <div className="font-semibold cyberpunk:text-white">{project.activeKPIs || 0}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground cyberpunk:text-[#00FF41]/70">Risks</div>
                      <div className="font-semibold cyberpunk:text-white">{project.openRisks || 0}</div>
                    </div>
                  </div>
                </div>
              </CollapsibleTrigger>

              {/* Expanded Content - Bar View UI */}
              <CollapsibleContent>
                <div className="p-6 bg-background border-t cyberpunk:bg-black/30 cyberpunk:border-[#00FF41]/20">
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {/* ROI Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-muted-foreground cyberpunk:text-[#00FF41]/70" />
                          <span className="text-sm font-medium cyberpunk:text-white">ROI</span>
                        </div>
                        <span className="text-sm font-semibold cyberpunk:text-[#00FF41]">
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
                          <Target className="h-4 w-4 text-muted-foreground cyberpunk:text-[#00FF41]/70" />
                          <span className="text-sm font-medium cyberpunk:text-white">Active KPIs</span>
                        </div>
                        <span className="text-sm font-semibold cyberpunk:text-[#00FF41]">{project.activeKPIs || 0}</span>
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
                          <AlertTriangle className="h-4 w-4 text-muted-foreground cyberpunk:text-[#00FF41]/70" />
                          <span className="text-sm font-medium cyberpunk:text-white">Open Risks</span>
                        </div>
                        <span className="text-sm font-semibold cyberpunk:text-[#00FF41]">{project.openRisks || 0}</span>
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
                            <DollarSign className="h-4 w-4 text-muted-foreground cyberpunk:text-[#00FF41]/70" />
                            <span className="text-sm font-medium cyberpunk:text-white">Budget</span>
                          </div>
                          <span className="text-sm font-semibold cyberpunk:text-[#00FF41]">
                            {formatCurrency(project.budgetSpent || 0)} / {formatCurrency(project.budgetAllocated)}
                          </span>
                        </div>
                        <Progress value={budgetProgress} className="h-2" />
                      </div>
                    )}
                  </div>

                  {/* Project Screenshot */}
                  <div className="mt-6 pt-6 border-t cyberpunk:border-[#00FF41]/20">
                    <ProjectScreenshotUpload
                      projectId={project.id}
                      currentScreenshotUrl={project.screenshotUrl}
                    />
                  </div>

                  {/* Additional Details */}
                  <div className="mt-6 pt-6 border-t grid gap-4 md:grid-cols-2 cyberpunk:border-[#00FF41]/20">
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-muted-foreground cyberpunk:text-[#00FF41]/70">Project Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground cyberpunk:text-[#00FF41]/70">Category:</span>
                          <Badge variant="outline" className={cn(categoryColor.text, categoryColor.border, 'cyberpunk:bg-black/50 cyberpunk:border-[#00FF41]/50 cyberpunk:text-[#00FF41]')}>
                            {formatCategoryName(project.category)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground cyberpunk:text-[#00FF41]/70">Status:</span>
                          <StatusBadge status={project.status} />
                        </div>
                        {project.startDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground cyberpunk:text-[#00FF41]/70" />
                            <span className="text-muted-foreground cyberpunk:text-[#00FF41]/70">Start Date:</span>
                            <span className="font-medium cyberpunk:text-white">
                              {new Date(project.startDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {project.targetCompletionDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground cyberpunk:text-[#00FF41]/70" />
                            <span className="text-muted-foreground cyberpunk:text-[#00FF41]/70">Target Completion:</span>
                            <span className="font-medium cyberpunk:text-white">
                              {new Date(project.targetCompletionDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-muted-foreground cyberpunk:text-[#00FF41]/70">Quick Actions</h4>
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/projects/${project.id}`}>
                          <Badge variant="outline" className="cursor-pointer hover:bg-muted flex items-center gap-1 cyberpunk:bg-black/50 cyberpunk:border-[#00FF41]/50 cyberpunk:text-[#00FF41] cyberpunk:hover:bg-[#00FF41]/10">
                            View Details
                            <ExternalLink className="h-3 w-3" />
                          </Badge>
                        </Link>
                        {project.activeKPIs && project.activeKPIs > 0 && (
                          <Link href={`/projects/${project.id}#metrics`}>
                            <Badge variant="outline" className="cursor-pointer hover:bg-muted cyberpunk:bg-black/50 cyberpunk:border-[#00FF41]/50 cyberpunk:text-[#00FF41] cyberpunk:hover:bg-[#00FF41]/10">
                              View Metrics
                            </Badge>
                          </Link>
                        )}
                        {project.openRisks && project.openRisks > 0 && (
                          <Link href={`/risks?projectId=${project.id}`}>
                            <Badge variant="outline" className="cursor-pointer hover:bg-muted cyberpunk:bg-black/50 cyberpunk:border-[#00FF41]/50 cyberpunk:text-[#00FF41] cyberpunk:hover:bg-[#00FF41]/10">
                              View Risks
                            </Badge>
                          </Link>
                        )}
                      </div>
                      
                      {/* Project Links */}
                      {(project.sharePointLink || project.appLink) && (
                        <div className="space-y-2 pt-2 border-t cyberpunk:border-[#00FF41]/20">
                          <h4 className="text-sm font-semibold text-muted-foreground cyberpunk:text-[#00FF41]/70">Project Links</h4>
                          <div className="space-y-2">
                            {project.sharePointLink && (
                              <div className="flex items-center gap-2">
                                <LinkIcon className="h-4 w-4 text-muted-foreground cyberpunk:text-[#00FF41]/70" />
                                <span className="text-sm text-muted-foreground cyberpunk:text-[#00FF41]/70 min-w-[120px]">SharePoint Link:</span>
                                <a
                                  href={project.sharePointLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 dark:text-blue-400 cyberpunk:text-[#00FF41] hover:underline flex items-center gap-1 truncate max-w-xs"
                                >
                                  {project.sharePointLink}
                                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                </a>
                              </div>
                            )}
                            {project.appLink && (
                              <div className="flex items-center gap-2">
                                <LinkIcon className="h-4 w-4 text-muted-foreground cyberpunk:text-[#00FF41]/70" />
                                <span className="text-sm text-muted-foreground cyberpunk:text-[#00FF41]/70 min-w-[120px]">App Link:</span>
                                <a
                                  href={project.appLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 dark:text-blue-400 cyberpunk:text-[#00FF41] hover:underline flex items-center gap-1 truncate max-w-xs"
                                >
                                  {project.appLink}
                                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Key Highlight Remarks with Color Capsules */}
                  {(project.team || project.ownerContact || project.problemStatement || 
                    project.aiMlApproach || project.deploymentEnvironment || 
                    project.benefitRealized || project.validationMethod || 
                    project.currentBlockers || project.nextSteps) && (
                    <div className="mt-6 pt-6 border-t cyberpunk:border-[#00FF41]/20">
                      <h4 className="text-sm font-semibold text-muted-foreground mb-4 cyberpunk:text-[#00FF41]/70">Key Highlight Remarks</h4>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.team && (
                          <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/40 border-blue-300 dark:border-blue-800/40 cyberpunk:bg-black/50 cyberpunk:border-[#00FF41]/50 cyberpunk:text-[#00FF41]/90 cyberpunk:hover:bg-[#00FF41]/10">
                            Department & Team
                          </Badge>
                        )}
                        {project.ownerContact && (
                          <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/40 border-purple-300 dark:border-purple-800/40 cyberpunk:bg-black/50 cyberpunk:border-[#00FF41]/50 cyberpunk:text-[#00FF41]/90 cyberpunk:hover:bg-[#00FF41]/10">
                            Owner Contact
                          </Badge>
                        )}
                        {project.problemStatement && (
                          <Badge className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/40 border-red-300 dark:border-red-800/40 cyberpunk:bg-black/50 cyberpunk:border-[#00FF41]/50 cyberpunk:text-[#00FF41]/90 cyberpunk:hover:bg-[#00FF41]/10">
                            Problem Statement
                          </Badge>
                        )}
                        {project.aiMlApproach && (
                          <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/40 border-green-300 dark:border-green-800/40 cyberpunk:bg-black/50 cyberpunk:border-[#00FF41]/50 cyberpunk:text-[#00FF41]/90 cyberpunk:hover:bg-[#00FF41]/10">
                            AI/ML Approach
                          </Badge>
                        )}
                        {project.deploymentEnvironment && (
                          <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/40 border-orange-300 dark:border-orange-800/40 cyberpunk:bg-black/50 cyberpunk:border-[#00FF41]/50 cyberpunk:text-[#00FF41]/90 cyberpunk:hover:bg-[#00FF41]/10">
                            Deployment & Environment
                          </Badge>
                        )}
                        {project.benefitRealized && (
                          <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/40 border-emerald-300 dark:border-emerald-800/40 cyberpunk:bg-black/50 cyberpunk:border-[#00FF41]/50 cyberpunk:text-[#00FF41]/90 cyberpunk:hover:bg-[#00FF41]/10">
                            Benefit Realized
                          </Badge>
                        )}
                        {project.validationMethod && (
                          <Badge className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/40 border-indigo-300 dark:border-indigo-800/40 cyberpunk:bg-black/50 cyberpunk:border-[#00FF41]/50 cyberpunk:text-[#00FF41]/90 cyberpunk:hover:bg-[#00FF41]/10">
                            Validation Method
                          </Badge>
                        )}
                        {project.currentBlockers && (
                          <Badge className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/40 border-yellow-300 dark:border-yellow-800/40 cyberpunk:bg-black/50 cyberpunk:border-[#00FF41]/50 cyberpunk:text-[#00FF41]/90 cyberpunk:hover:bg-[#00FF41]/10">
                            Blockers / Support
                          </Badge>
                        )}
                        {project.nextSteps && (
                          <Badge className="bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 hover:bg-teal-200 dark:hover:bg-teal-900/40 border-teal-300 dark:border-teal-800/40 cyberpunk:bg-black/50 cyberpunk:border-[#00FF41]/50 cyberpunk:text-[#00FF41]/90 cyberpunk:hover:bg-[#00FF41]/10">
                            Next Steps
                          </Badge>
                        )}
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        {project.team && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-blue-500 dark:bg-blue-400 cyberpunk:bg-[#00FF41] cyberpunk:shadow-[0_0_4px_rgba(0,255,65,0.5)]" />
                              <div className="text-xs font-medium text-muted-foreground cyberpunk:text-[#00FF41]/70">Department & Team</div>
                            </div>
                            <div className="text-sm pl-4 cyberpunk:text-white">{project.team}</div>
                          </div>
                        )}
                        {project.ownerContact && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-purple-500 dark:bg-purple-400 cyberpunk:bg-[#00FF41] cyberpunk:shadow-[0_0_4px_rgba(0,255,65,0.5)]" />
                              <div className="text-xs font-medium text-muted-foreground cyberpunk:text-[#00FF41]/70">Owner Contact</div>
                            </div>
                            <div className="text-sm pl-4 cyberpunk:text-white">{project.ownerContact}</div>
                          </div>
                        )}
                        {project.problemStatement && (
                          <div className="space-y-1 md:col-span-2">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-red-500 dark:bg-red-400 cyberpunk:bg-[#00FF41] cyberpunk:shadow-[0_0_4px_rgba(0,255,65,0.5)]" />
                              <div className="text-xs font-medium text-muted-foreground cyberpunk:text-[#00FF41]/70">Problem Statement</div>
                            </div>
                            <div className="text-sm whitespace-pre-wrap pl-4 cyberpunk:text-white">{project.problemStatement}</div>
                          </div>
                        )}
                        {project.aiMlApproach && (
                          <div className="space-y-1 md:col-span-2">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-green-500 dark:bg-green-400 cyberpunk:bg-[#00FF41] cyberpunk:shadow-[0_0_4px_rgba(0,255,65,0.5)]" />
                              <div className="text-xs font-medium text-muted-foreground cyberpunk:text-[#00FF41]/70">AI/ML Approach</div>
                            </div>
                            <div className="text-sm whitespace-pre-wrap pl-4 cyberpunk:text-white">{project.aiMlApproach}</div>
                          </div>
                        )}
                        {project.deploymentEnvironment && (
                          <div className="space-y-1 md:col-span-2">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-orange-500 dark:bg-orange-400 cyberpunk:bg-[#00FF41] cyberpunk:shadow-[0_0_4px_rgba(0,255,65,0.5)]" />
                              <div className="text-xs font-medium text-muted-foreground cyberpunk:text-[#00FF41]/70">Deployment Status & Environment</div>
                            </div>
                            <div className="text-sm whitespace-pre-wrap pl-4 cyberpunk:text-white">{project.deploymentEnvironment}</div>
                          </div>
                        )}
                        {project.benefitRealized && (
                          <div className="space-y-1 md:col-span-2">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400 cyberpunk:bg-[#00FF41] cyberpunk:shadow-[0_0_4px_rgba(0,255,65,0.5)]" />
                              <div className="text-xs font-medium text-muted-foreground cyberpunk:text-[#00FF41]/70">Benefit Realized</div>
                            </div>
                            <div className="text-sm whitespace-pre-wrap pl-4 cyberpunk:text-white">{project.benefitRealized}</div>
                          </div>
                        )}
                        {project.validationMethod && (
                          <div className="space-y-1 md:col-span-2">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-indigo-500 dark:bg-indigo-400 cyberpunk:bg-[#00FF41] cyberpunk:shadow-[0_0_4px_rgba(0,255,65,0.5)]" />
                              <div className="text-xs font-medium text-muted-foreground cyberpunk:text-[#00FF41]/70">Validation Method</div>
                            </div>
                            <div className="text-sm whitespace-pre-wrap pl-4 cyberpunk:text-white">{project.validationMethod}</div>
                          </div>
                        )}
                        {project.currentBlockers && (
                          <div className="space-y-1 md:col-span-2">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-yellow-500 dark:bg-yellow-400 cyberpunk:bg-[#00FF41] cyberpunk:shadow-[0_0_4px_rgba(0,255,65,0.5)]" />
                              <div className="text-xs font-medium text-muted-foreground cyberpunk:text-[#00FF41]/70">Current Blockers / Support Needed</div>
                            </div>
                            <div className="text-sm whitespace-pre-wrap pl-4 cyberpunk:text-white">{project.currentBlockers}</div>
                          </div>
                        )}
                        {project.nextSteps && (
                          <div className="space-y-1 md:col-span-2">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-teal-500 dark:bg-teal-400 cyberpunk:bg-[#00FF41] cyberpunk:shadow-[0_0_4px_rgba(0,255,65,0.5)]" />
                              <div className="text-xs font-medium text-muted-foreground cyberpunk:text-[#00FF41]/70">Next Steps</div>
                            </div>
                            <div className="text-sm whitespace-pre-wrap pl-4 cyberpunk:text-white">{project.nextSteps}</div>
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

