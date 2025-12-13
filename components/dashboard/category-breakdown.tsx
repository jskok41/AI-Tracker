'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryBreakdownProps {
  categories: Array<{
    category: string;
    count: number;
    subCategories?: Array<{
      subCategory: string;
      count: number;
    }>;
  }>;
  className?: string;
}

export function CategoryBreakdown({
  categories,
  className,
}: CategoryBreakdownProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  
  const totalCount = categories.reduce((sum, cat) => sum + cat.count, 0);
  
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  // Sort categories by count
  const sortedCategories = [...categories].sort((a, b) => b.count - a.count);

  return (
    <div className={cn('space-y-2', className)}>
      {sortedCategories.map((category) => {
        const subCategories = category.subCategories || [];
        const hasSubCategories = subCategories.length > 0;
        const isExpanded = expandedCategories.has(category.category);
        const categoryPercentage = totalCount > 0 ? ((category.count / totalCount) * 100).toFixed(1) : '0';
        
        return (
          <div key={category.category} className="space-y-1">
            {/* Category Row */}
            <div 
              className={cn(
                "flex items-center justify-between group",
                hasSubCategories && "cursor-pointer"
              )}
              onClick={() => hasSubCategories && toggleCategory(category.category)}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {hasSubCategories && (
                  <div className="flex-shrink-0">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                )}
                <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                <span className="text-sm capitalize truncate">
                  {category.category.toLowerCase().replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-muted-foreground">{categoryPercentage}%</span>
                <span className="text-sm font-medium">{category.count}</span>
              </div>
            </div>
            
            {/* Sub-Category Rows */}
            {hasSubCategories && isExpanded && (
              <div className="ml-6 space-y-1 border-l border-border pl-3">
                {subCategories
                  .sort((a, b) => b.count - a.count)
                  .map((subCategory) => {
                    const subPercentage = category.count > 0 ? ((subCategory.count / category.count) * 100).toFixed(1) : '0';
                    return (
                      <div
                        key={subCategory.subCategory}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 flex-shrink-0" />
                          <span className="text-xs text-muted-foreground truncate">
                            {subCategory.subCategory || 'Unspecified'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-muted-foreground/70">{subPercentage}%</span>
                          <span className="text-xs font-medium text-muted-foreground">
                            {subCategory.count}
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
