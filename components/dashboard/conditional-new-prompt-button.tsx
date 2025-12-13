'use client';

import { NewPromptDialog } from '@/components/dashboard/new-prompt-dialog';
import { useCanEdit } from '@/lib/hooks/use-permissions';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ConditionalNewPromptButtonProps {
  projects: { id: string; name: string }[];
  users: { id: string; name: string; email: string }[];
  triggerButton?: React.ReactNode;
}

export function ConditionalNewPromptButton({ projects, users, triggerButton }: ConditionalNewPromptButtonProps) {
  const canEdit = useCanEdit();
  
  if (!canEdit) {
    return null;
  }
  
  return (
    <NewPromptDialog 
      projects={projects} 
      users={users}
      triggerButton={triggerButton || (
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Your First Prompt
        </Button>
      )}
    />
  );
}
