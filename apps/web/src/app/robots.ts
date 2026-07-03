import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/profile', '/auth'],
    },
    sitemap: 'https://www.ubculture.uz/sitemap.xml',
  };
}
