import { 
  AIProject, 
  ProjectCategory, 
  ProjectStatus, 
  MetricType,
  KPIDefinition,
  MetricTimeseries,
  ROICalculation,
  RiskAssessment,
  RiskSeverity,
  RiskStatus,
  AgentPerformance,
  PromptLibrary,
  UserFeedback,
  FeedbackSentiment,
  Alert,
  AlertSeverity,
  AlertStatus,
  Phase,
  PhaseStatus,
  Milestone,
  ComplianceCheck,
  Department,
  User
} from '@prisma/client';

// ============================================================================
// PROJECT TYPES
// ============================================================================

export type {
  AIProject,
  ProjectCategory,
  ProjectStatus,
  Department,
  User
};

export interface ProjectWithRelations extends AIProject {
  department?: Department | null;
  owner: User;
  _count?: {
    kpiDefinitions: number;
    riskAssessments: number;
    alerts: number;
  };
}

export interface ProjectSummary {
  id: string;
  name: string;
  category: ProjectCategory;
  status: ProjectStatus;
  departmentName?: string;
  ownerName: string;
  budgetAllocated?: number;
  budgetSpent?: number;
  latestROI?: number;
  averageRating?: number;
  activeKPIs: number;
  openRisks: number;
}

// ============================================================================
// METRICS TYPES
// ============================================================================

export type {
  MetricType,
  KPIDefinition,
  MetricTimeseries
};

export interface KPIWithMetrics extends KPIDefinition {
  latestValue?: number;
  trend?: 'up' | 'down' | 'neutral';
  changePercentage?: number;
}

export interface MetricDataPoint {
  time: Date | string;
  value: number;
  metadata?: Record<string, any>;
}

export interface TimeSeriesData {
  kpiId: string;
  kpiName: string;
  unit?: string;
  dataPoints: MetricDataPoint[];
}

// ============================================================================
// ROI TYPES
// ============================================================================

export type { ROICalculation };

export interface ROICalculationWithComputed extends Omit<ROICalculation, 'id' | 'createdAt'> {
  id: string;
  totalCost: number;
  totalBenefits: number;
  roiPercentage: number;
  createdAt: Date | string;
}

export interface ROISummary {
  projectId: string;
  projectName: string;
  latestROI: number;
  totalCostSavings: number;
  totalRevenueIncrease: number;
  trend: 'improving' | 'declining' | 'stable';
}

// ============================================================================
// RISK TYPES
// ============================================================================

export type {
  RiskAssessment,
  RiskSeverity,
  RiskStatus
};

export interface RiskWithOwner extends RiskAssessment {
  owner: User;
  riskScore: number;
}

export interface RiskMatrix {
  severity: RiskSeverity;
  likelihood: number;
  count: number;
  risks: RiskWithOwner[];
}

export interface RiskSummary {
  totalRisks: number;
  openRisks: number;
  criticalRisks: number;
  mitigatedRisks: number;
  averageRiskScore: number;
}

// ============================================================================
// AGENT PERFORMANCE TYPES
// ============================================================================

export type { AgentPerformance };

export interface AgentMetrics {
  agentName: string;
  averageSuccessRate: number;
  totalTasksCompleted: number;
  averageAutonomyScore: number;
  averageAccuracyScore: number;
  averageUserSatisfaction: number;
  trend: 'improving' | 'declining' | 'stable';
}

export interface AgentPerformanceTimeSeries {
  timestamp: Date | string;
  successRate: number;
  tasksCompleted: number;
  errorRate: number;
  autonomyScore: number;
}

// ============================================================================
// PROMPT LIBRARY TYPES
// ============================================================================

export type { PromptLibrary };

export interface PromptWithAuthor extends PromptLibrary {
  author: User;
  tagsArray?: string[];
}

export interface PromptMetrics {
  totalPrompts: number;
  totalUsage: number;
  averageRating: number;
  topCategories: { category: string; count: number }[];
}

// ============================================================================
// FEEDBACK TYPES
// ============================================================================

export type {
  UserFeedback,
  FeedbackSentiment
};

export interface FeedbackWithUser extends UserFeedback {
  user: User;
}

export interface FeedbackSummary {
  averageRating: number;
  totalFeedback: number;
  sentimentDistribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  recentFeedback: FeedbackWithUser[];
}

// ============================================================================
// ALERT TYPES
// ============================================================================

export type {
  Alert,
  AlertSeverity,
  AlertStatus
};

export interface AlertWithProject extends Alert {
  project?: AIProject | null;
  acknowledgedByUser?: User | null;
}

export interface AlertSummary {
  totalActive: number;
  criticalCount: number;
  warningCount: number;
  recentAlerts: AlertWithProject[];
}

// ============================================================================
// ROADMAP TYPES
// ============================================================================

export type {
  Phase,
  PhaseStatus,
  Milestone
};

export interface PhaseWithMilestones extends Phase {
  milestones: Milestone[];
  dependencies?: Phase[];
}

export interface RoadmapView {
  projectId: string;
  projectName: string;
  phases: PhaseWithMilestones[];
  overallProgress: number;
  currentPhase?: PhaseWithMilestones;
}

export interface MilestoneWithProgress extends Milestone {
  phaseName: string;
  daysUntilDue?: number;
  isOverdue: boolean;
}

// ============================================================================
// COMPLIANCE TYPES
// ============================================================================

export type { ComplianceCheck };

export interface ComplianceSummary {
  framework: string;
  totalChecks: number;
  compliantCount: number;
  nonCompliantCount: number;
  compliancePercentage: number;
}

// ============================================================================
// DASHBOARD TYPES
// ============================================================================

export interface DashboardSummary {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  averageROI: number;
  totalCostSavings: number;
  averageUserSatisfaction: number;
  criticalRisks: number;
  activeAlerts: number;
  projectsByStatus: Record<ProjectStatus, number>;
  projectsByCategory: Record<ProjectCategory, number>;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'project' | 'milestone' | 'risk' | 'alert' | 'feedback';
  title: string;
  description?: string;
  timestamp: Date | string;
  severity?: AlertSeverity | RiskSeverity;
  projectId?: string;
  projectName?: string;
}

// ============================================================================
// CHART DATA TYPES
// ============================================================================

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
  [key: string]: any;
}

export interface MultiSeriesChartData {
  date: string;
  [key: string]: string | number;
}

export interface PieChartData {
  name: string;
  value: number;
  color?: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  error: string;
  message?: string;
  statusCode: number;
}

// ============================================================================
// FILTER & QUERY TYPES
// ============================================================================

export interface ProjectFilters {
  status?: ProjectStatus | ProjectStatus[];
  category?: ProjectCategory | ProjectCategory[];
  departmentId?: string;
  ownerId?: string;
  search?: string;
}

export interface DateRangeFilter {
  startDate?: Date | string;
  endDate?: Date | string;
}

export interface MetricsQueryParams extends DateRangeFilter {
  projectId: string;
  kpiId?: string;
  interval?: 'hour' | 'day' | 'week' | 'month';
  aggregation?: 'avg' | 'sum' | 'min' | 'max';
}

export interface RiskFilters {
  status?: RiskStatus | RiskStatus[];
  severity?: RiskSeverity | RiskSeverity[];
  category?: string;
  projectId?: string;
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface ProjectFormData {
  name: string;
  description?: string;
  category: ProjectCategory;
  status: ProjectStatus;
  departmentId?: string;
  ownerId: string;
  startDate?: Date | string;
  targetCompletionDate?: Date | string;
  budgetAllocated?: number;
  expectedRoiPercentage?: number;
  strategicPriority?: number;
}

export interface KPIFormData {
  projectId: string;
  kpiName: string;
  metricType: MetricType;
  description?: string;
  targetValue?: number;
  unit?: string;
  calculationFormula?: string;
  dataSource?: string;
  collectionFrequency?: string;
}

export interface RiskFormData {
  projectId: string;
  riskTitle: string;
  riskDescription?: string;
  category?: string;
  severity: RiskSeverity;
  likelihood: number;
  mitigationPlan?: string;
  ownerId: string;
  identifiedDate: Date | string;
}

export interface ROIFormData {
  projectId: string;
  calculationDate: Date | string;
  implementationCost?: number;
  operationalCost?: number;
  maintenanceCost?: number;
  costSavings?: number;
  revenueIncrease?: number;
  productivityGainsValue?: number;
  notes?: string;
}

export interface PromptFormData {
  projectId?: string;
  promptTitle: string;
  promptText: string;
  category?: string;
  tags?: string[];
  useCase?: string;
  authorId: string;
}

export interface PhaseFormData {
  projectId: string;
  phaseName: string;
  description?: string;
  phaseOrder: number;
  startDate?: Date | string;
  targetEndDate?: Date | string;
}

export interface MilestoneFormData {
  phaseId: string;
  milestoneName: string;
  description?: string;
  targetDate?: Date | string;
  deliverables?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: string;
  direction: SortDirection;
}

export type TrendDirection = 'up' | 'down' | 'neutral';

export interface TrendData {
  current: number;
  previous: number;
  changePercentage: number;
  direction: TrendDirection;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  PLANNING: 'Planning',
  PILOT: 'Pilot',
  SCALING: 'Scaling',
  PRODUCTION: 'Production',
  PAUSED: 'Paused',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const PROJECT_CATEGORY_LABELS: Record<ProjectCategory, string> = {
  AI_INITIATIVE: 'AI Initiative',
  AI_AGENT: 'AI Agent',
  PROMPT_LIBRARY: 'Prompt Library',
  GEN_AI_PRODUCTION: 'Gen AI Production',
  RISK_MANAGEMENT: 'Risk Management',
  OTHER: 'Other',
};

export const METRIC_TYPE_LABELS: Record<MetricType, string> = {
  OPERATIONAL_EFFICIENCY: 'Operational Efficiency',
  FINANCIAL_PERFORMANCE: 'Financial Performance',
  CUSTOMER_SATISFACTION: 'Customer Satisfaction',
  EMPLOYEE_PRODUCTIVITY: 'Employee Productivity',
  QUALITY_IMPROVEMENT: 'Quality Improvement',
  RISK_COMPLIANCE: 'Risk & Compliance',
  ADOPTION_ENGAGEMENT: 'Adoption & Engagement',
  INNOVATION_VELOCITY: 'Innovation Velocity',
};

export const RISK_SEVERITY_LABELS: Record<RiskSeverity, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

export const PHASE_STATUS_LABELS: Record<PhaseStatus, string> = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  DELAYED: 'Delayed',
};

