'use client';

import { useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const PING_INTERVAL = 10 * 60 * 1000; // 10 minutes

/**
 * Invisible component that pings the backend health endpoint
 * every 10 minutes to prevent Render free tier from sleeping
 * (Render spins down after 15 min of inactivity).
 */
export function BackendKeepalive() {
  useEffect(() => {
    const ping = () => {
      fetch(`${API_URL}/health`, { method: 'GET', mode: 'no-cors' }).catch(() => {});
    };

    // Ping on mount (page load)
    ping();

    // Then every 10 minutes
    const interval = setInterval(ping, PING_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return null;
}
