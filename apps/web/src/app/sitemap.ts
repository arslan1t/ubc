import type { MetadataRoute } from 'next';

const BASE_URL = 'https://ubc-web-azure.vercel.app';
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

async function fetchSlugs(path: string, extract: (json: any) => string[]): Promise<string[]> {
  try {
    const res = await fetch(`${API_URL}${path}`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    return extract(await res.json());
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/courts`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/pickup-games`, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE_URL}/events`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/news`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/media`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE_URL}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/courts/suggest`, changeFrequency: 'monthly', priority: 0.4 },
  ];

  const [courtSlugs, newsSlugs, eventSlugs] = await Promise.all([
    fetchSlugs('/courts?limit=100', (j) => (j.data ?? []).map((c: any) => c.slug)),
    fetchSlugs('/news?limit=100', (j) => (j.data ?? []).map((n: any) => n.slug)),
    fetchSlugs('/events', (j) => (Array.isArray(j) ? j : []).map((e: any) => e.slug)),
  ]);

  return [
    ...staticPages,
    ...courtSlugs.map((slug) => ({
      url: `${BASE_URL}/courts/${slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...newsSlugs.map((slug) => ({
      url: `${BASE_URL}/news/${slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...eventSlugs.map((slug) => ({
      url: `${BASE_URL}/events/${slug}`,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })),
  ];
}
