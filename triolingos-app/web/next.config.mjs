import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Dva ciljna okruženja iz istog koda:
 *  - Vercel (web): pun Next.js server. Dinamičke rute (/test/[id], /lessons/[id])
 *    su 'use client' i čitaju id preko useParams — rade bez generateStaticParams().
 *  - Capacitor (APK): statički export (`output: 'export'`) u `out/`.
 *    Uključi ga sa CAPACITOR_BUILD=1 (vidi `npm run cap:sync`).
 */
const isCapacitor = process.env.CAPACITOR_BUILD === '1';

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(isCapacitor ? { output: 'export' } : {}),
  images: { unoptimized: true },
  // Repo sadrži i roditeljski lockfile (bzr-savetnik); zakuj koren tracinga
  // na ovaj web folder da Next ne bira pogrešan workspace root.
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
