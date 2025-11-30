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
import { createRisk } from '@/lib/actions';
import { toast } from 'sonner';

interface NewRiskDialogProps {
  projects: { id: string; name: string }[];
  users: { id: string; name: string; email: string }[];
  triggerButton?: React.ReactNode;
}

export function NewRiskDialog({ projects, users, triggerButton }: NewRiskDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    category: 'TECHNICAL',
    severity: 'MEDIUM',
    likelihood: 'POSSIBLE',
    status: 'OPEN',
    projectId: projects.length > 0 ? projects[0].id : '',
    identifiedById: users.length > 0 ? users[0].id : '',
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    startTransition(async () => {
      const result = await createRisk(data);
      if (result.success) {
        toast.success('Risk assessment created successfully!');
        setOpen(false);
        form.reset();
        setFormData({
          category: 'TECHNICAL',
          severity: 'MEDIUM',
          likelihood: 'POSSIBLE',
          status: 'OPEN',
          projectId: projects.length > 0 ? projects[0].id : '',
          identifiedById: users.length > 0 ? users[0].id : '',
        });
      } else {
        toast.error(result.error || 'Failed to create risk assessment');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Risk
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Risk Assessment</DialogTitle>
          <DialogDescription>
            Document and track potential risks associated with AI initiatives.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Risk Title *</Label>
              <Input
                id="title"
                name="title"
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
              {isPending ? 'Creating...' : 'Create Risk Assessment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

