'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  format?: 'number' | 'currency' | 'percentage';
  className?: string;
}

export function StatCard({
  title,
  value,
  icon,
  format = 'number',
  className,
}: StatCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val;
    
    if (format === 'currency') {
      return formatCurrency(val);
    }
    if (format === 'percentage') {
      return formatPercentage(val);
    }
    return formatNumber(val);
  };

  return (
    <div
      className={cn(
        'glass-panel neon-border rounded-lg p-6 relative overflow-hidden group cursor-pointer',
        'hover:border-neon-green hover:shadow-[0_0_20px_rgba(57,255,20,0.5)]',
        'transition-all duration-300',
        className
      )}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 h-16 flex items-end gap-1 px-2 pb-2">
          {[...Array(20)].map((_, i) => {
            const height = Math.random() * 60 + 20;
            const delay = Math.random() * 2;
            const duration = 2 + Math.random() * 2;
            return (
              <div
                key={i}
                className="flex-1 bg-neon-green rounded-t animate-pulse"
                style={{
                  height: `${height}%`,
                  animationDuration: `${duration}s`,
                  animationDelay: `${delay}s`,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-400 uppercase tracking-wide">
            {title}
          </span>
          {icon && (
            <div className="text-gray-500 group-hover:text-neon-green transition-colors">
              {icon}
            </div>
          )}
        </div>

        {/* Value */}
        <div className="text-4xl font-bold text-white mb-2 group-hover:text-neon-green transition-colors">
          {formatValue(value)}
        </div>
      </div>
    </div>
  );
}
