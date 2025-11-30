'use client';

import { useState } from 'react';
import { ProjectCard } from '@/components/dashboard/project-card';
import { EditProjectDialog } from '@/components/dashboard/edit-project-dialog';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

interface ProjectsListProps {
  projects: any[];
  departments: { id: string; name: string }[];
  users: { id: string; name: string; email: string }[];
}

export function ProjectsList({ projects, departments, users }: ProjectsListProps) {
  const [editingProject, setEditingProject] = useState<any | null>(null);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <div key={project.id} className="relative group">
            <ProjectCard
              id={project.id}
              name={project.name}
              description={project.description}
              category={project.category}
              status={project.status}
              budgetAllocated={project.budgetAllocated}
              budgetSpent={project.budgetSpent}
              latestROI={project.latestROI}
              activeKPIs={project.activeKPIs}
              openRisks={project.openRisks}
            />
            <Button
              size="sm"
              variant="secondary"
              className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.preventDefault();
                setEditingProject(project);
              }}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>
        ))}
      </div>

      {editingProject && (
        <EditProjectDialog
          project={editingProject}
          open={!!editingProject}
          onOpenChange={(open) => !open && setEditingProject(null)}
          departments={departments}
          users={users}
        />
      )}
    </>
  );
}

