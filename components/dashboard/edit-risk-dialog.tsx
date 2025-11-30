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
import { updateRisk, deleteRisk } from '@/lib/actions';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

interface EditRiskDialogProps {
  risk: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: { id: string; name: string }[];
  users: { id: string; name: string; email: string }[];
}

// Map numeric likelihood to string
const getLikelihoodString = (num: number): string => {
  const map: Record<number, string> = {
    1: 'RARE',
    2: 'UNLIKELY',
    3: 'POSSIBLE',
    4: 'LIKELY',
    5: 'CERTAIN',
  };
  return map[num] || 'POSSIBLE';
};

export function EditRiskDialog({ risk, open, onOpenChange, projects, users }: EditRiskDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    category: risk.category || 'TECHNICAL',
    severity: risk.severity,
    likelihood: getLikelihoodString(risk.likelihood),
    status: risk.status,
    projectId: risk.projectId,
    identifiedById: risk.ownerId,
  });

  useEffect(() => {
    if (open) {
      setFormData({
        category: risk.category || 'TECHNICAL',
        severity: risk.severity,
        likelihood: getLikelihoodString(risk.likelihood),
        status: risk.status,
        projectId: risk.projectId,
        identifiedById: risk.ownerId,
      });
    }
  }, [open, risk]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    startTransition(async () => {
      const result = await updateRisk(risk.id, data);
      if (result.success) {
        toast.success('Risk updated successfully!');
        onOpenChange(false);
      } else {
        toast.error(result.error || 'Failed to update risk');
      }
    });
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this risk assessment? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteRisk(risk.id);
    
    if (result.success) {
      toast.success('Risk deleted successfully!');
      onOpenChange(false);
    } else {
      toast.error(result.error || 'Failed to delete risk');
    }
    setIsDeleting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Risk Assessment</DialogTitle>
          <DialogDescription>
            Update risk details or delete the risk assessment.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Risk Title *</Label>
              <Input
                id="title"
                name="title"
                defaultValue={risk.riskTitle}
                placeholder="Enter risk title"
                required
                minLength={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={risk.riskDescription || ''}
                placeholder="Describe the risk and potential impact"
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
                    <SelectItem value="DATA_PRIVACY">Data Privacy</SelectItem>
                    <SelectItem value="BIAS">Bias</SelectItem>
                    <SelectItem value="SECURITY">Security</SelectItem>
                    <SelectItem value="COMPLIANCE">Compliance</SelectItem>
                    <SelectItem value="ETHICAL">Ethical</SelectItem>
                    <SelectItem value="TECHNICAL">Technical</SelectItem>
                    <SelectItem value="OPERATIONAL">Operational</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="severity">Severity *</Label>
                <Select
                  name="severity"
                  value={formData.severity}
                  onValueChange={(value) =>
                    setFormData({ ...formData, severity: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="likelihood">Likelihood *</Label>
                <Select
                  name="likelihood"
                  value={formData.likelihood}
                  onValueChange={(value) =>
                    setFormData({ ...formData, likelihood: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RARE">Rare</SelectItem>
                    <SelectItem value="UNLIKELY">Unlikely</SelectItem>
                    <SelectItem value="POSSIBLE">Possible</SelectItem>
                    <SelectItem value="LIKELY">Likely</SelectItem>
                    <SelectItem value="CERTAIN">Certain</SelectItem>
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
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="MITIGATED">Mitigated</SelectItem>
                    <SelectItem value="ACCEPTED">Accepted</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="mitigationPlan">Mitigation Plan (optional)</Label>
              <Textarea
                id="mitigationPlan"
                name="mitigationPlan"
                defaultValue={risk.mitigationPlan || ''}
                placeholder="Describe steps to mitigate this risk"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="projectId">Associated Project *</Label>
                <Select
                  name="projectId"
                  value={formData.projectId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, projectId: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="identifiedById">Identified By *</Label>
                <Select
                  name="identifiedById"
                  value={formData.identifiedById}
                  onValueChange={(value) =>
                    setFormData({ ...formData, identifiedById: value })
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
              {isDeleting ? 'Deleting...' : 'Delete Risk'}
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
                {isPending ? 'Updating...' : 'Update Risk'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

