'use client';

import { useMemo, useState, useTransition } from 'react';
import { ProjectStatus } from '@prisma/client';
import { updateProjectStatus } from '@/lib/actions';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const STATUS_LABELS: Record<ProjectStatus, string> = {
  PLANNING: 'Planning',
  PILOT: 'Pilot',
  SCALING: 'Scaling',
  PRODUCTION: 'Production',
  PAUSED: 'Paused',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const STATUS_DESCRIPTIONS: Record<ProjectStatus, string> = {
  PLANNING: 'Defining requirements and success metrics',
  PILOT: 'Running a limited scope pilot',
  SCALING: 'Expanding reach and capabilities',
  PRODUCTION: 'Running in production environments',
  PAUSED: 'Temporarily on hold',
  COMPLETED: 'Successfully completed',
  CANCELLED: 'Project has been cancelled',
};

interface ProjectStatusControlProps {
  projectId: string;
  currentStatus: ProjectStatus;
}

export function ProjectStatusControl({
  projectId,
  currentStatus,
}: ProjectStatusControlProps) {
  const [status, setStatus] = useState<ProjectStatus>(currentStatus);
  const [isPending, startTransition] = useTransition();
  const hasChanges = useMemo(() => status !== currentStatus, [status, currentStatus]);

  const handleStatusChange = (value: ProjectStatus) => {
    setStatus(value);
  };

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateProjectStatus(projectId, status);
      if (result.success) {
        toast.success('Project status updated');
      } else {
        toast.error(result.error || 'Failed to update status');
        setStatus(currentStatus);
      }
    });
  };

  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-card/80 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Project Status</p>
          <p className="text-xs text-muted-foreground">
            {STATUS_DESCRIPTIONS[status]}
          </p>
        </div>
        <Badge variant="outline">{STATUS_LABELS[status]}</Badge>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="min-w-[200px]">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(STATUS_LABELS) as ProjectStatus[]).map((value) => (
              <SelectItem key={value} value={value}>
                {STATUS_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          className="sm:ml-auto"
          disabled={!hasChanges || isPending}
          onClick={handleSave}
        >
          {isPending ? 'Updating...' : 'Update Status'}
        </Button>
      </div>
    </div>
  );
}

