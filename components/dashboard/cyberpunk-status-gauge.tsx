'use client';

import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusGaugeProps {
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

const STATUS_COLORS: Record<string, string> = {
  'PRODUCTION': '#00FF41',
  'SCALING': '#00ff88',
  'PILOT': '#00cc33',
  'PLANNING': '#66ff99',
  'PAUSED': '#33ff66',
  'COMPLETED': '#00ffaa',
  'CANCELLED': '#ff0040',
};

export function CyberpunkStatusGauge({ statuses, className }: StatusGaugeProps) {
  const [expandedStatuses, setExpandedStatuses] = useState<Set<string>>(new Set());
  const total = statuses.reduce((sum, s) => sum + s.count, 0);
  
  const data = statuses.map(status => ({
    name: status.status.toLowerCase().replace(/_/g, ' '),
    value: status.count,
    fill: STATUS_COLORS[status.status] || '#00FF41',
  }));

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

  // Sort statuses by priority order
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

  // Create semi-circle gauge using PieChart
  return (
    <div className={cn('space-y-3', className)}>
      {/* Chart Section - Reduced height for better balance */}
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="90%"
            startAngle={180}
            endAngle={0}
            innerRadius={50}
            outerRadius={85}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.fill}
                style={{ filter: 'drop-shadow(0 0 8px rgba(0, 255, 65, 0.5))' }}
              />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0];
                const statusName = data.name || '';
                const statusValue = data.value || 0;
                const total = statuses.reduce((sum, s) => sum + s.count, 0);
                const percentage = total > 0 ? ((statusValue / total) * 100).toFixed(1) : '0';
                
                return (
                  <div
                    className="cyberpunk-tooltip-custom"
                    style={{
                      backgroundColor: '#F0FFF0', // Bright mint-white background - unexpected solution!
                      border: '2px solid #00FF41',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      boxShadow: '0 0 20px rgba(0, 255, 65, 0.8), 0 0 40px rgba(0, 255, 65, 0.4), inset 0 0 10px rgba(0, 255, 65, 0.1)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      minWidth: '120px',
                    }}
                  >
                    <p
                      style={{
                        color: '#005500', // Dark green for maximum contrast on light background
                        fontWeight: '900',
                        fontSize: '14px',
                        margin: 0,
                        textShadow: '0 0 6px rgba(0, 255, 65, 0.5)',
                        letterSpacing: '0.8px',
                        textTransform: 'capitalize',
                        lineHeight: '1.4',
                      }}
                    >
                      {statusName}
                    </p>
                    <p
                      style={{
                        color: '#00AA00',
                        fontWeight: '700',
                        fontSize: '12px',
                        margin: '4px 0 0 0',
                        letterSpacing: '0.5px',
                      }}
                    >
                      Count: <span style={{ color: '#005500', fontWeight: '900' }}>{statusValue}</span> ({percentage}%)
                    </p>
                  </div>
                );
              }
              return null;
            }}
            contentStyle={{ display: 'none' }}
            labelStyle={{ display: 'none' }}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Status List with Expandable Breakdown */}
      <div className="space-y-1.5">
        {sortedStatuses.map((status) => {
          const percentage = total > 0 ? ((status.count / total) * 100).toFixed(1) : '0';
          const color = STATUS_COLORS[status.status] || '#00FF41';
          const projects = status.projects || [];
          const hasProjects = projects.length > 0;
          const isExpanded = expandedStatuses.has(status.status);
          
          return (
            <div key={status.status} className="space-y-1">
              {/* Status Row */}
              <div 
                className={cn(
                  "flex items-center justify-between group",
                  hasProjects && "cursor-pointer hover:bg-[#00FF41]/5 rounded px-1 py-0.5 transition-colors"
                )}
                onClick={() => hasProjects && toggleStatus(status.status)}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {hasProjects && (
                    <div className="flex-shrink-0">
                      {isExpanded ? (
                        <ChevronDown className="h-3.5 w-3.5 text-[#00FF41]/70" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-[#00FF41]/70" />
                      )}
                    </div>
                  )}
                  <div 
                    className="h-2 w-2 rounded-full flex-shrink-0"
                    style={{ 
                      backgroundColor: color,
                      boxShadow: `0 0 8px ${color}`,
                    }}
                  />
                  <span className="text-sm capitalize text-white">
                    {status.status.toLowerCase().replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-[#00FF41]/70">{percentage}%</span>
                  <span className="text-sm font-medium text-white">{status.count}</span>
                </div>
              </div>
              
              {/* Project Name Breakdown */}
              {hasProjects && isExpanded && (
                <div className="ml-6 space-y-1 border-l border-[#00FF41]/20 pl-3">
                  {projects
                    .sort((a, b) => b.count - a.count)
                    .map((project) => {
                      const projectPercentage = status.count > 0 ? ((project.count / status.count) * 100).toFixed(1) : '0';
                      return (
                        <div
                          key={project.projectName}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="h-1.5 w-1.5 rounded-full bg-[#00FF41]/60 flex-shrink-0" />
                            <span className="text-xs text-[#00FF41]/80 truncate">
                              {project.projectName || 'Unspecified'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs text-[#00FF41]/60">{projectPercentage}%</span>
                            <span className="text-xs font-medium text-white">
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
    </div>
  );
}
