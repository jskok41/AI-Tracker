'use client';

import { useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Plus } from 'lucide-react';
import { createPrompt } from '@/lib/actions';
import { toast } from 'sonner';

interface NewPromptDialogProps {
  projects: { id: string; name: string }[];
  users: { id: string; name: string; email: string }[];
  triggerButton?: React.ReactNode;
}

export function NewPromptDialog({ projects, users, triggerButton }: NewPromptDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    projectId: '',
    createdById: users.length > 0 ? users[0].id : '',
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    startTransition(async () => {
      const result = await createPrompt(data);
      if (result.success) {
        toast.success('Prompt created successfully!');
        setOpen(false);
        form.reset();
        setFormData({
          projectId: '',
          createdById: users.length > 0 ? users[0].id.toString() : '',
        });
      } else {
        toast.error(result.error || 'Failed to create prompt');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Prompt
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Prompt</DialogTitle>
          <DialogDescription>
            Add a prompt to your library for reuse across projects.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Prompt Title *</Label>
              <Input
                id="title"
                name="title"
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
                placeholder="e.g., marketing, ai, automation"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Brief description of what this prompt does"
                rows={2}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="promptText">Prompt Text *</Label>
              <Textarea
                id="promptText"
                name="promptText"
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Adding...' : 'Add Prompt'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

