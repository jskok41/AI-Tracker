-- AlterTable
ALTER TABLE "Phase" ADD COLUMN "lastAutoCalculatedAt" TIMESTAMP(3),
ADD COLUMN "autoCalculatedProgress" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "delayReason" TEXT;

-- CreateTable
CREATE TABLE "PhaseHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phaseId" TEXT NOT NULL,
    "status" TEXT,
    "progressPercentage" REAL,
    "previousStatus" TEXT,
    "previousProgress" REAL,
    "changeReason" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" TEXT,
    CONSTRAINT "PhaseHistory_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "Phase" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MilestoneHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "milestoneId" TEXT NOT NULL,
    "isCompleted" BOOLEAN,
    "previousCompleted" BOOLEAN,
    "completedDate" TIMESTAMP(3),
    "changeReason" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" TEXT,
    CONSTRAINT "MilestoneHistory_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
