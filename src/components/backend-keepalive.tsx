'use client';

import { useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const PING_INTERVAL = 10 * 60 * 1000; // 10 minutes

/**
 * Invisible component that pings the backend health endpoint
 * every 10 minutes to prevent Render free tier from sleeping.
 * Skips pings between 1:00 AM and 6:00 AM Belgrade time.
 */
function isBelgradeQuietHours(): boolean {
  const now = new Date();
  const belgradeHour = parseInt(
    now.toLocaleString('en-US', { timeZone: 'Europe/Belgrade', hour: 'numeric', hour12: false })
  );
  return belgradeHour >= 1 && belgradeHour < 6;
}

export function BackendKeepalive() {
  useEffect(() => {
    const ping = () => {
      if (isBelgradeQuietHours()) return;
      fetch(`${API_URL}/health`, { method: 'GET', mode: 'no-cors' }).catch(() => {});
    };

    ping();
    const interval = setInterval(ping, PING_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return null;
}
