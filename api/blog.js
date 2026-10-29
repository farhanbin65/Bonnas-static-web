import { readFile } from 'node:fs/promises';
import { createClient } from '@sanity/client';
import { renderBlog } from '../dist-ssr/blog-entry.js';

const template = () => readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).end();
  }
  try {
    let html = await template();
    const page = new URL(req.url, 'https://www.bonnas.co.uk').searchParams.get('page');
    // Later pages retain the existing client-rendered behaviour.
    if (page !== null && page !== '1') {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).end(req.method === 'HEAD' ? undefined : html);
    }
    const client = createClient({
      projectId: process.env.VITE_SANITY_PROJECT_ID || 'u5i02ojt',
      dataset: process.env.VITE_SANITY_DATASET || 'production',
      apiVersion: '2025-02-19', perspective: 'published', useCdn: false,
      timeout: 8000, maxRetries: 0,
    });
    const posts = await client.fetch(`*[_type == "blogPost" && defined(slug.current) && !(_id in path("drafts.**")) && !(_id in path("versions.**"))] | order(publishedAt desc, _id asc) {_id,title,slug,excerpt,publishedAt,keywords}`);
    if (!Array.isArray(posts)) throw new Error('Invalid response');
    const rendered = renderBlog(posts);
    // Remove the home metadata before inserting the listing's Helmet output.
    html = html.replace(/<title>[\s\S]*?<\/title>/g, '')
      .replace(/<meta\b[^>]*(?:data-rh="true"|name="robots")[^>]*>/g, '')
      .replace('</head>', `${rendered.head.replace(/<(title|meta|link|script)\b/g, '<$1 data-blog-ssr="true"')}</head>`)
      .replace('<div id="root"></div>', `<div id="root">${rendered.html}</div>`);
    const data = JSON.stringify(posts).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
    html = html.replace('</head>', `<script id="blog-initial-data" type="application/json">${data}</script></head>`);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Vercel-CDN-Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return res.status(200).end(req.method === 'HEAD' ? undefined : html);
  } catch {
    res.setHeader('Retry-After', '300');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(503).end(req.method === 'HEAD' ? undefined : '<!doctype html><html lang="en"><title>Blog temporarily unavailable | Bonna’s</title><h1>Blog temporarily unavailable</h1><p>Please try again shortly.</p><a href="/menu">Browse our menu</a></html>');
  }
}
