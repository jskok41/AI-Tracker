'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

/**
 * Hook to check if current user can edit a specific project
 * This makes a server call to check permissions (owner, admin, or assigned member)
 */
export function useCanEditProject(projectId: string): boolean {
  const { data: session, status } = useSession();
  const [canEdit, setCanEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading' || !session?.user || !projectId) {
      setCanEdit(false);
      setIsLoading(false);
      return;
    }

    // Check permissions on server
    fetch(`/api/projects/${projectId}/can-edit`)
      .then((res) => res.json())
      .then((data) => {
        setCanEdit(data.canEdit || false);
        setIsLoading(false);
      })
      .catch(() => {
        setCanEdit(false);
        setIsLoading(false);
      });
  }, [projectId, session, status]);

  return canEdit;
}

