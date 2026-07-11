import type { MetadataRoute } from 'next';

const BASE_URL = 'https://aircurrentengineeringsolution.com';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || '';

const headers: HeadersInit = INTERNAL_API_KEY
  ? { 'X-Internal-Api': INTERNAL_API_KEY }
  : {};

async function fetchSlugs(endpoint: string): Promise<string[]> {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      cache: 'no-store',
      ...(INTERNAL_API_KEY && { headers }),
    });
    if (!res.ok) return [];
    const json = await res.json();
    const items: { slug?: string }[] = Array.isArray(json)
      ? json
      : Array.isArray(json.data)
      ? json.data
      : [];
    return items.map((i) => i.slug).filter(Boolean) as string[];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [productSlugs, serviceSlugs] = await Promise.all([
    fetchSlugs('/products?status=active&per_page=500'),
    fetchSlugs('/services?status=active&per_page=500'),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`,               lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE_URL}/about`,          lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/services`,       lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE_URL}/products`,       lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE_URL}/projects`,       lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE_URL}/customers`,      lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/faqs`,           lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/contact`,        lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/inquiries`,      lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/privacy-policy`, lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE_URL}/terms-of-service`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];

  const productRoutes: MetadataRoute.Sitemap = productSlugs.map((slug) => ({
    url: `${BASE_URL}/products/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const serviceRoutes: MetadataRoute.Sitemap = serviceSlugs.map((slug) => ({
    url: `${BASE_URL}/services/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...productRoutes, ...serviceRoutes];
}
