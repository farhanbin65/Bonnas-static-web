export const notFoundHtml = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex, follow"><title>Page not found | Bonna’s</title></head><body><main><h1>Page not found</h1><p>This page may have moved or is no longer available.</p><a href="/">Home</a> · <a href="/blog">Browse the blog</a></main></body></html>';
export const unavailableHtml = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Temporarily unavailable | Bonna’s</title></head><body><main><h1>Article temporarily unavailable</h1><p>Please try again shortly.</p><a href="/blog">Browse the blog</a></main></body></html>';
export function respond(req, res, status, body) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  if (status === 404) res.setHeader('X-Robots-Tag', 'noindex, follow');
  if (status === 503) res.setHeader('Retry-After', '300');
  return res.status(status).end(req.method === 'HEAD' ? undefined : body);
}
