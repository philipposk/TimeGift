import type { MetadataRoute } from 'next';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://timegift.fly.dev';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: ['/', '/about', '/privacy', '/terms', '/calculator'] },
      { userAgent: '*', disallow: ['/api/', '/auth/', '/dashboard', '/create', '/profile', '/friends', '/memories', '/admin', '/g/', '/gifts/', '/wishlist', '/browse', '/analytics', '/suggestions', '/templates'] },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
