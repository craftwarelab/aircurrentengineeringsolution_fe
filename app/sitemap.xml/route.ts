import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BASE_URL = 'https://www.aircurrentengineeringsolution.com';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || '';

const fetchHeaders: HeadersInit = INTERNAL_API_KEY
  ? { 'X-Internal-Api': INTERNAL_API_KEY }
  : {};

async function fetchSlugs(endpoint: string): Promise<string[]> {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      cache: 'no-store',
      ...(INTERNAL_API_KEY && { headers: fetchHeaders }),
    });
    if (!res.ok) return [];
    const json = await res.json();
    const items: { slug?: string; status?: string }[] = Array.isArray(json)
      ? json
      : Array.isArray(json.data)
      ? json.data
      : [];
    return items.map((i) => i.slug).filter(Boolean) as string[];
  } catch {
    return [];
  }
}

function url(loc: string, changefreq: string, priority: string, lastmod?: string): string {
  return `
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod ?? new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

export async function GET() {
  const [productSlugs, serviceSlugs] = await Promise.all([
    fetchSlugs('/products?status=active&per_page=500'),
    fetchSlugs('/services?status=active&per_page=500'),
  ]);

  const today = new Date().toISOString().split('T')[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${url(`${BASE_URL}/`,                 'weekly',  '1.0', today)}
  ${url(`${BASE_URL}/about`,            'monthly', '0.8', today)}
  ${url(`${BASE_URL}/services`,         'weekly',  '0.9', today)}
  ${url(`${BASE_URL}/products`,         'weekly',  '0.9', today)}
  ${url(`${BASE_URL}/projects`,         'weekly',  '0.8', today)}
  ${url(`${BASE_URL}/customers`,        'monthly', '0.7', today)}
  ${url(`${BASE_URL}/faqs`,             'monthly', '0.7', today)}
  ${url(`${BASE_URL}/contact`,          'monthly', '0.8', today)}
  ${url(`${BASE_URL}/inquiries`,        'monthly', '0.8', today)}
  ${url(`${BASE_URL}/privacy-policy`,   'yearly',  '0.3', today)}
  ${url(`${BASE_URL}/terms-of-service`, 'yearly',  '0.3', today)}
${productSlugs.map((slug) => url(`${BASE_URL}/products/${slug}`, 'weekly', '0.8', today)).join('')}
${serviceSlugs.map((slug) => url(`${BASE_URL}/services/${slug}`, 'weekly', '0.8', today)).join('')}
</urlset>`;

  return new NextResponse(xml.trim(), {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
