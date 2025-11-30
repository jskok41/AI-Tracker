import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCard } from '@/components/dashboard/metric-card';
import { AreaChartComponent } from '@/components/dashboard/area-chart';
import { Badge } from '@/components/ui/badge';
import { formatNumber, formatPercentage } from '@/lib/utils';
import { Bot, TrendingUp, Target, Zap, AlertCircle } from 'lucide-react';
import prisma from '@/lib/db';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

async function getAgentData() {
  // Get all agents from the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const agentPerformance = await prisma.agentPerformance.findMany({
    where: {
      measurementTimestamp: {
        gte: thirtyDaysAgo,
      },
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          status: true,
        },
      },
    },
    orderBy: {
      measurementTimestamp: 'desc',
    },
  });

  // Group by agent name
  const agentMap = new Map<string, any[]>();
  agentPerformance.forEach(perf => {
    if (!agentMap.has(perf.agentName)) {
      agentMap.set(perf.agentName, []);
    }
    agentMap.get(perf.agentName)!.push(perf);
  });

  // Calculate agent metrics
  const agents = Array.from(agentMap.entries()).map(([name, performances]) => {
    const avgSuccessRate = performances.reduce((sum, p) => sum + (p.successRate || 0), 0) / performances.length;
    const avgAutonomyScore = performances.reduce((sum, p) => sum + (p.autonomyScore || 0), 0) / performances.length;
    const avgAccuracyScore = performances.reduce((sum, p) => sum + (p.accuracyScore || 0), 0) / performances.length;
    const avgUserSatisfaction = performances.reduce((sum, p) => sum + (p.userSatisfactionScore || 0), 0) / performances.length;
    const totalTasksCompleted = performances.reduce((sum, p) => sum + (p.tasksCompleted || 0), 0);
    const latestPerformance = performances[0];

    return {
      name,
      project: latestPerformance.project,
      avgSuccessRate,
      avgAutonomyScore,
      avgAccuracyScore,
      avgUserSatisfaction,
      totalTasksCompleted,
      performances: performances.slice(0, 15), // Last 15 data points for chart
    };
  });

  // Calculate overall metrics
  const overallAvgSuccessRate = agents.length > 0
    ? agents.reduce((sum, a) => sum + a.avgSuccessRate, 0) / agents.length
    : 0;

  const overallTotalTasks = agents.reduce((sum, a) => sum + a.totalTasksCompleted, 0);

  const overallAvgAutonomy = agents.length > 0
    ? agents.reduce((sum, a) => sum + a.avgAutonomyScore, 0) / agents.length
    : 0;

  const overallAvgAccuracy = agents.length > 0
    ? agents.reduce((sum, a) => sum + a.avgAccuracyScore, 0) / agents.length
    : 0;

  return {
    agents,
    overallAvgSuccessRate,
    overallTotalTasks,
    overallAvgAutonomy,
    overallAvgAccuracy,
  };
}

export default async function AgentsPage() {
  const data = await getAgentData();

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Agents Performance</h1>
        <p className="text-muted-foreground">
          Monitor and analyze AI agent performance metrics
        </p>
      </div>

      {/* Overall Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Average Success Rate"
          value={data.overallAvgSuccessRate}
          format="percentage"
          icon={<Target className="h-4 w-4 text-muted-foreground" />}
          trend="up"
          change={3.5}
          changeLabel="vs last month"
        />
        <MetricCard
          title="Total Tasks Completed"
          value={data.overallTotalTasks}
          icon={<Zap className="h-4 w-4 text-muted-foreground" />}
          trend="up"
          change={12.3}
          changeLabel="vs last month"
        />
        <MetricCard
          title="Average Autonomy"
          value={data.overallAvgAutonomy}
          format="percentage"
          icon={<Bot className="h-4 w-4 text-muted-foreground" />}
          trend="up"
          change={8.1}
          changeLabel="vs last month"
        />
        <MetricCard
          title="Average Accuracy"
          value={data.overallAvgAccuracy}
          format="percentage"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          trend="up"
          change={2.4}
          changeLabel="vs last month"
        />
      </div>

      {/* Agent Cards */}
      {data.agents.length > 0 ? (
        <div className="grid gap-6">
          {data.agents.map((agent) => {
            // Prepare chart data
            const chartData = agent.performances
              .reverse()
              .map(p => ({
                date: format(new Date(p.measurementTimestamp), 'MMM dd'),
                value: p.successRate || 0,
              }));

            return (
              <Card key={agent.name}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <Bot className="h-5 w-5" />
                        {agent.name}
                      </CardTitle>
                      <CardDescription>
                        Project: {agent.project.name}
                      </CardDescription>
                    </div>
                    <Badge>{agent.project.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Agent Metrics Grid */}
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Success Rate</p>
                      <p className="text-2xl font-bold">{formatPercentage(agent.avgSuccessRate)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Autonomy Score</p>
                      <p className="text-2xl font-bold">{formatPercentage(agent.avgAutonomyScore)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Accuracy Score</p>
                      <p className="text-2xl font-bold">{formatPercentage(agent.avgAccuracyScore)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">User Satisfaction</p>
                      <p className="text-2xl font-bold">{agent.avgUserSatisfaction.toFixed(1)}/5</p>
                    </div>
                  </div>

                  {/* Performance Chart */}
                  {chartData.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-3">Success Rate Trend (Last 15 measurements)</h4>
                      <div className="h-48">
                        <AreaChartComponent
                          title=""
                          data={chartData}
                          dataKey="value"
                          xAxisKey="date"
                          height={150}
                        />
                      </div>
                    </div>
                  )}

                  {/* Task Statistics */}
                  <div className="grid gap-4 md:grid-cols-3 border-t pt-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Total Tasks</p>
                      <p className="text-lg font-semibold">{formatNumber(agent.totalTasksCompleted)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Avg Completion Time</p>
                      <p className="text-lg font-semibold">
                        {agent.performances[0]?.averageCompletionTime || 'N/A'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Error Rate</p>
                      <p className="text-lg font-semibold">
                        {formatPercentage(agent.performances[0]?.errorRate || 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Agent Data Found</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Start tracking AI agent performance by adding agent performance data through the API.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

