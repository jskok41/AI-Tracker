-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parentDepartmentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Department_parentDepartmentId_fkey" FOREIGN KEY ("parentDepartmentId") REFERENCES "Department" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "departmentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AIProject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PLANNING',
    "departmentId" TEXT,
    "ownerId" TEXT NOT NULL,
    "startDate" DATETIME,
    "targetCompletionDate" DATETIME,
    "actualCompletionDate" DATETIME,
    "budgetAllocated" REAL,
    "budgetSpent" REAL,
    "expectedRoiPercentage" REAL,
    "strategicPriority" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AIProject_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "AIProject_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BaselineMetric" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "metricName" TEXT NOT NULL,
    "metricValue" REAL NOT NULL,
    "metricUnit" TEXT,
    "measurementDate" DATETIME NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BaselineMetric_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "AIProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KPIDefinition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "kpiName" TEXT NOT NULL,
    "metricType" TEXT NOT NULL,
    "description" TEXT,
    "targetValue" REAL,
    "unit" TEXT,
    "calculationFormula" TEXT,
    "dataSource" TEXT,
    "collectionFrequency" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "KPIDefinition_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "AIProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MetricTimeseries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "time" DATETIME NOT NULL,
    "projectId" TEXT NOT NULL,
    "kpiId" TEXT NOT NULL,
    "metricValue" REAL NOT NULL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MetricTimeseries_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "AIProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MetricTimeseries_kpiId_fkey" FOREIGN KEY ("kpiId") REFERENCES "KPIDefinition" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserFeedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER,
    "sentiment" TEXT,
    "feedbackText" TEXT,
    "category" TEXT,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserFeedback_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "AIProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ROICalculation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "calculationDate" DATETIME NOT NULL,
    "implementationCost" REAL,
    "operationalCost" REAL,
    "maintenanceCost" REAL,
    "costSavings" REAL,
    "revenueIncrease" REAL,
    "productivityGainsValue" REAL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ROICalculation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "AIProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AgentPerformance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "agentName" TEXT NOT NULL,
    "measurementTimestamp" DATETIME NOT NULL,
    "tasksAssigned" INTEGER,
    "tasksCompleted" INTEGER,
    "tasksFailed" INTEGER,
    "successRate" REAL,
    "averageCompletionTime" TEXT,
    "errorRate" REAL,
    "autonomyScore" REAL,
    "accuracyScore" REAL,
    "userSatisfactionScore" REAL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AgentPerformance_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "AIProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PromptLibrary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT,
    "promptTitle" TEXT NOT NULL,
    "promptText" TEXT NOT NULL,
    "category" TEXT,
    "tags" TEXT,
    "authorId" TEXT NOT NULL,
    "useCase" TEXT,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "averageRating" REAL,
    "lastUsedAt" DATETIME,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PromptLibrary_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "AIProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PromptLibrary_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PromptUsageLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "promptId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "usedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rating" INTEGER,
    "feedback" TEXT,
    "executionTimeMs" INTEGER,
    CONSTRAINT "PromptUsageLog_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "PromptLibrary" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RiskAssessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "riskTitle" TEXT NOT NULL,
    "riskDescription" TEXT,
    "category" TEXT,
    "severity" TEXT NOT NULL,
    "likelihood" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "mitigationPlan" TEXT,
    "ownerId" TEXT NOT NULL,
    "identifiedDate" DATETIME NOT NULL,
    "reviewDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RiskAssessment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "AIProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RiskAssessment_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ComplianceCheck" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "complianceFramework" TEXT NOT NULL,
    "requirementName" TEXT NOT NULL,
    "isCompliant" BOOLEAN,
    "lastCheckedAt" DATETIME,
    "evidenceUrl" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ComplianceCheck_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "AIProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT,
    "alertTitle" TEXT NOT NULL,
    "alertMessage" TEXT,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "triggeredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledgedAt" DATETIME,
    "resolvedAt" DATETIME,
    "acknowledgedBy" TEXT,
    "metadata" TEXT,
    CONSTRAINT "Alert_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "AIProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Alert_acknowledgedBy_fkey" FOREIGN KEY ("acknowledgedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Phase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "phaseName" TEXT NOT NULL,
    "description" TEXT,
    "phaseOrder" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "startDate" DATETIME,
    "endDate" DATETIME,
    "targetEndDate" DATETIME,
    "progressPercentage" REAL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Phase_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "AIProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Milestone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phaseId" TEXT NOT NULL,
    "milestoneName" TEXT NOT NULL,
    "description" TEXT,
    "targetDate" DATETIME,
    "completedDate" DATETIME,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "deliverables" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Milestone_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "Phase" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PhaseDependency" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dependentPhaseId" TEXT NOT NULL,
    "requiredPhaseId" TEXT NOT NULL,
    "dependencyType" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PhaseDependency_dependentPhaseId_fkey" FOREIGN KEY ("dependentPhaseId") REFERENCES "Phase" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PhaseDependency_requiredPhaseId_fkey" FOREIGN KEY ("requiredPhaseId") REFERENCES "Phase" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "MetricTimeseries_projectId_time_idx" ON "MetricTimeseries"("projectId", "time");

-- CreateIndex
CREATE INDEX "MetricTimeseries_kpiId_time_idx" ON "MetricTimeseries"("kpiId", "time");

-- CreateIndex
CREATE INDEX "AgentPerformance_projectId_measurementTimestamp_idx" ON "AgentPerformance"("projectId", "measurementTimestamp");

-- CreateIndex
CREATE UNIQUE INDEX "PhaseDependency_dependentPhaseId_requiredPhaseId_key" ON "PhaseDependency"("dependentPhaseId", "requiredPhaseId");
