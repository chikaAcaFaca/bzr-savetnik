import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const CRON_SECRET = process.env.CRON_SECRET || 'bzr-compliance-2026';

/**
 * Vercel Cron Job: Weekly regulatory check (Mondays at 6:00 AM UTC / 7:00 AM Belgrade)
 * Scrapes government sources for new BZR regulations and alerts affected companies.
 */
export async function GET() {
  try {
    const start = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55000);

    const res = await fetch(`${BACKEND_URL}/api/cron/regulatory`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${CRON_SECRET}` },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const data = await res.json().catch(() => null);

    return NextResponse.json({
      status: res.ok ? 'ok' : 'error',
      responseTime: `${Date.now() - start}ms`,
      backend: data,
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
