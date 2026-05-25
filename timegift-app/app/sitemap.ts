import type { MetadataRoute } from 'next';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://timegift.fly.dev';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pub = [
    { url: `${APP_URL}/`, priority: 1.0 },
    { url: `${APP_URL}/about`, priority: 0.6 },
    { url: `${APP_URL}/privacy`, priority: 0.4 },
    { url: `${APP_URL}/terms`, priority: 0.4 },
    { url: `${APP_URL}/calculator`, priority: 0.6 },
  ];
  return pub.map((p) => ({ ...p, lastModified: now, changeFrequency: 'monthly' as const }));
}
