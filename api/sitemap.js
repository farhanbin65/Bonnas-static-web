import { createClient } from '@sanity/client';
import { retiredBlogSlug } from '../src/lib/blogRedirects.js';

const origin = 'https://www.bonnas.co.uk';
const escapeXml = (value) => value.replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
}[char]));

export function renderSitemap(posts) {
  if (!Array.isArray(posts)) throw new Error('Invalid Sanity response');
  const entries = new Map(['/', '/menu', '/gallery', '/blog'].map(path => [path, null]));
  for (const post of posts) {
    const slug = post.slug?.current;
    if (post._id?.startsWith('drafts.') || post._id?.startsWith('versions.') ||
        typeof slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
        slug === retiredBlogSlug) continue;
    const date = Date.parse(post._updatedAt);
    const modified = Number.isFinite(date) ? new Date(date).toISOString() : null;
    const path = `/blog/${slug}`;
    const previous = entries.get(path);
    if (!entries.has(path) || (modified && (!previous || modified > previous))) entries.set(path, modified);
  }
  return '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    [...entries].map(([path, date]) => `  <url><loc>${escapeXml(origin + path)}</loc>${date ? `<lastmod>${date}</lastmod>` : ''}</url>`).join('\n') +
    '\n</urlset>\n';
}

export default async function handler(req, res) {
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).end();
  }
  res.setHeader('Cache-Control', 'no-store');
  try {
    const client = createClient({
      projectId: process.env.VITE_SANITY_PROJECT_ID || 'u5i02ojt',
      dataset: process.env.VITE_SANITY_DATASET || 'production',
      apiVersion: '2025-02-19', perspective: 'published', useCdn: false,
      timeout: 8000, maxRetries: 0,
    });
    const posts = await client.fetch(`*[_type == "blogPost" && defined(slug.current) && !(_id in path("drafts.**")) && !(_id in path("versions.**"))]{_id, slug, _updatedAt}`);
    const xml = renderSitemap(posts);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    return res.status(200).end(req.method === 'HEAD' ? undefined : xml);
  } catch {
    res.setHeader('Retry-After', '300');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(503).end(req.method === 'HEAD' ? undefined : 'Sitemap temporarily unavailable. Please retry.');
  }
}
