import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const CRON_SECRET = process.env.CRON_SECRET || 'bzr-compliance-2026';

/**
 * Vercel Cron Job: Daily compliance check at 7:00 AM UTC (8:00 AM Belgrade)
 * Triggers the backend compliance tracker agent to:
 * 1. Scan all companies for upcoming obligations
 * 2. Send deadline notifications (30/7/1/0 days)
 * 3. Send weekly digest on Mondays
 */
export async function GET() {
  try {
    const start = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55000); // 55s (Vercel limit is 60s)

    const res = await fetch(`${BACKEND_URL}/api/cron/compliance`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${CRON_SECRET}` },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const data = await res.json().catch(() => null);
    const elapsed = Date.now() - start;

    return NextResponse.json({
      status: res.ok ? 'ok' : 'error',
      responseTime: `${elapsed}ms`,
      backend: data,
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
