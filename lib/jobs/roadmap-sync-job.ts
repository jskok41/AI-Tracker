import prisma from '@/lib/db';
import { recalculatePhase, detectPhaseDelays, updatePhaseStatus } from '@/lib/services/roadmap-auto-tracker';
import { createDelayAlert } from '@/lib/services/roadmap-alerts';

/**
 * Daily sync job to check for delays and update statuses
 * This should be run via cron job (e.g., daily at midnight)
 */
export async function runDailyRoadmapSync(): Promise<{
  phasesChecked: number;
  delaysDetected: number;
  statusesUpdated: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let phasesChecked = 0;
  let delaysDetected = 0;
  let statusesUpdated = 0;

  try {
    // Get all phases that are not completed
    const phases = await prisma.phase.findMany({
      where: {
        status: {
          not: 'COMPLETED',
        },
      },
      include: {
        project: true,
        milestones: true,
      },
    });

    phasesChecked = phases.length;

    for (const phase of phases) {
      try {
        const previousStatus = phase.status;

        // Check for delays
        const isDelayed = await detectPhaseDelays(phase.id);
        if (isDelayed && phase.status !== 'DELAYED') {
          delaysDetected++;
          
          // Update status to DELAYED
          await prisma.phase.update({
            where: { id: phase.id },
            data: {
              status: 'DELAYED',
              delayReason: phase.targetEndDate
                ? `Target end date (${new Date(phase.targetEndDate).toLocaleDateString()}) has passed`
                : 'Phase is behind schedule',
            },
          });

          // Create delay alert
          await createDelayAlert(phase.id, phase.projectId);

          // Log to history
          await prisma.phaseHistory.create({
            data: {
              phaseId: phase.id,
              status: 'DELAYED',
              previousStatus,
              changeReason: 'auto_delay_detection',
            },
          });

          statusesUpdated++;
        }

        // Recalculate phase status based on current state
        const newStatus = await updatePhaseStatus(phase.id);
        if (newStatus !== previousStatus) {
          statusesUpdated++;
        }

        // Recalculate progress
        await recalculatePhase(phase.id);
      } catch (error) {
        const errorMessage = `Error processing phase ${phase.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMessage);
        console.error(errorMessage, error);
      }
    }
  } catch (error) {
    const errorMessage = `Error in daily roadmap sync: ${error instanceof Error ? error.message : 'Unknown error'}`;
    errors.push(errorMessage);
    console.error(errorMessage, error);
  }

  return {
    phasesChecked,
    delaysDetected,
    statusesUpdated,
    errors,
  };
}

/**
 * Sync a specific project's phases
 */
export async function syncProjectPhases(projectId: string): Promise<void> {
  const phases = await prisma.phase.findMany({
    where: { projectId },
    select: { id: true },
  });

  await Promise.all(
    phases.map(async (phase) => {
      try {
        await recalculatePhase(phase.id);
        await updatePhaseStatus(phase.id);
      } catch (error) {
        console.error(`Error syncing phase ${phase.id}:`, error);
      }
    })
  );
}

/**
 * Sync all projects (for manual trigger or admin use)
 */
export async function syncAllProjects(): Promise<{
  projectsSynced: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let projectsSynced = 0;

  try {
    const projects = await prisma.aIProject.findMany({
      select: { id: true },
    });

    for (const project of projects) {
      try {
        await syncProjectPhases(project.id);
        projectsSynced++;
      } catch (error) {
        const errorMessage = `Error syncing project ${project.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMessage);
        console.error(errorMessage, error);
      }
    }
  } catch (error) {
    const errorMessage = `Error in sync all projects: ${error instanceof Error ? error.message : 'Unknown error'}`;
    errors.push(errorMessage);
    console.error(errorMessage, error);
  }

  return {
    projectsSynced,
    errors,
  };
}
