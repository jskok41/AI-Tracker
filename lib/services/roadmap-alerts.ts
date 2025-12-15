import prisma from '@/lib/db';
import { AlertSeverity } from '@prisma/client';

/**
 * Create delay alert when phase becomes delayed
 */
export async function createDelayAlert(
  phaseId: string,
  projectId: string,
  delayReason?: string
): Promise<void> {
  const phase = await prisma.phase.findUnique({
    where: { id: phaseId },
    include: {
      project: true,
    },
  });

  if (!phase) {
    return;
  }

  // Check if alert already exists for this phase delay
  const existingAlert = await prisma.alert.findFirst({
    where: {
      projectId,
      status: 'ACTIVE',
      alertTitle: {
        contains: phase.phaseName,
      },
      alertMessage: {
        contains: 'delayed',
      },
    },
  });

  if (existingAlert) {
    return; // Alert already exists
  }

  const reason = delayReason || 
    (phase.targetEndDate 
      ? `Target end date (${new Date(phase.targetEndDate).toLocaleDateString()}) has passed`
      : 'Phase is behind schedule');

  await prisma.alert.create({
    data: {
      projectId,
      alertTitle: `Phase "${phase.phaseName}" is Delayed`,
      alertMessage: `The phase "${phase.phaseName}" is behind schedule. ${reason}. Current progress: ${phase.progressPercentage ?? 0}%.`,
      severity: 'WARNING',
      metadata: JSON.stringify({
        phaseId,
        phaseName: phase.phaseName,
        delayReason: reason,
        progressPercentage: phase.progressPercentage,
        targetEndDate: phase.targetEndDate,
      }),
    },
  });
}

/**
 * Create completion alert when phase/milestone completes
 */
export async function createCompletionAlert(
  type: 'phase' | 'milestone',
  id: string,
  projectId: string,
  name: string
): Promise<void> {
  await prisma.alert.create({
    data: {
      projectId,
      alertTitle: `${type === 'phase' ? 'Phase' : 'Milestone'} "${name}" Completed`,
      alertMessage: `The ${type} "${name}" has been completed successfully.`,
      severity: 'INFO',
      metadata: JSON.stringify({
        type,
        id,
        name,
      }),
    },
  });
}

/**
 * Create progress threshold alert when progress reaches key milestones
 */
export async function createProgressThresholdAlert(
  phaseId: string,
  projectId: string,
  progress: number,
  previousProgress: number
): Promise<void> {
  const thresholds = [25, 50, 75, 100];
  const crossedThreshold = thresholds.find(
    threshold => previousProgress < threshold && progress >= threshold
  );

  if (!crossedThreshold) {
    return; // No threshold crossed
  }

  const phase = await prisma.phase.findUnique({
    where: { id: phaseId },
  });

  if (!phase) {
    return;
  }

  await prisma.alert.create({
    data: {
      projectId,
      alertTitle: `Phase "${phase.phaseName}" Reached ${crossedThreshold}% Progress`,
      alertMessage: `The phase "${phase.phaseName}" has reached ${crossedThreshold}% completion.`,
      severity: crossedThreshold === 100 ? 'INFO' : 'INFO',
      metadata: JSON.stringify({
        phaseId,
        phaseName: phase.phaseName,
        progress,
        threshold: crossedThreshold,
      }),
    },
  });
}

/**
 * Check and create alerts for a phase
 */
export async function checkAndCreatePhaseAlerts(
  phaseId: string,
  previousProgress?: number,
  previousStatus?: string
): Promise<void> {
  const phase = await prisma.phase.findUnique({
    where: { id: phaseId },
    include: {
      project: true,
    },
  });

  if (!phase) {
    return;
  }

  const currentProgress = phase.progressPercentage ?? 0;

  // Check for delay
  if (phase.status === 'DELAYED' && previousStatus !== 'DELAYED') {
    await createDelayAlert(phaseId, phase.projectId, phase.delayReason || undefined);
  }

  // Check for completion
  if (phase.status === 'COMPLETED' && previousStatus !== 'COMPLETED') {
    await createCompletionAlert('phase', phaseId, phase.projectId, phase.phaseName);
  }

  // Check for progress thresholds
  if (previousProgress !== undefined && previousProgress !== currentProgress) {
    await createProgressThresholdAlert(phaseId, phase.projectId, currentProgress, previousProgress);
  }
}

/**
 * Check and create alerts for a milestone
 */
export async function checkAndCreateMilestoneAlerts(
  milestoneId: string,
  previousCompleted?: boolean
): Promise<void> {
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: {
      phase: {
        include: {
          project: true,
        },
      },
    },
  });

  if (!milestone) {
    return;
  }

  // Check for completion
  if (milestone.isCompleted && previousCompleted !== true) {
    await createCompletionAlert(
      'milestone',
      milestoneId,
      milestone.phase.projectId,
      milestone.milestoneName
    );
  }
}
