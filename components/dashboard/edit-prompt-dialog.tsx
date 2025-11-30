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
import { updatePrompt, deletePrompt } from '@/lib/actions';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

interface EditPromptDialogProps {
  prompt: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: { id: string; name: string }[];
  users: { id: string; name: string; email: string }[];
}

export function EditPromptDialog({ prompt, open, onOpenChange, projects, users }: EditPromptDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    projectId: prompt.projectId || '',
    createdById: prompt.authorId,
  });

  useEffect(() => {
    if (open) {
      setFormData({
        projectId: prompt.projectId || '',
        createdById: prompt.authorId,
      });
    }
  }, [open, prompt]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    startTransition(async () => {
      const result = await updatePrompt(prompt.id, data);
      if (result.success) {
        toast.success('Prompt updated successfully!');
        onOpenChange(false);
      } else {
        toast.error(result.error || 'Failed to update prompt');
      }
    });
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this prompt? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    const result = await deletePrompt(prompt.id);
    
    if (result.success) {
      toast.success('Prompt deleted successfully!');
      onOpenChange(false);
    } else {
      toast.error(result.error || 'Failed to delete prompt');
    }
    setIsDeleting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Prompt</DialogTitle>
          <DialogDescription>
            Update prompt details or delete the prompt.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Prompt Title *</Label>
              <Input
                id="title"
                name="title"
                defaultValue={prompt.promptTitle}
                placeholder="Enter prompt title"
                required
                minLength={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                name="category"
                defaultValue={prompt.category || ''}
                placeholder="e.g., Customer Service, Content Generation, Data Analysis"
                required
                minLength={2}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                name="tags"
                defaultValue={prompt.tags || ''}
                placeholder="e.g., marketing, ai, automation"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={prompt.useCase || ''}
                placeholder="Brief description of what this prompt does"
                rows={2}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="promptText">Prompt Text *</Label>
              <Textarea
                id="promptText"
                name="promptText"
                defaultValue={prompt.promptText}
                placeholder="Enter the full prompt text here..."
                required
                minLength={10}
                rows={6}
                className="font-mono text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="projectId">Associated Project (optional)</Label>
                <Select
                  name="projectId"
                  value={formData.projectId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, projectId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="createdById">Created By *</Label>
                <Select
                  name="createdById"
                  value={formData.createdById}
                  onValueChange={(value) =>
                    setFormData({ ...formData, createdById: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select user" />
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
          </div>

          <DialogFooter className="flex justify-between">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending || isDeleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isDeleting ? 'Deleting...' : 'Delete Prompt'}
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
                {isPending ? 'Updating...' : 'Update Prompt'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

