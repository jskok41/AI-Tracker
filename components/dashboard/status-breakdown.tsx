'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusBreakdownProps {
  statuses: Array<{
    status: string;
    count: number;
    projects?: Array<{
      projectName: string;
      count: number;
    }>;
  }>;
  className?: string;
}

export function StatusBreakdown({
  statuses,
  className,
}: StatusBreakdownProps) {
  const [expandedStatuses, setExpandedStatuses] = useState<Set<string>>(new Set());
  
  const totalCount = statuses.reduce((sum, status) => sum + status.count, 0);
  
  const toggleStatus = (status: string) => {
    setExpandedStatuses(prev => {
      const next = new Set(prev);
      if (next.has(status)) {
        next.delete(status);
      } else {
        next.add(status);
      }
      return next;
    });
  };

  // Sort statuses by priority order (PRODUCTION, SCALING, PILOT, PLANNING, PAUSED, COMPLETED, CANCELLED)
  const statusOrder: Record<string, number> = {
    'PRODUCTION': 1,
    'SCALING': 2,
    'PILOT': 3,
    'PLANNING': 4,
    'PAUSED': 5,
    'COMPLETED': 6,
    'CANCELLED': 7,
  };

  const sortedStatuses = [...statuses].sort((a, b) => {
    const orderA = statusOrder[a.status] || 99;
    const orderB = statusOrder[b.status] || 99;
    return orderA - orderB;
  });

  return (
    <div className={cn('space-y-2', className)}>
      {sortedStatuses.map((statusItem) => {
        const projects = statusItem.projects || [];
        const hasProjects = projects.length > 0;
        const isExpanded = expandedStatuses.has(statusItem.status);
        const statusPercentage = totalCount > 0 ? ((statusItem.count / totalCount) * 100).toFixed(1) : '0';
        
        return (
          <div key={statusItem.status} className="space-y-1">
            {/* Status Row */}
            <div 
              className={cn(
                "flex items-center justify-between group",
                hasProjects && "cursor-pointer"
              )}
              onClick={() => hasProjects && toggleStatus(statusItem.status)}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {hasProjects && (
                  <div className="flex-shrink-0">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                )}
                <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                <span className="text-sm capitalize truncate">
                  {statusItem.status.toLowerCase().replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-muted-foreground">{statusPercentage}%</span>
                <span className="text-sm font-medium">{statusItem.count}</span>
              </div>
            </div>
            
            {/* Project Rows */}
            {hasProjects && isExpanded && (
              <div className="ml-6 space-y-1 border-l border-border pl-3">
                {projects
                  .sort((a, b) => b.count - a.count)
                  .map((project) => {
                    const projectPercentage = statusItem.count > 0 ? ((project.count / statusItem.count) * 100).toFixed(1) : '0';
                    return (
                      <div
                        key={project.projectName}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 flex-shrink-0" />
                          <span className="text-xs text-muted-foreground truncate">
                            {project.projectName || 'Unspecified'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-muted-foreground/70">{projectPercentage}%</span>
                          <span className="text-xs font-medium text-muted-foreground">
                            {project.count}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
