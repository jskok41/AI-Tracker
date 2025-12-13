'use client';

import { NewRiskDialog } from '@/components/dashboard/new-risk-dialog';
import { useCanEdit } from '@/lib/hooks/use-permissions';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ConditionalNewRiskButtonProps {
  projects: { id: string; name: string }[];
  users: { id: string; name: string; email: string }[];
  triggerButton?: React.ReactNode;
}

export function ConditionalNewRiskButton({ projects, users, triggerButton }: ConditionalNewRiskButtonProps) {
  const canEdit = useCanEdit();
  
  if (!canEdit) {
    return null;
  }
  
  return (
    <NewRiskDialog 
      projects={projects} 
      users={users}
      triggerButton={triggerButton || (
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Your First Risk
        </Button>
      )}
    />
  );
}
