import prisma from '@/lib/db';
import { PhaseStatus } from '@prisma/client';

/**
 * Calculate phase progress based on completed milestones
 * Formula: (completedMilestones / totalMilestones) * 100
 */
export async function calculatePhaseProgress(phaseId: string): Promise<number> {
  const phase = await prisma.phase.findUnique({
    where: { id: phaseId },
    include: {
      milestones: true,
    },
  });

  if (!phase) {
    throw new Error(`Phase ${phaseId} not found`);
  }

  const totalMilestones = phase.milestones.length;
  
  if (totalMilestones === 0) {
    return 0;
  }

  const completedMilestones = phase.milestones.filter(m => m.isCompleted).length;
  const progress = (completedMilestones / totalMilestones) * 100;

  return Math.round(progress * 100) / 100; // Round to 2 decimal places
}

/**
 * Determine phase status based on progress and dates
 */
function determinePhaseStatus(
  progress: number,
  milestones: Array<{ isCompleted: boolean }>,
  startDate: Date | null,
  targetEndDate: Date | null,
  endDate: Date | null,
  currentStatus: PhaseStatus
): PhaseStatus {
  const now = new Date();
  const allMilestonesCompleted = milestones.length > 0 && milestones.every(m => m.isCompleted);

  // Rule 1: All milestones completed = COMPLETED
  if (allMilestonesCompleted) {
    return 'COMPLETED';
  }

  // Rule 2: Progress = 100% = COMPLETED
  if (progress === 100) {
    return 'COMPLETED';
  }

  // Rule 3: Past target date + not completed = DELAYED
  if (targetEndDate && new Date(targetEndDate) < now && currentStatus !== 'COMPLETED') {
    return 'DELAYED';
  }

  // Rule 4: Progress > 0% = IN_PROGRESS
  if (progress > 0) {
    return 'IN_PROGRESS';
  }

  // Rule 5: Has start date and it's in the past = IN_PROGRESS
  if (startDate && new Date(startDate) <= now) {
    return 'IN_PROGRESS';
  }

  // Rule 6: Default = NOT_STARTED
  return 'NOT_STARTED';
}

/**
 * Update phase status based on progress and dates
 */
export async function updatePhaseStatus(phaseId: string): Promise<PhaseStatus> {
  const phase = await prisma.phase.findUnique({
    where: { id: phaseId },
    include: {
      milestones: true,
    },
  });

  if (!phase) {
    throw new Error(`Phase ${phaseId} not found`);
  }

  const progress = await calculatePhaseProgress(phaseId);
  const newStatus = determinePhaseStatus(
    progress,
    phase.milestones,
    phase.startDate,
    phase.targetEndDate,
    phase.endDate,
    phase.status
  );

  // Only update if status changed
  if (newStatus !== phase.status) {
    await prisma.phase.update({
      where: { id: phaseId },
      data: {
        status: newStatus,
        // Set endDate if completing
        ...(newStatus === 'COMPLETED' && !phase.endDate && { endDate: new Date() }),
      },
    });

    // Log to history
    await prisma.phaseHistory.create({
      data: {
        phaseId,
        status: newStatus,
        previousStatus: phase.status,
        changeReason: 'auto_calculated',
      },
    });
  }

  return newStatus;
}

/**
 * Detect if phase is delayed based on target date
 */
export async function detectPhaseDelays(phaseId: string): Promise<boolean> {
  const phase = await prisma.phase.findUnique({
    where: { id: phaseId },
  });

  if (!phase) {
    throw new Error(`Phase ${phaseId} not found`);
  }

  if (!phase.targetEndDate) {
    return false;
  }

  const now = new Date();
  const targetDate = new Date(phase.targetEndDate);

  // Check if target date has passed and phase is not completed
  if (targetDate < now && phase.status !== 'COMPLETED') {
    return true;
  }

  return false;
}

/**
 * Sync project status based on phase completion
 */
export async function syncProjectStatusFromPhases(projectId: string): Promise<void> {
  const project = await prisma.aIProject.findUnique({
    where: { id: projectId },
    include: {
      phases: true,
    },
  });

  if (!project) {
    throw new Error(`Project ${projectId} not found`);
  }

  if (project.phases.length === 0) {
    return; // No phases to sync
  }

  const allPhasesCompleted = project.phases.every(p => p.status === 'COMPLETED');
  const hasInProgressPhases = project.phases.some(p => p.status === 'IN_PROGRESS');

  // Update project status based on phase status
  if (allPhasesCompleted && project.status !== 'COMPLETED') {
    await prisma.aIProject.update({
      where: { id: projectId },
      data: {
        status: 'COMPLETED',
        actualCompletionDate: new Date(),
      },
    });
  } else if (hasInProgressPhases && project.status === 'PLANNING') {
    await prisma.aIProject.update({
      where: { id: projectId },
      data: {
        status: 'PILOT', // Move from PLANNING to PILOT when phases start
      },
    });
  }
}

/**
 * Recalculate and update phase progress and status
 * This is the main function to call when milestones change
 */
export async function recalculatePhase(phaseId: string): Promise<{
  progress: number;
  status: PhaseStatus;
}> {
  // Calculate progress
  const progress = await calculatePhaseProgress(phaseId);

  // Get phase to check previous values
  const phase = await prisma.phase.findUnique({
    where: { id: phaseId },
    include: {
      milestones: true,
    },
  });

  if (!phase) {
    throw new Error(`Phase ${phaseId} not found`);
  }

  const previousProgress = phase.progressPercentage ?? 0;
  const previousStatus = phase.status;

  // Update progress
  await prisma.phase.update({
    where: { id: phaseId },
    data: {
      progressPercentage: progress,
      autoCalculatedProgress: true,
      lastAutoCalculatedAt: new Date(),
    },
  });

  // Log progress change if it changed
  if (Math.abs(progress - previousProgress) > 0.01) {
    await prisma.phaseHistory.create({
      data: {
        phaseId,
        progressPercentage: progress,
        previousProgress,
        changeReason: 'auto_calculated',
      },
    });
  }

  // Update status
  const newStatus = await updatePhaseStatus(phaseId);

  // Get project ID for syncing
  const updatedPhase = await prisma.phase.findUnique({
    where: { id: phaseId },
    select: { projectId: true },
  });

  if (updatedPhase) {
    // Sync project status
    await syncProjectStatusFromPhases(updatedPhase.projectId);
  }

  return {
    progress,
    status: newStatus,
  };
}

/**
 * Recalculate all phases for a project
 */
export async function recalculateProjectPhases(projectId: string): Promise<void> {
  const phases = await prisma.phase.findMany({
    where: { projectId },
    select: { id: true },
  });

  await Promise.all(phases.map(phase => recalculatePhase(phase.id)));
}
