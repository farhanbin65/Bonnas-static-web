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

The installed package manifest declares React 19, Vite 7, React Router 7, Tailwind CSS and DaisyUI. The site is a React application hosted on Vercel, with first-page blog server rendering implemented locally and other routes client-rendered, with Sanity content and Supabase-backed administrative features. `react-helmet-async` manages page metadata after rendering. `vercel.json` routes the sitemap and blog listing to functions before the shared HTML fallback.

| Route | Purpose | SEO treatment |
| --- | --- | --- |
| `/` | Brand, services, food imagery and contact entry points | Primary local catering landing page |
| `/menu` | Food menu and WhatsApp ordering entry | High-intent organic landing page |
| `/gallery` | Food photography, search and lightbox | Supporting public page; dedicated metadata implemented, live verification pending |
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
| Deferred sections | Home gallery, social and contact mount near the viewport | Essential collection/order/contact facts now also render in eager ContactDetails; live checks pending |
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
- The blog list and articles include Open Graph and Twitter Card metadata. Article social tags now use the featured image with a logo fallback; live preview verification remains pending.
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

## SEO-06 rendering assessment — 29 October 2026

Assessment complete; rendering implementation is not complete. The working tree was clean at the start of this review, including the earlier pagination changes. Production deployment is not independently verified.

### Decision

Use request-time rendering for public CMS routes, with shared React components and data supplied before rendering. Keep the existing English routes and www origin. Language expansion is unconfirmed and will not block this work. Prefer an established Vite/React Router SSR integration over a bespoke HTML renderer; validate the integration in a preview before switching production routing. Preserve client-only admin tools and current consent behaviour.

| Option | Benefit | Cost / limitation for this project |
| --- | --- | --- |
| Build-time prerendering | Static HTML served without a CMS request per visit | Needs authenticated CMS-triggered rebuilds for manual publish/update/delete; query-based pagination needs routing support beyond static files; new posts can appear in the dynamic sitemap before HTML is rebuilt |
| Request-time SSR | Current CMS data and query pagination can render on direct requests | Requires server/client entry points, preloaded data, hydration checks, explicit status handling and CMS failure behaviour |

### Repository findings

- App.jsx owns BrowserRouter; server routing must be separated from shared routes.
- main.jsx uses createRoot; server markup needs hydrateRoot and matching initial data.
- Blog.jsx, BlogPost.jsx and gallery.jsx fetch in effects. Rendering them unchanged on the server produces loading placeholders, not content.
- DeferredSection initially omits its children; essential contact/business information must render independently of intersection observers (SEO-09).
- Helmet is client-managed today. The server must emit one route-specific title, description and canonical without leaving default home metadata on other routes.
- The Vercel SPA catch-all must be changed only after public response handling is verified; preserve sitemap and permanent redirects ahead of page routing.

### Implementation sequence and acceptance checks

1. Establish shared public route definitions and Sanity loaders; preserve ordering, retired-slug handling and pagination normalisation.
2. Add server/client rendering entries with request-scoped metadata/data. Escape embedded JSON and reuse the same initial data for hydration. Keep browser-only effects, consent and admin dependencies out of server execution where required.
3. Render home, menu, gallery, blog pages and articles with visible content and route-specific metadata. Preload data before rendering; do not make a crawler-only content variant.
4. Return real 404 for missing routes/articles and 503 for temporary CMS failures; keep existing redirects and query parameters. Define cache freshness explicitly before enabling caching.
5. Validate raw HTTP HTML for home/menu/gallery, blog pages 1/2, an article and missing URLs; check one canonical, real article links, status codes and CMS update/delete propagation. Verify hydration, refresh/back navigation, menu/cart/WhatsApp actions and consent in a browser at mobile and desktop sizes.
6. Deploy a preview, verify the above, then switch production and inspect Google-rendered HTML. Do not mark SEO-06 complete on a successful Vite build alone.

References: https://vite.dev/guide/ssr and https://vercel.com/docs/frameworks/frontend/vite. Both describe Vite SSR as a low-level integration and point to higher-level integrations. This assessment changes documentation only; no rendering implementation or hosting settings were changed.

## First-page blog rendering — 29 October 2026

Implemented the owner-approved limited SEO-06 scope: `/blog` (including `?page=1`) now routes to `api/blog.js`. The build generates `dist-ssr/blog-entry.js` from the existing Blog React component. The server reads published Sanity listing data, renders the latest nine visible posts, pagination links and route-specific metadata into the built HTML. Embedded initial listing data is escaped and reused by React; the server metadata is removed when React takes ownership. This is server-rendered initial content followed by a client mount, not full-app hydration. Blog is eagerly imported to avoid replacing the initial listing with a lazy-route spinner. Site chrome appears when the client mounts.

Vercel CDN freshness is 300 seconds with 600 seconds stale-while-revalidate; browser responses use no-store. CMS changes can remain stale during that window. CMS failures return uncached 503 with Retry-After. Later page queries retain the SPA response; individual articles, gallery, home and menu rendering are unchanged. The function bundles the built HTML and server renderer using includeFiles. No CMS writes or deployment were performed.

Validation: client/server builds and fixture checks for nine posts, next-page links, escaped text, one canonical, later-page fallback and method handling. Pending: Vercel deployment/package verification, live Sanity response and cache headers, browser takeover/navigation checks and Search Console rendered HTML. SEO-06 remains partially complete; broader rendering requirements are still open.

## Metadata progress — 29 October 2026

SEO-07 implementation: shared PageMetadata now supplies coherent title/description/canonical, Open Graph and Twitter tags for home, menu and standalone gallery. Gallery has an h1 on its own route and retains an h2 with no page metadata when embedded on home. Article social cards use the actual featuredImageUrl, normalise relative paths to the www HTTPS origin, reject non-HTTPS protocols and fall back to the logo. Added image alt metadata. Fixed an unnecessary regex escape reported by lint in BlogPost without changing link parsing behaviour.

Validation: production client/server builds, focused metadata component lint and social-image URL/fallback checks; diff whitespace check passed. Pending: deployed metadata uniqueness and preview checks, image availability and raw HTML for crawlers that do not run JavaScript. Most routes still need SEO-06 rendering work before reliable social previews can be claimed. SEO-07 remains partially complete. These changes and the preceding first-page rendering work remain uncommitted locally; no deployment was performed.

## Release preparation — 29 October 2026

Prepared the first-page blog rendering and page/social metadata changes for the owner-requested commit and push. Prior build, focused lint and fixture checks passed. SEO-06 and SEO-07 remain unchecked pending live verification; production availability and ranking effects are not established. Git publication result will be reported separately.

## Live verification and blog repair — 29 October 2026

Independent HTTP checks: `/sitemap.xml` returned 200 XML with 108 URLs, all using HTTPS www, including gallery and excluding the retired article. `/robots.txt` returned 200 and the correct www sitemap URL. `/blog` and `/blog?page=2` returned HTTP 500 with Vercel FUNCTION_INVOCATION_FAILED, so first-page rendering is NOT verified working in production. Canonical and retired-article requests returned permanent redirects; end-to-end destination verification remains pending.

Prepared a defensive repair: bundle server renderer dependencies explicitly (Vite SSR noExternal), load the renderer inside the handler only for page one, log server errors and serve the client app with an uncached 503 when rendering fails. Later pages no longer import the renderer at startup. The precise startup exception requires Vercel runtime logs; packaging is a suspected cause, not proven. Client/server build, local bundled rendering and page-two handler checks passed. Repair is not committed/deployed. Retest live function, caching, metadata and browser navigation after deployment; SEO-06 remains incomplete.

Confirmed runtime diagnosis (29 October 2026): owner supplied ERR_MODULE_NOT_FOUND for react-router-dom/dist/index.js imported by the deployed SSR bundle. This confirms missing packaged renderer dependencies. The prepared `ssr.noExternal: true` repair bundles React Router and other renderer packages. Verified the rebuilt renderer from an isolated temporary directory outside the repository without project node_modules; article content and canonical rendered successfully. Commit/deployment and live recheck remain pending.

## Successful live blog recheck — 29 October 2026

After the repair deployment, independent HTTP requests to `/blog` and `/blog?page=1` returned 200 with nine article links, a real page-two link, embedded initial data, the blog title and exactly one canonical pointing to https://www.bonnas.co.uk/blog. The prior function startup failure is resolved for these requests. `/blog?page=2` returned 200 with the expected client app shell; its articles and route metadata still require JavaScript, so raw HTML contains the default title and no canonical. Browser takeover/navigation and Search Console validation remain pending.
A repeated `/blog` request returned Vercel cache HIT, confirming CDN reuse.

## Browser and Search Console verification attempt — 29 October 2026

Live HTTP success and CDN HIT remain verified from the preceding check. Attempted an isolated headless Chrome session for browser takeover/pagination checks; Chrome exited with status 134 before opening, so no browser behaviour was verified. No browser or Search Console connector is available in this session. Owner checks still needed: first-page cards survive JavaScript startup, page-two navigation displays the next posts, refresh stays on page two, browser back returns to page one, and mobile pagination fits. Run Search Console Test live URL for `/blog`, confirm cards in the rendered screenshot, then request indexing once if it passes. Do not record Google indexing or validation success until results are supplied.

## Owner verification passed — 29 October 2026

The owner reported “passed” after the requested browser and Search Console checklist: first-page articles, page-two navigation, refresh/back behaviour and Google’s live rendered-page check. Recorded as owner-reported verification, not independent browser testing. The earlier independent HTTP checks confirmed 200 responses, first-page article HTML, canonical and CDN cache HIT. Submission of an indexing request and actual Google indexing are not explicitly confirmed. Mobile-specific checks, broader route rendering and social preview checks remain outstanding; SEO-06/07 are not fully complete.

## SEO-08 implementation — 29 October 2026

Added a React wildcard NotFound view with recovery links and noindex. Added Vercel response headers plus client metadata for invoice/records noindex, nofollow; sitemap exclusions remain unchanged and robots.txt still permits crawlers to read those directives. This is not authentication and does not change admin access controls.

Replaced the blanket SPA fallback with explicit known-page rewrites, a blog article availability function and a real 404 fallback. Existing static files, sitemap/blog functions and permanent redirects must be checked after deployment. Direct article requests check published Sanity existence: valid documents receive the app shell (200), missing documents receive 404, CMS failures receive uncached 503 with Retry-After. This adds a Sanity round trip to direct article requests; article content still renders client-side. The built HTML is included in the article function package.

BlogPost now resets state on slug changes, ignores stale fetch responses and distinguishes a missing article from a temporary failure with a Retry button. Local production build, focused lint, whitespace and fixture checks for valid/missing articles, CMS outage and HEAD responses passed. Deployment, real valid/missing URL checks, asset/deep-link checks and admin header/browser navigation verification remain pending. SEO-08 remains unchecked until those checks pass. No commit or deployment performed.

## SEO-09 essential contact content — 29 October 2026

Added ContactDetails as an eagerly imported homepage section outside DeferredSection. Its business facts, collection location (E2 0RB), two-day pre-order notice, menu, WhatsApp and ordering email links render immediately when the client app mounts, without scrolling, observer callbacks or reveal animations. The existing contact.jsx is a games section and remains deferred, as do the social feed and gallery. Changed its loading label to “Loading games”. Footer Contact now targets /#contact rather than the games section; the Games navigation target stays intact.

Standardised the footer to confirmed facts: orders@bonnas.co.uk, collection-only E2 0RB and two-day pre-order notice. Replaced unsupported “Halal Certified” with “100% halal” and removed unverified fixed opening hours. Existing consent-based delegated WhatsApp tracking is unchanged. This does not add home server rendering: initial raw homepage HTML remains part of the wider SEO-06 work.

Validation: production client/server builds, focused lint and diff checks. Live mobile layout, contact-anchor navigation and pre-scroll DOM verification remain pending. No commit/deployment performed; SEO-09 remains unchecked until verified.

## Four-page menu viewer — 29 October 2026

Owner replaced menu.pdf and supplied menu1.png through menu4.png. Updated hero, home menu teaser and menu route to one shared four-page image viewer; old JPG references in these components are removed, and original files are not deleted. All four PNGs were confirmed present at 1414 × 2000 pixels. Click/tap any thumbnail to start on that page, swipe horizontally or use previous/next buttons or arrow keys. Zoom enables panning, with Fit page restoring the contained view. Native modal dialog provides focus containment, Escape close and focus restoration, with body scroll lock.

Replaced the oversized embedded PDF iframe. The hero Menu button opens the screen-fitting PNG viewer; Open PDF opens the complete PDF directly in a separate browser tab, and Download retains the same file with a version query to refresh caches. PDF navigation/zoom in that tab is controlled by the browser; custom swipe controls apply to PNG previews. Viewer sizing uses 100dvh, constrained width, flexible image area and safe-area padding. All four pages are included in thumbnail grids.

Validation: client/server builds and focused viewer/hero lint passed; source diff whitespace checks passed (the owner’s PDF binary is excluded from text whitespace checks). No old menu JPG references remain in components. Actual iPhone swipe/pinch/rotation, desktop modal interactions and deployment checks remain pending; no commit/deployment performed. Earlier SEO-08/09 deployment verification remains outstanding.

Menu retry verification — 30 October 2026: confirmed all four PNG entry points and shared viewer remain in place. Corrected hero thumbnails to show the full page without cropping and clear swipe tracking on touch cancellation. Production client/server builds, focused viewer/hero lint and source whitespace checks passed again. Native PDF browsing remains separate from the custom swipeable PNG viewer; real-device interaction verification and deployment are still pending.

## Menu controls and compact order flow — 30 October 2026

At the owner’s request, menu and menu-teaser now show one PDF action labelled Menu; removed View menu/Open PDF/Download PDF actions. The Menu link opens the PDF in the current tab so browser Back returns to the site. The image dialog likewise retains only a same-tab Menu PDF link and its close/navigation/zoom controls; thumbnails remain clickable and swipeable. Hero retains its image-preview Menu button.

Replaced the duplicated emoji ordering flows with one shared OrderingFlowchart using Lucide SVG icons. All five numbered steps appear in a compact five-column grid on phones/tablets, with smaller padding/icons/type and visible WhatsApp/email links beneath. Desktop scales up the same layout. Removed hover-only contact controls and scroll-reveal gating from this flow. Production client/server build, focused lint and source whitespace checks passed. Actual phone layout, PDF Back behaviour and deployment verification remain pending; no commit or deployment performed.

## Narrow-screen layout correction — 30 October 2026

Owner reported a white right edge at 320px, an overflowing Notify me button, and requested a vertical ordering flow. Reservation notification controls now stack below 640px with a min-width-zero/full-width input and contained button; contact card text can wrap, card padding reduces on narrow screens and the fixed toast is constrained to viewport width. Set document/body background to the existing night theme and removed body margin. The input/button row was an identified overflow source; elimination of every live 320px overflow still requires device verification.

OrderingFlowchart now uses compact top-to-bottom cards at all widths, with SVG icons and downward arrows, replacing the five-column layout. Production build, focused lint and source diff checks passed. Pending actual 320px/device verification, commit and deployment.
