'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface DelayWarningProps {
  status: string;
  targetEndDate: Date | null;
  delayReason?: string | null;
  progressPercentage?: number | null;
}

export function DelayWarning({
  status,
  targetEndDate,
  delayReason,
  progressPercentage = 0,
}: DelayWarningProps) {
  if (status !== 'DELAYED') {
    return null;
  }

  const daysOverdue = targetEndDate
    ? Math.max(0, Math.floor((new Date().getTime() - new Date(targetEndDate).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <Alert variant="destructive" className="border-orange-500 bg-orange-50 dark:bg-orange-950/20">
      <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
      <AlertTitle className="text-orange-800 dark:text-orange-200">
        Phase Delayed
      </AlertTitle>
      <AlertDescription className="text-orange-700 dark:text-orange-300">
        <div className="space-y-1">
          {targetEndDate && (
            <p>
              Target end date was <strong>{formatDate(targetEndDate)}</strong>
              {daysOverdue > 0 && (
                <span> ({daysOverdue} day{daysOverdue !== 1 ? 's' : ''} overdue)</span>
              )}
            </p>
          )}
          {delayReason && <p className="text-sm">{delayReason}</p>}
          <p className="text-sm">
            Current progress: <strong>{progressPercentage?.toFixed(0) ?? 0}%</strong>
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
}
