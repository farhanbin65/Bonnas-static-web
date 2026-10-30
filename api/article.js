import { readFile } from 'node:fs/promises';
import { createClient } from '@sanity/client';
import { notFoundHtml, unavailableHtml, respond } from '../server/http-pages.js';

export function articleHandler({ findPost, readTemplate }) {
  return async (req, res) => {
    if (!['GET', 'HEAD'].includes(req.method)) {
      res.setHeader('Allow', 'GET, HEAD');
      return respond(req, res, 405, 'Method not allowed');
    }
    try {
      const pathname = new URL(req.url, 'https://www.bonnas.co.uk').pathname;
      const match = pathname.match(/^\/blog\/([^/]+)\/?$/);
      if (!match) return respond(req, res, 404, notFoundHtml);
      const slug = decodeURIComponent(match[1]);
      const exists = await findPost(slug);
      if (!exists) return respond(req, res, 404, notFoundHtml);
      return respond(req, res, 200, await readTemplate());
    } catch (error) {
      console.error('Article availability check failed:', error);
      return respond(req, res, 503, unavailableHtml);
    }
  };
}
const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || 'u5i02ojt',
  dataset: process.env.VITE_SANITY_DATASET || 'production',
  apiVersion: '2025-02-19', perspective: 'published', useCdn: false,
  timeout: 8000, maxRetries: 0,
});
export default articleHandler({
  findPost: slug => client.fetch('*[_type == "blogPost" && slug.current == $slug && !(_id in path("drafts.**")) && !(_id in path("versions.**"))][0]._id', { slug }),
  readTemplate: () => readFile(new URL('../dist/index.html', import.meta.url), 'utf8'),
});
