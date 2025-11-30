import { Badge } from '@/components/ui/badge';
import { cn, getStatusColor } from '@/lib/utils';
import type { ProjectStatus, RiskStatus, AlertStatus, PhaseStatus } from '@prisma/client';

interface StatusBadgeProps {
  status: ProjectStatus | RiskStatus | AlertStatus | PhaseStatus | string;
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const displayLabel = label || status.replace(/_/g, ' ');
  
  return (
    <Badge 
      variant="secondary"
      className={cn(
        'capitalize',
        getStatusColor(status)
      )}
    >
      {displayLabel}
    </Badge>
  );
}

