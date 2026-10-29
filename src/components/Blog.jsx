import { retiredBlogSlug } from "../lib/blogRedirects";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { client } from "../lib/sanityClient";

function readInitialPosts() {
  if (typeof document === "undefined" || window.location.pathname !== "/blog") return null;
  const element = document.getElementById("blog-initial-data");
  if (!element) return null;
  try { return JSON.parse(element.textContent); } catch { return null; }
}
const visiblePosts = (posts) => posts.filter(post => post.slug?.current && post.slug.current !== retiredBlogSlug);

export default function Blog({ initialPosts }) {
  const [seed] = useState(() => initialPosts ?? readInitialPosts());
  const [posts, setPosts] = useState(() => seed ? visiblePosts(seed) : []);
  const [loading, setLoading] = useState(!seed);
  const [searchParams, setSearchParams] = useSearchParams();
  const [error, setError] = useState(false);

  const postsPerPage = 9;

  useEffect(() => {
    if (seed) {
      document.getElementById("blog-initial-data")?.remove();
      return;
    }
    client
      .fetch(`*[_type == "blogPost"] | order(publishedAt desc, _id asc) {
        _id, title, slug, excerpt, publishedAt, keywords
      }`)
      .then((data) => {
        setPosts(data.filter((post) => post.slug?.current && post.slug.current !== retiredBlogSlug));
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  }, [seed]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(posts.length / postsPerPage));
  const rawPage = searchParams.get("page");
  const parsedPage = /^[1-9]\d*$/.test(rawPage || "") && Number.isSafeInteger(Number(rawPage)) ? Number(rawPage) : 1;
  const currentPage = loading || error ? parsedPage : Math.min(parsedPage, totalPages);
  const pageUrl = (page) => page === 1 ? "/blog" : `/blog?page=${page}`;
  const canonicalUrl = `https://www.bonnas.co.uk${pageUrl(currentPage)}`;
  const pageTitle = `Blog${currentPage > 1 ? ` — Page ${currentPage}` : ""} | Bonna's — Authentic Bangladeshi Food London`;

  useEffect(() => {
    if (loading || error || rawPage === null) return;
    const expected = currentPage === 1 ? null : String(currentPage);
    if (rawPage !== expected || searchParams.getAll("page").length > 1) {
      const next = new URLSearchParams(searchParams);
      next.delete("page");
      if (expected) next.set("page", expected);
      setSearchParams(next, { replace: true });
    }
  }, [loading, error, currentPage, rawPage, searchParams, setSearchParams]);
  const startIndex = (currentPage - 1) * postsPerPage;
  const currentPosts = posts.slice(startIndex, startIndex + postsPerPage);

  return (
    <>
      {/* SEO HEAD */}
      <Helmet>
        <title>{pageTitle}</title>

        <meta
          name="description"
          content="Food stories, recipes, and guides from Bonna's kitchen. Halal Bangladeshi catering. Collection only from E2 0RB, East London; pre-order at least two days ahead."
        />

        <meta name="robots" content="index, follow" />

        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />

        <meta
          property="og:title"
          content={pageTitle}
        />

        <meta
          property="og:description"
          content="Food stories, recipes and guides from Bonna's kitchen. Collection only from E2 0RB, East London; pre-order at least two days ahead."
        />

        <meta property="og:url" content={canonicalUrl} />

        <meta
          property="og:image"
          content="https://www.bonnas.co.uk/logo.PNG"
        />

        <meta property="og:site_name" content="Bonna's" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />

        <meta
          name="twitter:title"
          content={pageTitle}
        />

        <meta
          name="twitter:description"
          content="Food stories, recipes and guides from Bonna's kitchen."
        />

        <meta
          name="twitter:image"
          content="https://www.bonnas.co.uk/logo.PNG"
        />

        {/* JSON-LD Blog Schema */}
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "Bonna's Blog",
            "description": "Food stories, recipes and guides from Bonna's kitchen",
            "url": "https://www.bonnas.co.uk/blog",
            "publisher": {
              "@type": "Organization",
              "name": "Bonna's",
              "url": "https://www.bonnas.co.uk",
              "logo": {
                "@type": "ImageObject",
                "url": "https://www.bonnas.co.uk/logo.PNG"
              }
            }
          }
        `}</script>
      </Helmet>

      <section className="py-20 px-6 md:px-20 bg-night min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <p className="text-pink-bonnas text-sm font-semibold tracking-widest uppercase mb-2">
              Fresh from the kitchen
            </p>

            <h1 className="text-3xl md:text-4xl font-bold text-cream">
              Bonna's Blog
            </h1>

            <p className="text-sand text-sm mt-2">
              Food stories, guides and inspiration from our kitchen to yours
            </p>

            <p className="text-sand text-xs mt-3">
              {!loading && !error && `${posts.length} blog posts published · Page ${currentPage} of ${totalPages}`}
            </p>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 rounded-full border-2 border-pink-bonnas border-t-transparent animate-spin" />
            </div>
          ) : error ? (
            <div role="alert" className="text-center text-sand py-20">
              <p>We couldn’t load the articles. Please try again.</p>
              <button className="mt-4 underline" onClick={() => window.location.reload()}>Retry</button>
            </div>
          ) : posts.length === 0 ? (
            /* No Posts */
            <p className="text-center text-sand py-20">
              No posts yet — check back soon!
            </p>
          ) : (
            /* Posts */
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {currentPosts.map((post) => (
                  <Link
                    key={post._id}
                    to={`/blog/${post.slug.current}`}
                    className="bg-ember border border-gold-dust hover:border-pink-bonnas/50 rounded-2xl p-6 transition-colors group flex flex-col gap-3"
                  >
                    {/* Keywords */}
                    <div className="flex flex-wrap gap-1.5">
                      {post.keywords?.slice(0, 2).map((k) => (
                        <span
                          key={k}
                          className="text-xs bg-pink-bonnas/10 text-pink-bonnas px-2 py-0.5 rounded-full"
                        >
                          {k}
                        </span>
                      ))}
                    </div>

                    {/* Title */}
                    <h2 className="text-cream font-semibold text-base leading-snug group-hover:text-pink-bonnas transition-colors flex-1">
                      {post.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-sand text-xs leading-relaxed line-clamp-2">
                      {post.excerpt}
                    </p>

                    {/* Date */}
                    <div className="flex items-center justify-between pt-3 border-t border-gold-dust">
                      <p className="text-sand text-xs">
                        {new Date(post.publishedAt).toLocaleDateString(
                          "en-GB",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </p>

                      <span className="text-pink-bonnas text-xs">Read →</span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav aria-label="Blog pagination" className="flex flex-wrap justify-center items-center gap-2 mt-10">
                  {currentPage > 1 && <Link to={pageUrl(currentPage - 1)} rel="prev" className="px-4 py-2 text-sand underline">← Previous</Link>}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Link key={page} to={pageUrl(page)} aria-label={`Page ${page}`} aria-current={page === currentPage ? "page" : undefined}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg border ${page === currentPage ? "bg-pink-bonnas text-night border-pink-bonnas" : "border-gold-dust text-sand"}`}>
                      {page}
                    </Link>
                  ))}
                  {currentPage < totalPages && <Link to={pageUrl(currentPage + 1)} rel="next" className="px-4 py-2 text-sand underline">Next →</Link>}
                </nav>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}