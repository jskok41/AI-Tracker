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
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface AddPhaseDialogProps {
  projectId: string;
  existingPhasesCount?: number;
  triggerButton?: React.ReactNode;
}

export function AddPhaseDialog({ projectId, existingPhasesCount = 0, triggerButton }: AddPhaseDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    phaseName: '',
    description: '',
    status: 'NOT_STARTED',
    progressPercentage: '0',
    startDate: '',
    targetEndDate: '',
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        const response = await fetch('/api/roadmap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'phase',
            projectId,
            phaseName: formData.phaseName,
            description: formData.description || null,
            phaseOrder: existingPhasesCount,
            status: formData.status,
            progressPercentage: parseFloat(formData.progressPercentage),
            startDate: formData.startDate || null,
            targetEndDate: formData.targetEndDate || null,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create phase');
        }

        toast.success('Phase created successfully!');
        setOpen(false);
        setFormData({
          phaseName: '',
          description: '',
          status: 'NOT_STARTED',
          progressPercentage: '0',
          startDate: '',
          targetEndDate: '',
        });
        router.refresh();
      } catch (error) {
        toast.error('Failed to create phase');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Phase
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Phase</DialogTitle>
          <DialogDescription>
            Create a new phase for this project roadmap.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="phaseName">Phase Name *</Label>
              <Input
                id="phaseName"
                value={formData.phaseName}
                onChange={(e) =>
                  setFormData({ ...formData, phaseName: e.target.value })
                }
                placeholder="e.g., Planning & Requirements"
                required
                minLength={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe what this phase entails"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status">Status *</Label>
                <Select
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
                    <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="BLOCKED">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="progressPercentage">Progress Percentage *</Label>
                <Input
                  id="progressPercentage"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.progressPercentage}
                  onChange={(e) =>
                    setFormData({ ...formData, progressPercentage: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="targetEndDate">Target End Date</Label>
                <Input
                  id="targetEndDate"
                  type="date"
                  value={formData.targetEndDate}
                  onChange={(e) =>
                    setFormData({ ...formData, targetEndDate: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                setFormData({
                  phaseName: '',
                  description: '',
                  status: 'NOT_STARTED',
                  progressPercentage: '0',
                  startDate: '',
                  targetEndDate: '',
                });
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creating...' : 'Create Phase'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
