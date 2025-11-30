'use client';

import { useState, useTransition, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updateProject, deleteProject } from '@/lib/actions';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

interface EditProjectDialogProps {
  project: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departments: { id: string; name: string }[];
  users: { id: string; name: string; email: string }[];
}

export function EditProjectDialog({ project, open, onOpenChange, departments, users }: EditProjectDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    category: project.category,
    status: project.status,
    departmentId: project.departmentId,
    ownerId: project.ownerId,
  });

  useEffect(() => {
    if (open) {
      setFormData({
        category: project.category,
        status: project.status,
        departmentId: project.departmentId,
        ownerId: project.ownerId,
      });
    }
  }, [open, project]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    startTransition(async () => {
      const result = await updateProject(project.id, data);
      if (result.success) {
        toast.success('Project updated successfully!');
        onOpenChange(false);
      } else {
        toast.error(result.error || 'Failed to update project');
      }
    });
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteProject(project.id);
    
    if (result.success) {
      toast.success('Project deleted successfully!');
      onOpenChange(false);
    } else {
      toast.error(result.error || 'Failed to delete project');
    }
    setIsDeleting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Update project details or delete the project.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={project.name}
                placeholder="Enter project name"
                required
                minLength={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={project.description}
                placeholder="Describe the project goals and objectives"
                required
                minLength={10}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  name="category"
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AI_AGENT">AI Agent</SelectItem>
                    <SelectItem value="AI_INITIATIVE">AI Initiative</SelectItem>
                    <SelectItem value="PROMPT_LIBRARY">Prompt Library</SelectItem>
                    <SelectItem value="GEN_AI_PRODUCTION">Gen AI Production</SelectItem>
                    <SelectItem value="RISK_MANAGEMENT">Risk Management</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  name="status"
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PLANNING">Planning</SelectItem>
                    <SelectItem value="PILOT">Pilot</SelectItem>
                    <SelectItem value="SCALING">Scaling</SelectItem>
                    <SelectItem value="PRODUCTION">Production</SelectItem>
                    <SelectItem value="PAUSED">Paused</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="departmentId">Department *</Label>
                <Select
                  name="departmentId"
                  value={formData.departmentId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, departmentId: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="ownerId">Project Owner *</Label>
                <Select
                  name="ownerId"
                  value={formData.ownerId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, ownerId: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select owner" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date (optional)</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  defaultValue={
                    project.startDate
                      ? new Date(project.startDate).toISOString().split('T')[0]
                      : ''
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="targetCompletionDate">Target Completion Date (optional)</Label>
                <Input
                  id="targetCompletionDate"
                  name="targetCompletionDate"
                  type="date"
                  defaultValue={
                    project.targetCompletionDate
                      ? new Date(project.targetCompletionDate).toISOString().split('T')[0]
                      : ''
                  }
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="budgetAllocated">Budget Allocated (optional)</Label>
              <Input
                id="budgetAllocated"
                name="budgetAllocated"
                type="number"
                defaultValue={project.budgetAllocated || ''}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending || isDeleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isDeleting ? 'Deleting...' : 'Delete Project'}
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending || isDeleting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending || isDeleting}>
                {isPending ? 'Updating...' : 'Update Project'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

