import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const CRON_SECRET = process.env.CRON_SECRET;

/**
 * Vercel Cron Job: Ping backend health endpoint to prevent Render free tier sleep.
 * Runs every 10 minutes, but skips 1:00 AM - 5:50 AM Serbian time (Europe/Belgrade).
 *
 * Schedule configured in vercel.json: "crons" field.
 * Secured with CRON_SECRET to prevent unauthorized calls.
 */
export async function GET(request: Request) {
  // Verify cron secret (Vercel sets this automatically for cron jobs)
  if (CRON_SECRET) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // Check if we're in quiet hours (1:00 AM - 5:50 AM Belgrade time)
  const now = new Date();
  const belgradeTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Belgrade' }));
  const hour = belgradeTime.getHours();
  const minute = belgradeTime.getMinutes();

  if (hour >= 1 && (hour < 5 || (hour === 5 && minute < 50))) {
    return NextResponse.json({
      status: 'skipped',
      reason: 'quiet_hours',
      belgradeTime: belgradeTime.toISOString(),
      message: 'Backend allowed to sleep between 1:00-6:00 AM Belgrade time',
    });
  }

  // Ping backend
  try {
    const start = Date.now();
    const res = await fetch(`${API_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(15000), // 15s timeout
    });
    const elapsed = Date.now() - start;
    const data = await res.json().catch(() => null);

    return NextResponse.json({
      status: 'ok',
      backendStatus: res.status,
      responseTime: `${elapsed}ms`,
      belgradeTime: belgradeTime.toISOString(),
      backend: data,
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      belgradeTime: belgradeTime.toISOString(),
      message: 'Backend may be waking up - next ping will retry',
    });
  }
}
