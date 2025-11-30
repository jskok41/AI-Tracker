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
import { DEFAULT_KPIS } from '@/lib/default-kpis';
import { MetricType } from '@prisma/client';

interface AddMetricDialogProps {
  projectId: string;
  kpis: { id: string; kpiName: string }[];
  triggerButton?: React.ReactNode;
}

export function AddMetricDialog({ projectId, kpis, triggerButton }: AddMetricDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showNewKPI, setShowNewKPI] = useState(false);
  const [selectedDefaultKPI, setSelectedDefaultKPI] = useState<string>('');
  const [isCreatingKPI, setIsCreatingKPI] = useState(false);
  const [localKPIs, setLocalKPIs] = useState(kpis);
  const [formData, setFormData] = useState({
    kpiId: kpis.length > 0 ? kpis[0].id : '',
    metricValue: '',
    time: new Date().toISOString().split('T')[0],
  });
  const [newKPIData, setNewKPIData] = useState({
    kpiName: '',
    description: '',
    metricType: 'OPERATIONAL_EFFICIENCY' as MetricType,
    unit: '',
    targetValue: '',
    calculationFormula: '',
    measurementMethod: '',
    dataSource: '',
    collectionFrequency: 'weekly',
  });

  const handleCreateKPI = async () => {
    if (!newKPIData.kpiName.trim()) {
      toast.error('KPI name is required');
      return;
    }

    setIsCreatingKPI(true);
    try {
      const response = await fetch('/api/kpis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          kpiName: newKPIData.kpiName.trim(),
          description: newKPIData.description.trim() || undefined,
          metricType: newKPIData.metricType,
          unit: newKPIData.unit.trim() || undefined,
          targetValue: newKPIData.targetValue ? parseFloat(newKPIData.targetValue) : undefined,
          calculationFormula: newKPIData.calculationFormula.trim() || undefined,
          dataSource: newKPIData.dataSource.trim() || undefined,
          collectionFrequency: newKPIData.collectionFrequency || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create KPI');
      }

      const newKPI = await response.json();
      setLocalKPIs([...localKPIs, { id: newKPI.id, kpiName: newKPI.kpiName }]);
      setFormData({ ...formData, kpiId: newKPI.id });
      setNewKPIData({
        kpiName: '',
        description: '',
        metricType: 'OPERATIONAL_EFFICIENCY',
        unit: '',
        targetValue: '',
        calculationFormula: '',
        measurementMethod: '',
        dataSource: '',
        collectionFrequency: 'weekly',
      });
      setShowNewKPI(false);
      toast.success('KPI created successfully!');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create KPI');
    } finally {
      setIsCreatingKPI(false);
    }
  };

  const handleUseDefaultKPI = () => {
    if (!selectedDefaultKPI) return;

    const defaultKPI = DEFAULT_KPIS.find(k => k.kpiName === selectedDefaultKPI);
    if (!defaultKPI) return;

    setNewKPIData({
      kpiName: defaultKPI.kpiName,
      description: defaultKPI.description,
      metricType: defaultKPI.metricType,
      unit: defaultKPI.unit,
      targetValue: defaultKPI.targetValue?.toString() || '',
      calculationFormula: defaultKPI.calculationFormula,
      measurementMethod: defaultKPI.measurementMethod,
      dataSource: defaultKPI.dataSource || '',
      collectionFrequency: defaultKPI.collectionFrequency || 'weekly',
    });
    setShowNewKPI(true);
    setSelectedDefaultKPI('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // If creating a new KPI, create it first
    if (showNewKPI && newKPIData.kpiName.trim()) {
      if (!formData.kpiId) {
        toast.error('Please create the KPI first before adding a metric value');
        return;
      }
    }

    if (!formData.kpiId) {
      toast.error('Please select or create a KPI');
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/metrics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId,
            kpiId: formData.kpiId,
            metricValue: parseFloat(formData.metricValue),
            time: new Date(formData.time),
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to add metric');
        }

        toast.success('Metric added successfully!');
        setOpen(false);
        setFormData({
          kpiId: localKPIs.length > 0 ? localKPIs[0].id : '',
          metricValue: '',
          time: new Date().toISOString().split('T')[0],
        });
        setShowNewKPI(false);
        setNewKPIData({
          kpiName: '',
          description: '',
          metricType: 'OPERATIONAL_EFFICIENCY',
          unit: '',
          targetValue: '',
          calculationFormula: '',
          measurementMethod: '',
          dataSource: '',
          collectionFrequency: 'weekly',
        });
        router.refresh();
      } catch (error) {
        toast.error('Failed to add metric');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Metric Value
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Metric Value</DialogTitle>
          <DialogDescription>
            Record a new metric value for this project. You can use an existing KPI or create a new one.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="kpiId">KPI *</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      setShowNewKPI(!showNewKPI);
                      if (showNewKPI) {
                        setNewKPIData({
                          kpiName: '',
                          description: '',
                          metricType: 'OPERATIONAL_EFFICIENCY',
                          unit: '',
                          targetValue: '',
                          calculationFormula: '',
                          measurementMethod: '',
                          dataSource: '',
                          collectionFrequency: 'weekly',
                        });
                      }
                    }}
                  >
                    {showNewKPI ? 'Use Existing' : '+ New KPI'}
                  </Button>
                </div>
              </div>

              {showNewKPI ? (
                <div className="space-y-4 border rounded-lg p-4">
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="defaultKPI">Start with Professional KPI Template</Label>
                      <Select
                        value={selectedDefaultKPI}
                        onValueChange={setSelectedDefaultKPI}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a template..." />
                        </SelectTrigger>
                        <SelectContent>
                          {DEFAULT_KPIS.map((kpi) => (
                            <SelectItem key={kpi.kpiName} value={kpi.kpiName}>
                              {kpi.kpiName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedDefaultKPI && (
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleUseDefaultKPI}
                        >
                          Use Template
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="kpiName">KPI Name *</Label>
                    <Input
                      id="kpiName"
                      placeholder="e.g., Average Response Time"
                      value={newKPIData.kpiName}
                      onChange={(e) =>
                        setNewKPIData({ ...newKPIData, kpiName: e.target.value })
                      }
                      required
                      minLength={3}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what this KPI measures"
                      value={newKPIData.description}
                      onChange={(e) =>
                        setNewKPIData({ ...newKPIData, description: e.target.value })
                      }
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="metricType">Metric Type *</Label>
                      <Select
                        value={newKPIData.metricType}
                        onValueChange={(value) =>
                          setNewKPIData({ ...newKPIData, metricType: value as MetricType })
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="OPERATIONAL_EFFICIENCY">Operational Efficiency</SelectItem>
                          <SelectItem value="FINANCIAL_PERFORMANCE">Financial Performance</SelectItem>
                          <SelectItem value="CUSTOMER_SATISFACTION">Customer Satisfaction</SelectItem>
                          <SelectItem value="EMPLOYEE_PRODUCTIVITY">Employee Productivity</SelectItem>
                          <SelectItem value="QUALITY_IMPROVEMENT">Quality Improvement</SelectItem>
                          <SelectItem value="RISK_COMPLIANCE">Risk & Compliance</SelectItem>
                          <SelectItem value="ADOPTION_ENGAGEMENT">Adoption & Engagement</SelectItem>
                          <SelectItem value="INNOVATION_VELOCITY">Innovation Velocity</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="unit">Unit</Label>
                      <Input
                        id="unit"
                        placeholder="e.g., seconds, percentage, USD"
                        value={newKPIData.unit}
                        onChange={(e) =>
                          setNewKPIData({ ...newKPIData, unit: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="calculationFormula">Calculation Formula</Label>
                    <Input
                      id="calculationFormula"
                      placeholder="e.g., Sum of values / Count"
                      value={newKPIData.calculationFormula}
                      onChange={(e) =>
                        setNewKPIData({ ...newKPIData, calculationFormula: e.target.value })
                      }
                    />
                    {newKPIData.calculationFormula && (
                      <p className="text-xs text-muted-foreground">
                        Formula: {newKPIData.calculationFormula}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="measurementMethod">Measurement Method</Label>
                    <Textarea
                      id="measurementMethod"
                      placeholder="Describe how to measure this KPI"
                      value={newKPIData.measurementMethod}
                      onChange={(e) =>
                        setNewKPIData({ ...newKPIData, measurementMethod: e.target.value })
                      }
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="targetValue">Target Value</Label>
                      <Input
                        id="targetValue"
                        type="number"
                        step="0.01"
                        placeholder="e.g., 10"
                        value={newKPIData.targetValue}
                        onChange={(e) =>
                          setNewKPIData({ ...newKPIData, targetValue: e.target.value })
                        }
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="collectionFrequency">Collection Frequency</Label>
                      <Select
                        value={newKPIData.collectionFrequency}
                        onValueChange={(value) =>
                          setNewKPIData({ ...newKPIData, collectionFrequency: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="dataSource">Data Source</Label>
                    <Input
                      id="dataSource"
                      placeholder="e.g., Customer service system, Analytics"
                      value={newKPIData.dataSource}
                      onChange={(e) =>
                        setNewKPIData({ ...newKPIData, dataSource: e.target.value })
                      }
                    />
                  </div>

                  <Button
                    type="button"
                    onClick={async () => {
                      await handleCreateKPI();
                    }}
                    disabled={isCreatingKPI || !newKPIData.kpiName.trim()}
                  >
                    {isCreatingKPI ? 'Creating...' : 'Create KPI'}
                  </Button>
                </div>
              ) : (
                <Select
                  value={formData.kpiId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, kpiId: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select KPI" />
                  </SelectTrigger>
                  <SelectContent>
                    {localKPIs.map((kpi) => (
                      <SelectItem key={kpi.id} value={kpi.id}>
                        {kpi.kpiName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {!showNewKPI && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="metricValue">Metric Value *</Label>
                  <Input
                    id="metricValue"
                    type="number"
                    step="0.01"
                    value={formData.metricValue}
                    onChange={(e) =>
                      setFormData({ ...formData, metricValue: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="time">Date *</Label>
                  <Input
                    id="time"
                    type="date"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                    required
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                setShowNewKPI(false);
                setNewKPIData({
                  kpiName: '',
                  description: '',
                  metricType: 'OPERATIONAL_EFFICIENCY',
                  unit: '',
                  targetValue: '',
                  calculationFormula: '',
                  measurementMethod: '',
                  dataSource: '',
                  collectionFrequency: 'weekly',
                });
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !formData.kpiId || !formData.metricValue}>
              {isPending ? 'Adding...' : 'Add Metric'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
