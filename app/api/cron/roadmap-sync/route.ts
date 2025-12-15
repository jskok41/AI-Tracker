import { NextRequest, NextResponse } from 'next/server';
import { runDailyRoadmapSync } from '@/lib/jobs/roadmap-sync-job';

/**
 * Cron endpoint for daily roadmap sync
 * Configure in Vercel: https://vercel.com/docs/cron-jobs
 * 
 * Example vercel.json configuration:
 * {
 *   "crons": [{
 *     "path": "/api/cron/roadmap-sync",
 *     "schedule": "0 0 * * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  // Verify cron secret (optional but recommended)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const result = await runDailyRoadmapSync();

    return NextResponse.json({
      success: true,
      message: 'Daily roadmap sync completed',
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
