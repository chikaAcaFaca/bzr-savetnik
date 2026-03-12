import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Vercel Cron Job: Ping backend health endpoint to prevent Render free tier sleep.
 * Skips 1:00 AM - 6:00 AM Serbian time (Europe/Belgrade).
 * Schedule: every 10 min (vercel.json crons).
 * Also callable manually: GET /api/cron/keepalive
 */
export async function GET() {
  // Check if we're in quiet hours (1:00 AM - 5:59 AM Belgrade time)
  const now = new Date();
  const belgradeHour = parseInt(
    now.toLocaleString('en-US', { timeZone: 'Europe/Belgrade', hour: 'numeric', hour12: false })
  );

  if (belgradeHour >= 1 && belgradeHour < 6) {
    return NextResponse.json({
      status: 'skipped',
      reason: 'quiet_hours',
      belgradeHour,
      message: 'Backend sleeps 1:00-6:00 AM Belgrade time',
    });
  }

  // Ping backend
  try {
    const start = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const elapsed = Date.now() - start;
    const data = await res.json().catch(() => null);

    return NextResponse.json({
      status: 'ok',
      backendStatus: res.status,
      responseTime: `${elapsed}ms`,
      belgradeHour,
      backend: data,
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      belgradeHour,
      message: 'Backend may be waking up - next ping will retry',
    });
  }
}
