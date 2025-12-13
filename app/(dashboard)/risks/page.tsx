import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { NewRiskDialog } from '@/components/dashboard/new-risk-dialog';
import { RisksList } from '@/components/dashboard/risks-list';
import { Plus, AlertTriangle } from 'lucide-react';
import { formatDate, getRiskColor, calculateRiskScore } from '@/lib/utils';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

async function getRisks(departmentIds?: string[]) {
  const where: any = {};
  
  // Filter by departments if provided
  if (departmentIds && departmentIds.length > 0) {
    where.project = {
      departmentId: {
        in: departmentIds,
      },
    };
  }

  const risks = await prisma.riskAssessment.findMany({
    where,
    include: {
      project: {
        select: {
          id: true,
          name: true,
        },
      },
      owner: {
        select: {
          name: true,
        },
      },
    },
    orderBy: [
      { status: 'asc' },
      { severity: 'desc' },
      { likelihood: 'desc' },
    ],
  });

  return risks.map(risk => ({
    ...risk,
    riskScore: calculateRiskScore(risk.severity, risk.likelihood),
  }));
}

async function getRiskStats(departmentIds?: string[]) {
  const baseWhere: any = {};
  const openWhere: any = { status: 'OPEN' };
  const criticalWhere: any = { 
    severity: 'CRITICAL',
    status: 'OPEN',
  };
  const mitigatedWhere: any = { status: 'MITIGATED' };

  // Add department filter if provided
  if (departmentIds && departmentIds.length > 0) {
    const departmentFilter = {
      project: {
        departmentId: {
          in: departmentIds,
        },
      },
    };
    baseWhere.project = departmentFilter.project;
    openWhere.project = departmentFilter.project;
    criticalWhere.project = departmentFilter.project;
    mitigatedWhere.project = departmentFilter.project;
  }

  const total = await prisma.riskAssessment.count({ where: baseWhere });
  const openRisks = await prisma.riskAssessment.count({ where: openWhere });
  const criticalRisks = await prisma.riskAssessment.count({ where: criticalWhere });
  const mitigated = await prisma.riskAssessment.count({ where: mitigatedWhere });

  return {
    total,
    openRisks,
    criticalRisks,
    mitigated,
  };
}

export default async function RisksPage({
  searchParams,
}: {
  searchParams: Promise<{ departmentId?: string | string[] }>;
}) {
  const params = await searchParams;
  // Handle multiple departmentId params
  const departmentIds = params.departmentId 
    ? (Array.isArray(params.departmentId) ? params.departmentId : [params.departmentId])
    : undefined;
  
  const [risks, stats, projects, users] = await Promise.all([
    getRisks(departmentIds),
    getRiskStats(departmentIds),
    prisma.aIProject.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    prisma.user.findMany({
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight cyberpunk:text-white cyberpunk:drop-shadow-[0_0_10px_rgba(0,255,65,0.5)]">
            Risk Management
          </h1>
          <p className="text-muted-foreground cyberpunk:text-[#00FF41]/70">
            Identify, assess, and mitigate risks across AI projects
          </p>
        </div>
        <NewRiskDialog projects={projects} users={users} />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground cyberpunk:text-[#00FF41]/70">
              Total Risks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold cyberpunk:text-white cyberpunk:drop-shadow-[0_0_8px_rgba(0,255,65,0.5)]">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground cyberpunk:text-[#00FF41]/70">
              Open Risks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 cyberpunk:text-orange-400 cyberpunk:drop-shadow-[0_0_8px_rgba(255,165,0,0.5)]">{stats.openRisks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground cyberpunk:text-[#00FF41]/70">
              Critical Risks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 cyberpunk:text-red-400 cyberpunk:drop-shadow-[0_0_8px_rgba(255,0,64,0.5)]">{stats.criticalRisks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground cyberpunk:text-[#00FF41]/70">
              Mitigated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 cyberpunk:text-[#00FF41] cyberpunk:drop-shadow-[0_0_8px_rgba(0,255,65,0.5)]">{stats.mitigated}</div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Matrix</CardTitle>
          <CardDescription>Risks plotted by severity and likelihood</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-2">
            {/* Headers */}
            <div></div>
            <div className="text-center text-xs font-medium text-muted-foreground">1</div>
            <div className="text-center text-xs font-medium text-muted-foreground">2</div>
            <div className="text-center text-xs font-medium text-muted-foreground">3</div>
            <div className="text-center text-xs font-medium text-muted-foreground">4</div>
            <div className="text-center text-xs font-medium text-muted-foreground">5</div>

            {/* Critical Row */}
            <div className="flex items-center text-xs font-medium text-muted-foreground">CRITICAL</div>
            {[1, 2, 3, 4, 5].map(likelihood => {
              const count = risks.filter(r => r.severity === 'CRITICAL' && r.likelihood === likelihood).length;
              return (
                <div key={`critical-${likelihood}`} className="h-16 rounded border flex items-center justify-center bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30 cyberpunk:bg-red-900/30 cyberpunk:border-red-800/50">
                  <span className="text-sm font-bold text-red-600 dark:text-red-400 cyberpunk:text-red-400 cyberpunk:drop-shadow-[0_0_8px_rgba(255,0,64,0.5)]">{count || ''}</span>
                </div>
              );
            })}

            {/* High Row */}
            <div className="flex items-center text-xs font-medium text-muted-foreground">HIGH</div>
            {[1, 2, 3, 4, 5].map(likelihood => {
              const count = risks.filter(r => r.severity === 'HIGH' && r.likelihood === likelihood).length;
              return (
                <div key={`high-${likelihood}`} className="h-16 rounded border flex items-center justify-center bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800/30 cyberpunk:bg-orange-900/30 cyberpunk:border-orange-800/50">
                  <span className="text-sm font-bold text-orange-600 dark:text-orange-400 cyberpunk:text-orange-400">{count || ''}</span>
                </div>
              );
            })}

            {/* Medium Row */}
            <div className="flex items-center text-xs font-medium text-muted-foreground">MEDIUM</div>
            {[1, 2, 3, 4, 5].map(likelihood => {
              const count = risks.filter(r => r.severity === 'MEDIUM' && r.likelihood === likelihood).length;
              return (
                <div key={`medium-${likelihood}`} className="h-16 rounded border flex items-center justify-center bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800/30 cyberpunk:bg-yellow-900/30 cyberpunk:border-yellow-800/50">
                  <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400 cyberpunk:text-yellow-400">{count || ''}</span>
                </div>
              );
            })}

            {/* Low Row */}
            <div className="flex items-center text-xs font-medium text-muted-foreground">LOW</div>
            {[1, 2, 3, 4, 5].map(likelihood => {
              const count = risks.filter(r => r.severity === 'LOW' && r.likelihood === likelihood).length;
              return (
                <div key={`low-${likelihood}`} className="h-16 rounded border flex items-center justify-center bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/30 cyberpunk:bg-green-900/30 cyberpunk:border-green-800/50">
                  <span className="text-sm font-bold text-green-600 dark:text-green-400 cyberpunk:text-[#00FF41]">{count || ''}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-center text-xs text-muted-foreground cyberpunk:text-[#00FF41]/70">
            Likelihood (1 = Very Unlikely, 5 = Very Likely) →
          </div>
        </CardContent>
      </Card>

      {/* Risks List */}
      {risks.length > 0 ? (
        <RisksList 
          risks={risks} 
          projects={projects} 
          users={users} 
        />
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4 cyberpunk:text-[#00FF41]/70" />
            <h3 className="text-lg font-semibold mb-2 cyberpunk:text-white">No Risks Identified</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-4 cyberpunk:text-[#00FF41]/70">
              Start tracking potential risks by adding risk assessments for your AI projects.
            </p>
            <NewRiskDialog 
              projects={projects} 
              users={users}
              triggerButton={
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Risk
                </Button>
              }
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

