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
import { createProject } from '@/lib/actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface NewProjectDialogProps {
  departments: { id: string; name: string }[];
  users: { id: string; name: string; email: string }[];
}

const CATEGORY_OPTIONS = [
  { value: 'AI_AGENT', label: 'AI Agent' },
  { value: 'AI_INITIATIVE', label: 'AI Initiative' },
  { value: 'PROMPT_LIBRARY', label: 'Prompt Library' },
  { value: 'GEN_AI_PRODUCTION', label: 'Gen AI Production' },
  { value: 'RISK_MANAGEMENT', label: 'Risk Management' },
  { value: 'OTHER', label: 'Other' },
];

export function NewProjectDialog({ departments, users }: NewProjectDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showNewDepartment, setShowNewDepartment] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCreatingDepartment, setIsCreatingDepartment] = useState(false);
  const [localDepartments, setLocalDepartments] = useState(departments);
  const [formData, setFormData] = useState({
    category: 'AI_INITIATIVE',
    status: 'PLANNING',
    departmentId: '',
    ownerId: '',
  });

  const handleCreateDepartment = async () => {
    if (!newDepartmentName.trim()) {
      toast.error('Department name is required');
      return;
    }

    setIsCreatingDepartment(true);
    try {
      const response = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newDepartmentName.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create department');
      }

      const newDepartment = await response.json();
      setLocalDepartments([...localDepartments, newDepartment]);
      setFormData({ ...formData, departmentId: newDepartment.id });
      setNewDepartmentName('');
      setShowNewDepartment(false);
      toast.success('Department created successfully!');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create department');
    } finally {
      setIsCreatingDepartment(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    // If custom category is entered, use OTHER and append custom name to description
    if (showNewCategory && newCategoryName.trim()) {
      data.set('category', 'OTHER');
      const existingDescription = data.get('description') as string || '';
      data.set('description', `${existingDescription}\n\nCustom Category: ${newCategoryName.trim()}`.trim());
    }

    startTransition(async () => {
      const result = await createProject(data);
      if (result.success) {
        toast.success('Project created successfully!');
        setOpen(false);
        form.reset();
        setFormData({
          category: 'AI_INITIATIVE',
          status: 'PLANNING',
          departmentId: '',
          ownerId: '',
        });
        setShowNewDepartment(false);
        setShowNewCategory(false);
        setNewDepartmentName('');
        setNewCategoryName('');
        router.refresh();
      } else {
        // Keep dialog open and preserve all form values on error
        toast.error(result.error || 'Failed to create project');
        // Form values are automatically retained since we're using uncontrolled inputs
      }
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    // Only allow closing if not submitting and no error occurred
    if (!newOpen && !isPending) {
      // Reset form when manually closing
      setFormData({
        category: 'AI_INITIATIVE',
        status: 'PLANNING',
        departmentId: '',
        ownerId: '',
      });
      setShowNewDepartment(false);
      setShowNewCategory(false);
      setNewDepartmentName('');
      setNewCategoryName('');
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New AI Project</DialogTitle>
          <DialogDescription>
            Add a new AI initiative to track its benefits and impact.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                name="name"
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
                placeholder="Describe the project goals and objectives"
                required
                minLength={10}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="category">Category *</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      setShowNewCategory(!showNewCategory);
                      if (showNewCategory) {
                        setNewCategoryName('');
                      }
                    }}
                  >
                    {showNewCategory ? 'Use Existing' : '+ New'}
                  </Button>
                </div>
                {showNewCategory ? (
                  <div className="space-y-2">
                    <Input
                      placeholder="Enter new category name"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      minLength={2}
                    />
                    <p className="text-xs text-muted-foreground">
                      Custom categories will be stored as "Other"
                    </p>
                  </div>
                ) : (
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
                      {CATEGORY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="departmentId">Department *</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      setShowNewDepartment(!showNewDepartment);
                      if (showNewDepartment) {
                        setNewDepartmentName('');
                      }
                    }}
                  >
                    {showNewDepartment ? 'Use Existing' : '+ New'}
                  </Button>
                </div>
                {showNewDepartment ? (
                  <div className="space-y-2">
                    <Input
                      placeholder="Enter new department name"
                      value={newDepartmentName}
                      onChange={(e) => setNewDepartmentName(e.target.value)}
                      minLength={2}
                      disabled={isCreatingDepartment}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleCreateDepartment}
                      disabled={isCreatingDepartment || !newDepartmentName.trim()}
                    >
                      {isCreatingDepartment ? 'Creating...' : 'Create Department'}
                    </Button>
                  </div>
                ) : (
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
                      {localDepartments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
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
                <Label htmlFor="budgetAllocated">Budget Allocated (optional)</Label>
                <Input
                  id="budgetAllocated"
                  name="budgetAllocated"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="targetCompletionDate">Completion Date (optional)</Label>
                <Input
                  id="targetCompletionDate"
                  name="targetCompletionDate"
                  type="date"
                />
              </div>
            </div>

            {/* Key Highlight Remarks Section */}
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-semibold mb-4">Key Highlight Remarks</h3>
              
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="team">Department & Team (TEST/MDW, line/tool/module)</Label>
                  <Input
                    id="team"
                    name="team"
                    placeholder="e.g., TEST/MDW, Line 5, Tool XYZ"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="ownerContact">Project Owner Contact</Label>
                  <Input
                    id="ownerContact"
                    name="ownerContact"
                    placeholder="e.g., email@company.com, +1-234-567-8900"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="problemStatement">Problem Statement</Label>
                  <Textarea
                    id="problemStatement"
                    name="problemStatement"
                    placeholder="Describe the problem this project aims to solve"
                    rows={3}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="aiMlApproach">AI/ML Approach</Label>
                  <Textarea
                    id="aiMlApproach"
                    name="aiMlApproach"
                    placeholder="e.g., classification, anomaly detection, forecasting; tools/platforms used"
                    rows={3}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="deploymentEnvironment">Deployment Status & Environment</Label>
                  <Textarea
                    id="deploymentEnvironment"
                    name="deploymentEnvironment"
                    placeholder="e.g., PoC/Pilot/Production; Python, Databricks, Power BI, Copilot Studio"
                    rows={2}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="benefitRealized">Benefit Realized</Label>
                  <Textarea
                    id="benefitRealized"
                    name="benefitRealized"
                    placeholder="Quantify with before/after baselines, include cost/time/quality KPIs"
                    rows={3}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="validationMethod">Validation Method</Label>
                  <Textarea
                    id="validationMethod"
                    name="validationMethod"
                    placeholder="e.g., A/B trial, control chart, retrospection window, peer review"
                    rows={2}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="currentBlockers">Current Blockers / Support Needed</Label>
                  <Textarea
                    id="currentBlockers"
                    name="currentBlockers"
                    placeholder="e.g., data, infra, access, DS resourcing"
                    rows={2}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="nextSteps">Next Steps</Label>
                  <Textarea
                    id="nextSteps"
                    name="nextSteps"
                    placeholder="Scale plan, roadmap, dependencies"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                setShowNewDepartment(false);
                setShowNewCategory(false);
                setNewDepartmentName('');
                setNewCategoryName('');
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creating...' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
