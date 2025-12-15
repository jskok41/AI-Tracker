'use client';

import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

interface AutoProgressIndicatorProps {
  autoCalculated?: boolean;
  lastCalculatedAt?: Date | null;
}

export function AutoProgressIndicator({ 
  autoCalculated = false, 
  lastCalculatedAt 
}: AutoProgressIndicatorProps) {
  if (!autoCalculated) {
    return null;
  }

  return (
    <Badge 
      variant="outline" 
      className="text-xs font-medium bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
    >
      <Sparkles className="h-3 w-3 mr-1" />
      Auto-calculated
      {lastCalculatedAt && (
        <span className="ml-1 text-[10px] opacity-70">
          {new Date(lastCalculatedAt).toLocaleDateString()}
        </span>
      )}
    </Badge>
  );
}
