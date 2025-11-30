'use client';

import { useState, useTransition } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface EditPhaseDialogProps {
  phase: {
    id: string;
    phaseName: string;
    status: string;
    progressPercentage: number | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPhaseDialog({ phase, open, onOpenChange }: EditPhaseDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    status: phase.status,
    progressPercentage: (phase.progressPercentage ?? 0).toString(),
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        const response = await fetch(`/api/roadmap/${phase.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: formData.status,
            progressPercentage: parseFloat(formData.progressPercentage),
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update phase');
        }

        toast.success('Phase updated successfully!');
        onOpenChange(false);
        router.refresh();
      } catch (error) {
        toast.error('Failed to update phase');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Phase: {phase.phaseName}</DialogTitle>
          <DialogDescription>
            Update the status and progress of this phase.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Updating...' : 'Update Phase'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

