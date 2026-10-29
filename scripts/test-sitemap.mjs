import assert from 'node:assert/strict';
import { renderSitemap } from '../api/sitemap.js';
import { retiredBlogSlug } from '../src/lib/blogRedirects.js';
const post = (slug, extra = {}) => ({slug: {current: slug}, ...extra});
const xml = renderSitemap([
  post('real-article', {_updatedAt: '2026-10-01T12:00:00Z'}),
  post('real-article', {_updatedAt: '2026-10-02T12:00:00Z'}),
  post('draft-article', {_id: 'drafts.a'}), post(retiredBlogSlug),
  post('../bad'), post('bad&slug'), post('release', {_id:'versions.release.a'}),
]);
assert.equal((xml.match(/<url>/g) || []).length, 5);
assert.ok(xml.includes('/gallery</loc>'));
assert.ok(xml.includes('2026-10-02T12:00:00.000Z'));
assert.ok(!xml.includes('2026-10-01'));
for (const excluded of ['draft-article', retiredBlogSlug, '../bad', 'bad&slug', '/invoice', '/records', '/blog/release']) assert.ok(!xml.includes(excluded));
assert.equal((renderSitemap([]).match(/<url>/g) || []).length, 4);
assert.throws(() => renderSitemap(null));
console.log('Sitemap filtering, deduplication, timestamps and static route checks passed.');
