'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EditRiskDialog } from '@/components/dashboard/edit-risk-dialog';
import { AlertTriangle, Edit, Trash2 } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import { toast } from 'sonner';
import { deleteRisk } from '@/lib/actions';

interface RisksListProps {
  risks: any[];
  projects: { id: string; name: string }[];
  users: { id: string; name: string; email: string }[];
}

// Severity colors
const getSeverityColor = (severity: string) => {
  const colors: Record<string, string> = {
    LOW: 'bg-blue-500',
    MEDIUM: 'bg-yellow-500',
    HIGH: 'bg-orange-500',
    CRITICAL: 'bg-red-500',
  };
  return colors[severity] || 'bg-gray-500';
};

// Status colors
const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    OPEN: 'destructive',
    MITIGATED: 'default',
    ACCEPTED: 'secondary',
    CLOSED: 'outline',
  };
  return colors[status] || 'secondary';
};

export function RisksList({ risks, projects, users }: RisksListProps) {
  const [editingRisk, setEditingRisk] = useState<any | null>(null);

  const handleQuickDelete = async (riskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this risk assessment?')) {
      return;
    }

    const result = await deleteRisk(riskId);
    if (result.success) {
      toast.success('Risk deleted successfully!');
    } else {
      toast.error(result.error || 'Failed to delete risk');
    }
  };

  return (
    <>
      <div className="grid gap-4">
        {risks.map((risk) => (
          <Card key={risk.id} className="group hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Header with Actions */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-1 h-16 rounded-full ${getSeverityColor(risk.severity)}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{risk.riskTitle}</h3>
                        <Badge variant={getStatusColor(risk.status) as any} className="text-xs">
                          {risk.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {risk.riskDescription}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingRisk(risk);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => handleQuickDelete(risk.id, e)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>

                {/* Risk Details */}
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground mb-1">Severity</div>
                    <Badge variant="outline" className="font-medium">
                      {risk.severity}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Likelihood</div>
                    <div className="font-medium">{risk.likelihood}/5</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Category</div>
                    <div className="font-medium">{risk.category || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Risk Score</div>
                    <div className="font-medium">{risk.likelihood * 
                      (risk.severity === 'CRITICAL' ? 4 : 
                       risk.severity === 'HIGH' ? 3 : 
                       risk.severity === 'MEDIUM' ? 2 : 1)}/20
                    </div>
                  </div>
                </div>

                {/* Mitigation Plan */}
                {risk.mitigationPlan && (
                  <div className="bg-muted/50 p-3 rounded-md">
                    <div className="text-xs font-medium text-muted-foreground mb-1">
                      Mitigation Plan
                    </div>
                    <p className="text-sm">{risk.mitigationPlan}</p>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                  <div className="flex items-center gap-4">
                    <span>Project: {risk.project?.name || 'N/A'}</span>
                    <span>•</span>
                    <span>Owner: {risk.owner?.name || 'N/A'}</span>
                  </div>
                  {risk.identifiedDate && (
                    <span>
                      Identified {formatRelativeTime(risk.identifiedDate)}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editingRisk && (
        <EditRiskDialog
          risk={editingRisk}
          open={!!editingRisk}
          onOpenChange={(open) => !open && setEditingRisk(null)}
          projects={projects}
          users={users}
        />
      )}
    </>
  );
}

