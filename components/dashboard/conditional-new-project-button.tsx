'use client';

import { NewProjectDialog } from '@/components/dashboard/new-project-dialog';
import { useCanEdit } from '@/lib/hooks/use-permissions';

interface ConditionalNewProjectButtonProps {
  departments: { id: string; name: string }[];
  users: { id: string; name: string; email: string }[];
}

export function ConditionalNewProjectButton({ departments, users }: ConditionalNewProjectButtonProps) {
  const canEdit = useCanEdit();
  
  if (!canEdit) {
    return null;
  }
  
  return <NewProjectDialog departments={departments} users={users} />;
}
