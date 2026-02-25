/**
 * Dynamic Sitemap Route
 *
 * Generates paginated sitemaps for 750k+ company profiles.
 * Each sitemap contains up to 50,000 URLs (Google's limit).
 * URLs: /sitemap/0, /sitemap/1, etc.
 */

import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const BASE_URL = 'https://bzr-savetnik.com';
const URLS_PER_SITEMAP = 50000;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const pageIndex = parseInt(id, 10);

  if (isNaN(pageIndex) || pageIndex < 0) {
    return new NextResponse('Invalid sitemap index', { status: 400 });
  }

  try {
    // Fetch company maticni broji for this page
    const response = await fetch(
      `${API_URL}/trpc/companyDirectory.list?input=${encodeURIComponent(
        JSON.stringify({
          page: pageIndex + 1,
          pageSize: URLS_PER_SITEMAP,
        })
      )}`,
      { next: { revalidate: 86400 } }
    );

    if (!response.ok) {
      return new NextResponse('Failed to fetch companies', { status: 500 });
    }

    const data = await response.json();
    const items = data?.result?.data?.items ?? [];

    const urls = items.map((item: any) => `
  <url>
    <loc>${BASE_URL}/firma/${item.maticniBroj}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>`).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
