import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import { getIdToken } from './firebase';

// TODO: Import AppRouter from backend once backend types are clean
// import type { AppRouter } from '@backend/api/trpc/router';

// Minimal placeholder router type for standalone builds.
// tRPC requires a router type without colliding procedure names.
// This will be replaced with the real AppRouter type.
interface AppRouter {
  _def: { _config: { $types: Record<string, unknown> } };
}

// @ts-expect-error -- AppRouter placeholder until backend integration
export const trpc = createTRPCReact<AppRouter>();

let cachedToken: string | null = null;

export function setCachedToken(token: string | null) {
  cachedToken = token;
}

export function createTRPCClient() {
  return trpc.createClient({
    transformer: superjson,
    links: [
      httpBatchLink({
        url: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/trpc`,
        headers() {
          if (cachedToken) {
            return { Authorization: `Bearer ${cachedToken}` };
          }
          return {};
        },
      }),
    ],
  });
}

// Pre-fetch token for tRPC headers (call this on auth state change)
export async function refreshCachedToken() {
  const token = await getIdToken();
  setCachedToken(token);
  return token;
}
