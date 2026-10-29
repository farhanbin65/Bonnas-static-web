# Bonna’s — project and SEO reference

Last reviewed: 29 October 2026. Based on the local repository through `fd053ae` and agreed business requirements. This is an implementation inventory, not a live-site SEO audit: production deployment, Search Console results and analytics delivery have not been verified here.

## Purpose

Grow relevant organic search traffic for Bonna’s Bangladeshi catering in East London and convert visitors into genuine WhatsApp enquiries and orders. Prioritise accurate business information, discoverable pages, useful original content and a fast mobile experience. Track enquiries and orders alongside rankings; more automated articles alone is not the goal.

Use [backlog.md](backlog.md) for outstanding work. Documentation does not implement those fixes.

## Business facts and content rules

- Brand: Bonna’s — Original Bengali Cuisine.
- Home-cooked Bangladeshi food, 100% halal, cooked fresh to order.
- Collection only from E2 0RB, East London. No delivery, shipping or courier service.
- Pre-order at least two days ahead.
- Main customer journey: discover the site → browse `/menu` → contact Bonna’s on WhatsApp → arrange an order and collection.
- Ordering email: `orders@bonnas.co.uk`. Confirm other published contact details before standardising them.
- Events include weddings, aqiqah, walima, gaye holud, milad, Eid, iftar, birthdays and office lunches.
- Do not invent prices, availability, opening hours, reviews, awards, travel times or minimum order amounts. Do not describe the kitchen as a walk-in restaurant.
- Keep collection and notice requirements consistent across visible copy, metadata, structured data, generated articles and business profiles.

## Architecture and routes

The installed package manifest declares React 19, Vite 7, React Router 7, Tailwind CSS and DaisyUI. The site is a client-rendered React application hosted on Vercel, with Sanity content and Supabase-backed administrative features. `react-helmet-async` manages page metadata after rendering. `vercel.json` rewrites paths to the shared HTML shell.

| Route | Purpose | SEO treatment |
| --- | --- | --- |
| `/` | Brand, services, food imagery and contact entry points | Primary local catering landing page |
| `/menu` | Food menu and WhatsApp ordering entry | High-intent organic landing page |
| `/gallery` | Food photography, search and lightbox | Supporting public page; dedicated metadata still needed |
| `/blog` | Sanity articles, nine per displayed page | Linked query pagination implemented; browser/deployment checks pending |
| `/blog/:slug` | Individual articles | Unique metadata and article schema exist |
| `/invoice` | Invoice/quote administration and PDF export | Exclude from search; preserve access controls |
| `/records` | Business records administration | Exclude from search; preserve access controls |

Admin tools may load heavier dependencies on their own routes. Their performance is not a priority for public SEO, but they must stay out of public initial bundles and search results.

## Implemented foundations and recent changes

| Area | Present in source | Qualification |
| --- | --- | --- |
| Page metadata | Home, menu, blog list and posts have titles, descriptions and canonical links | Source delivery claims corrected on 29 October; published CMS content and deployment still need verification |
| Structured data | Home `FoodEstablishment`, blog `Blog`, post `BlogPosting` and breadcrumb markup | Validate accuracy, encoding and rendered output before treating as complete |
| Crawl files | `public/robots.txt` and `public/sitemap.xml` | Request-time Sanity sitemap implemented; deployment and live coverage verification pending |
| Search Console | Verification meta tag in `index.html` | Ownership, submissions and indexing need account checks |
| Route splitting | Menu, gallery, blog, invoice and records use lazy imports | Verify production network requests when measuring |
| Deferred sections | Home gallery, social and contact mount near the viewport | Important business text must not depend on scrolling |
| Loading experience | Route/section skeletons, reusable image placeholders, lazy images and asynchronous decoding | Skeletons do not reduce image download bytes |
| Media and animation | Three-row hero wall, gallery motion, video preview component and reduced-motion CSS | Preserve the design while measuring mobile cost |
| Image sizing | Hero/gallery dimensions and Sanity transform parameters in relevant paths | Full image replacement/compression remains deferred by the owner |
| Analytics | Vercel Analytics mounted in `App.jsx` | Actual reporting has not been verified |
| Meta Pixel | Consent-gated `PageView` and WhatsApp `Contact`, excluding invoice/records | The implemented event is `Contact`, not a custom `WhatsAppClick` event; this is advertising measurement, not an SEO ranking improvement |
| Consent UI | Accept/reject, close, draggable position and settings access | Keep consent behaviour intact during future changes |

Recent commits include consent-based Pixel/contact tracking (`32c8e0c`), cookie UI updates (`cf98f23`) and public component/loading improvements (`fd053ae`). No measured speed or ranking improvement is asserted by this document.

## SEO work already completed

This section records the foundations already built, so future work extends them rather than starting again. Repository-backed features are distinguished from external business activity reported by the owner.

### Automated SEO blog and its five supporting files

The automated publishing system is implemented in `scripts/generate_blog.py`, backed by five JSON files in `scripts/`. These are five supporting data/configuration files, rather than five separate executable scripts:

| Supporting file | Implemented role |
| --- | --- |
| `topics.json` | Supplies topics and content types, with usage tracking for rotation |
| `keywords.json` | Supplies primary/supporting keyword context and search intent; the generator records keyword usage |
| `calendar.json` | Supplies seasonal events and publishing windows for timely topics |
| `images.json` | Catalogues food photos, tags and alt text for matching images to articles |
| `post_index.json` | Records published articles and supports related-post selection/internal linking |

Completed pipeline capabilities include scheduled GitHub Actions runs, a manual trigger, Groq-generated article content, Sanity publishing, topic rotation, seasonal selection, local East London context, spelling-variant matching and related-article links. Business facts are embedded in generation prompts, with recursive delivery-claim checks across generated text and a final publishing guard including image alt text. Article slugs, titles, excerpts, keywords, publication dates and featured-image metadata are stored for the website to use. Dry-run options are present for reviewing generation without publishing.

### Helmet, structured data and crawl foundations

- `HelmetProvider` is installed in `src/main.jsx`; `react-helmet-async` is used on home, menu, the blog list and individual posts.
- These routes already set page titles, descriptions and canonical URLs; article metadata comes from the selected Sanity post.
- The blog list and articles include Open Graph and Twitter Card metadata. Article-specific images are a remaining improvement because previews currently use the logo.
- JSON-LD already describes the food business, blog and articles; article breadcrumbs are also marked up.
- `robots.txt`, a starter XML sitemap and a Google Search Console verification tag are present.
- Article bodies convert generated related-post link markers into real React Router links, and articles include a menu CTA.

These are implemented foundations; copy corrections, sitemap automation and rendering improvements remain in the backlog.

### FAQs and direct answers for readers and AI agents

The blog generator already requests a concise `directAnswer` question/answer pair and three topic-related FAQs. It cleans and validates the generated answers, supplies fallback content when necessary and saves these fields to Sanity. `studio/schemaTypes/blogPost.js` defines both fields for content management.

The intended purpose is to make practical answers—halal status, ordering notice and collection arrangements—clear and reusable for readers and systems interpreting the content. This is the answer-content foundation for AI readability, not a guarantee of AI citations or search placement.

**Completed:** generation, fallback handling, CMS schema and storage. **Still pending:** fetching and displaying the answers in `BlogPost.jsx`; the current page does not expose those saved fields or emit FAQPage markup. SEO-11 covers completing the public presentation.

### Food images and image metadata

- Existing food photographs are catalogued with descriptive alt text and topic tags; named/category metadata is available for relevant catalogue entries.
- The generator matches images to topics and has Unsplash/Pexels fallbacks when a suitable catalogue image is unavailable.
- Article featured images render with stored alt text, falling back to the article title.
- The gallery reads Sanity image titles, descriptions, tags and alt text, retains original photos, and supports search and a lightbox.
- Sanity image transformations already request appropriately cropped/formatted hero and gallery variants. Dimensions, lazy loading and image placeholders are implemented in relevant components.

These changes support understandable media and the loading experience. Bulk compression/replacement and a full responsive-image pass are still deferred, as requested.

### Google Business Profile and supporting channels

**Owner-reported external work:** Bonna’s already has a Google Business Profile and has received customer reviews about its food and catering. Replies to several reviews have been drafted in our previous work. Do not mark those replies as published without confirmation.

The profile was reported to be under the wrong Google account, and ownership transfer was discussed. Creation of the profile is complete; transfer completion, current access, profile settings and consistency with the site still require verification under SEO-18.

Facebook and Instagram accounts/pages have also been set up and linked according to the owner’s updates. Automatic cross-posting was reported not to be working, and the repository’s former social-publishing scripts have been removed. Record these as established promotional channels, not a currently verified automated publishing system.

### Performance and measurement foundations

Public route splitting, deferred heavy sections, skeleton loaders, image loading improvements and video previews are already implemented. Vercel Analytics has been integrated. Consent-based Meta Pixel page views and WhatsApp contact events have been added, with admin routes excluded from Pixel tracking. The owner previously observed PageView and Contact events in Meta Test Events; current reporting and attribution still need verification.

These provide a basis for measuring visits and enquiry intent. They do not by themselves demonstrate an organic ranking improvement.

## Blog automation: current behaviour

`.github/workflows/blog-pipeline.yml` runs `scripts/generate_blog.py` on Monday, Wednesday and Friday at 08:00 UTC, with a manual trigger. This is 08:00 London time in winter and 09:00 in summer.

The generator uses a seasonal calendar, topic rotation, keyword context, related-post links and Groq to publish to Sanity. Image selection uses the existing image catalogue with external fallbacks. RSS sources exist, but `USE_TRENDS = False` currently disables trend use. Business facts and delivery-claim validation cover generated text fields and final publishing metadata. The lexical guard is conservative and cannot replace editorial review; published Sanity content still needs an audit.

The generator saves `directAnswer` and `faqs`, but the current `BlogPost.jsx` query and renderer do not retrieve/display them. The README’s FAQ-rendering claim is therefore ahead of implementation. The generator also updates `keywords.json`, while the workflow commits only `topics.json` and `post_index.json`.

Social uploader scripts were removed in recent history. The current workflow does not publish to Facebook or Instagram; do not assume cross-posting is active. If restored, use existing food photos as requested by the owner.

## SEO direction and measurement

Start with accurate collection-only copy, complete URL discovery and route-specific metadata. Then improve rendering reliability, mobile experience and a small number of useful catering pages. Candidate themes include Bangladeshi catering in East London, halal Bengali catering, event catering and specific dishes; validate demand with Search Console rather than claiming keyword volumes.

Record a baseline before implementation:

- Search Console: last three months of clicks, impressions, CTR and average position, split by query, page, device and branded/non-branded searches.
- Index coverage: public URLs submitted, indexed, excluded, duplicated and returning errors.
- PageSpeed/Lighthouse: mobile home, menu and representative blog post; record date, URL, LCP, INP where available, CLS and diagnostic findings. Lab results and field data are different evidence.
- Conversion: organic landing visits and attributable enquiries; WhatsApp clicks indicate intent, not confirmed orders. Consent and blockers mean Pixel totals are incomplete.
- Business outcomes: manually confirmed orders and revenue attributed to organic discovery where known.

Review comparable 28-day periods and seasonal context. Maintain a change log with release dates; do not claim causation from a single score or ranking movement.

## Working conventions

- Source of truth for current implementation: code and workflow files, rather than the older README.
- Keep public SEO fixes focused; avoid redesigning invoice/records for performance work.
- Preserve the owner’s decision to upload smaller images later; document image work as deferred until ready.
- Keep secrets out of docs, logs, generated client bundles and commits.
- For code changes, run `npm run build`, relevant checks and browser verification. For these documentation-only changes, review links and repository facts; no application build is required.
- After every implementation or confirmed external change, update both `project.md` and `backlog.md` in the same work session. Record what changed, validation evidence, remaining work and deployment status; distinguish owner-reported results from independently verified results. Mark backlog items complete only when their acceptance criteria are met.

## Key files

`index.html`, `vercel.json`, `public/robots.txt`, `public/sitemap.xml`, `src/App.jsx`, `src/components/Home.jsx`, `src/components/menu.jsx`, `src/components/Blog.jsx`, `src/components/BlogPost.jsx`, `src/components/gallery.jsx`, `src/components/DeferredSection.jsx`, `src/components/HeroImageWall.jsx`, `src/lib/metaPixel.js`, `scripts/generate_blog.py`, `scripts/topics.json`, `scripts/keywords.json`, `scripts/post_index.json`, `.github/workflows/blog-pipeline.yml`.

## Article consolidation progress — 29 October 2026

The overlapping June 10/12 catering articles are being consolidated into `/blog/bringing-a-taste-of-bengal-to-your-table-authentic-bangladeshi-catering-in-londo`, Google’s reported selected canonical. Local changes redirect the retired “savoring-the-flavors…” URL permanently, exclude it from the listing/sitemap and remap related links. Revised collection-only copy and a revision-guarded CMS migration are prepared in `scripts/content/east-london-catering.json` and `scripts/merge-catering-articles.mjs`. The initial CMS request from the agent failed before mutation. The owner subsequently ran the migration and supplied its “Published and verified” output: the retained article is now updated in Sanity, with its URL, publication date and images preserved. Website deployment and live redirect/content verification remain unconfirmed. Original CMS documents are not deleted.

## Search Console findings and generator follow-up — 29 October 2026

- `/blog` had a Soft 404 classification from the 5 October crawl. The owner’s 29 October live test reports that it can be indexed, and the owner confirmed article cards appear in Google’s rendered view. This does not confirm indexing or that validation/indexing requests were submitted.
- The June 12 “savoring-the-flavors…” article was classified as a duplicate on 3 August, with no detected user canonical. Google selected the June 10 “bringing-a-taste…” article. A live browser check confirmed the June 12 article now has a self-canonical, but its overlapping content justified consolidation.
- Keep one shared article template. Unique page code is unnecessary; distinct search intent and useful original content matter. Generator intent/similarity checks against existing articles and an update-versus-new-post decision are planned under SEO-14/15, not implemented yet.

## Canonical host progress — 29 October 2026

SEO-04 retains `https://www.bonnas.co.uk` as the preferred origin. `public/robots.txt` now points to its sitemap, matching existing sitemap entries and page canonicals. `vercel.json` adds a permanent, host-scoped redirect from `bonnas.co.uk` to the same path on HTTPS www; the article consolidation redirect is preserved. No dashboard settings were changed. Deployment and live HTTP/HTTPS redirect checks, query preservation, loop checks, preview indexing controls and rendered canonical verification remain pending. The local live request failed DNS resolution, so source configuration is not evidence of production behaviour. Gallery metadata is still tracked by SEO-07.

SEO-04 validation (29 October 2026): production build and `git diff --check` passed; Vercel configuration parses as JSON and built robots.txt matches source. Hosting redirect behaviour requires deployment verification.

## Sitemap implementation — 29 October 2026

SEO-03 now uses `api/sitemap.js` via a Vercel rewrite for `/sitemap.xml`, before the SPA fallback. Removed the old `public/sitemap.xml`. Each request queries published Sanity content without caching, so automated and manual publish/update/delete changes need no deployment to refresh the sitemap. Public static routes include gallery; article URLs exclude drafts, release versions, invalid slugs and the retired duplicate, with deduplication and actual CMS modification dates. Static routes omit unknown modification dates. CMS failures return uncached 503 with Retry-After. No CMS documents were changed. `scripts/test-sitemap.mjs` verifies filtering, timestamps and route coverage. Deployment, live XML/count/URL checks and Search Console acceptance remain pending; Vite preview alone does not run Vercel functions.

SEO-03 validation (29 October 2026): production build, sitemap fixture checks, generated XML parsing and `git diff --check` passed. Live Sanity and deployed function verification remain pending.

## Pagination and deployment update — 29 October 2026

Owner reports pushing the prior sitemap/canonical-host work; deployment and live acceptance remain unverified. SEO-05 now uses `/blog?page=N` links with nine posts per page, page-specific titles/canonicals, URL-based navigation, deterministic date/ID ordering and invalid-page normalisation after loading. CMS failures show a separate retry message. Production build, Blog.jsx ESLint and diff checks passed. Browser refresh/back/direct-load checks and live verification remain pending. These pagination changes have not been committed or pushed by the agent.
