'use client';

import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ProjectSelectorProps {
  projects: { id: string; name: string }[];
  currentProjectId: string;
}

export function ProjectSelector({ projects, currentProjectId }: ProjectSelectorProps) {
  const router = useRouter();

  const handleProjectChange = (projectId: string) => {
    router.push(`/roadmap?projectId=${projectId}`);
    router.refresh();
  };

  return (
    <Select value={currentProjectId} onValueChange={handleProjectChange}>
      <SelectTrigger className="w-64">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {projects.map((p) => (
          <SelectItem key={p.id} value={p.id}>
            {p.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

