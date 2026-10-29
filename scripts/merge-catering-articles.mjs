// Preview: node --env-file=.env scripts/merge-catering-articles.mjs
// Publish: node --env-file=.env scripts/merge-catering-articles.mjs --apply
import { readFile } from 'node:fs/promises';
import { retainedBlogSlug, retiredBlogSlug } from '../src/lib/blogRedirects.js';

const project = process.env.SANITY_PROJECT_ID || 'u5i02ojt';
const dataset = process.env.SANITY_DATASET || 'production';
const base = `https://${project}.api.sanity.io/v2024-01-01/data`;
const token = process.env.SANITY_WRITE_TOKEN;
const apply = process.argv.includes('--apply');
const replacement = JSON.parse(await readFile(new URL('./content/east-london-catering.json', import.meta.url), 'utf8'));

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`Sanity request failed (HTTP ${response.status}); no success assumed.`);
  return response.json();
}

try {
  const query = '*[_type == "blogPost" && slug.current in $slugs]{_id,_rev,title,slug}';
  const params = new URLSearchParams({ query, '$slugs': JSON.stringify([retainedBlogSlug, retiredBlogSlug]) });
  const { result: docs } = await request(`${base}/query/${dataset}?${params}`);
  if (docs.some(doc => doc._id.startsWith('drafts.'))) throw new Error('An article has a draft. Resolve it in Studio before merging to avoid overwriting pending edits.');
  const retained = docs.filter(doc => doc.slug.current === retainedBlogSlug);
  if (retained.length !== 1) throw new Error('Expected exactly one published retained article. No changes made.');
  console.log(`Retained URL: /blog/${retainedBlogSlug}`);
  console.log(`New title: ${replacement.title}`);
  console.log('Only editorial fields will change. Slug, publication date and images are preserved. The retired document is retained as a backup.');
  if (!apply) {
    console.log('Preview complete. Use --apply to publish the reviewed replacement.');
  } else {
    if (!token) throw new Error('SANITY_WRITE_TOKEN is required to publish.');
    await request(`${base}/mutate/${dataset}?returnIds=true`, {
      method: 'POST',
      body: JSON.stringify({ mutations: [{ patch: { id: retained[0]._id, ifRevisionID: retained[0]._rev, set: replacement } }] }),
    });
    const verifyParams = new URLSearchParams({ query: '*[_id == $id][0]', '$id': JSON.stringify(retained[0]._id) });
    const { result: verified } = await request(`${base}/query/${dataset}?${verifyParams}`);
    if (verified?.title !== replacement.title || verified?.body !== replacement.body || verified?.slug?.current !== retainedBlogSlug) throw new Error('Update submitted, but readback verification failed. Inspect Studio before retrying.');
    console.log('Published and verified the replacement article. Deploy the website changes to activate the redirect and listing updates.');
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
