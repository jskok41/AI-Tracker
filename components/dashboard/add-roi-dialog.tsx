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
import { Plus, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface AddROIDialogProps {
  projectId: string;
  roi?: {
    id: string;
    calculationDate: string;
    implementationCost: number | null;
    operationalCost: number | null;
    maintenanceCost: number | null;
    costSavings: number | null;
    revenueIncrease: number | null;
    productivityGainsValue: number | null;
    notes: string | null;
  };
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerButton?: React.ReactNode;
}

export function AddROIDialog({
  projectId,
  roi,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  triggerButton,
}: AddROIDialogProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isEdit = !!roi;
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  const [formData, setFormData] = useState({
    calculationDate: roi
      ? new Date(roi.calculationDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    implementationCost: roi?.implementationCost?.toString() || '',
    operationalCost: roi?.operationalCost?.toString() || '',
    maintenanceCost: roi?.maintenanceCost?.toString() || '',
    costSavings: roi?.costSavings?.toString() || '',
    revenueIncrease: roi?.revenueIncrease?.toString() || '',
    productivityGainsValue: roi?.productivityGainsValue?.toString() || '',
    notes: roi?.notes || '',
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        const url = isEdit ? `/api/roi/${roi.id}` : '/api/roi';
        const method = isEdit ? 'PATCH' : 'POST';

        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId,
            calculationDate: new Date(formData.calculationDate),
            implementationCost: formData.implementationCost
              ? parseFloat(formData.implementationCost)
              : 0,
            operationalCost: formData.operationalCost
              ? parseFloat(formData.operationalCost)
              : 0,
            maintenanceCost: formData.maintenanceCost
              ? parseFloat(formData.maintenanceCost)
              : 0,
            costSavings: formData.costSavings
              ? parseFloat(formData.costSavings)
              : 0,
            revenueIncrease: formData.revenueIncrease
              ? parseFloat(formData.revenueIncrease)
              : 0,
            productivityGainsValue: formData.productivityGainsValue
              ? parseFloat(formData.productivityGainsValue)
              : 0,
            notes: formData.notes || null,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save ROI calculation');
        }

        toast.success(
          isEdit
            ? 'ROI calculation updated successfully!'
            : 'ROI calculation added successfully!'
        );
        setOpen(false);
        router.refresh();
      } catch (error) {
        toast.error('Failed to save ROI calculation');
      }
    });
  };

  const content = (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {isEdit ? 'Edit ROI Calculation' : 'Add ROI Calculation'}
        </DialogTitle>
        <DialogDescription>
          {isEdit
            ? 'Update the ROI calculation details.'
            : 'Calculate and record ROI for this project.'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="calculationDate">Calculation Date *</Label>
            <Input
              id="calculationDate"
              type="date"
              value={formData.calculationDate}
              onChange={(e) =>
                setFormData({ ...formData, calculationDate: e.target.value })
              }
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <h4 className="font-medium">Costs</h4>
              <div className="grid gap-2">
                <Label htmlFor="implementationCost">Implementation Cost</Label>
                <Input
                  id="implementationCost"
                  type="number"
                  step="0.01"
                  value={formData.implementationCost}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      implementationCost: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="operationalCost">Operational Cost</Label>
                <Input
                  id="operationalCost"
                  type="number"
                  step="0.01"
                  value={formData.operationalCost}
                  onChange={(e) =>
                    setFormData({ ...formData, operationalCost: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="maintenanceCost">Maintenance Cost</Label>
                <Input
                  id="maintenanceCost"
                  type="number"
                  step="0.01"
                  value={formData.maintenanceCost}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maintenanceCost: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Benefits</h4>
              <div className="grid gap-2">
                <Label htmlFor="costSavings">Cost Savings</Label>
                <Input
                  id="costSavings"
                  type="number"
                  step="0.01"
                  value={formData.costSavings}
                  onChange={(e) =>
                    setFormData({ ...formData, costSavings: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="revenueIncrease">Revenue Increase</Label>
                <Input
                  id="revenueIncrease"
                  type="number"
                  step="0.01"
                  value={formData.revenueIncrease}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      revenueIncrease: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="productivityGainsValue">
                  Productivity Gains Value
                </Label>
                <Input
                  id="productivityGainsValue"
                  type="number"
                  step="0.01"
                  value={formData.productivityGainsValue}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      productivityGainsValue: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
            />
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
            {isPending
              ? isEdit
                ? 'Updating...'
                : 'Adding...'
              : isEdit
                ? 'Update ROI'
                : 'Add ROI'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );

  if (isEdit) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        {content}
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add ROI Calculation
          </Button>
        )}
      </DialogTrigger>
      {content}
    </Dialog>
  );
}

