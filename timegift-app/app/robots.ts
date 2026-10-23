import type { MetadataRoute } from 'next';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://timegift.6x7.gr';

/** AI crawlers named explicitly so letting them in is a stated choice. Same rules as '*'. */
const AI_CRAWLERS = [
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-User', 'Claude-SearchBot',
  'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'CCBot',
];

/* One group per user agent: two separate '*' groups are merged by some crawlers
   and ignored (only the first read) by others. */
const ALLOW = ['/', '/about', '/privacy', '/terms', '/calculator', '/llms.txt', '/llms-full.txt'];
const DISALLOW = ['/api/', '/auth/', '/dashboard', '/create', '/profile', '/friends', '/memories', '/admin', '/g/', '/gifts/', '/wishlist', '/browse', '/analytics', '/suggestions', '/templates'];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [AI_CRAWLERS, '*'].map((userAgent) => ({ userAgent, allow: ALLOW, disallow: DISALLOW })),
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
