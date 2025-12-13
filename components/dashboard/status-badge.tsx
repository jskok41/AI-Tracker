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
        getStatusColor(status),
        'cyberpunk:bg-black/50 cyberpunk:border-[#00FF41]/50 cyberpunk:text-[#00FF41] cyberpunk:shadow-[0_0_8px_rgba(0,255,65,0.3)]'
      )}
    >
      {displayLabel}
    </Badge>
  );
}

