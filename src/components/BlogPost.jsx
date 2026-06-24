import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { client } from "../lib/sanityClient";

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  client
    .fetch(
      `*[_type == "blogPost" && slug.current == $slug][0] {
        title, excerpt, body, publishedAt, keywords, trendSource, slug,
        featuredImageUrl, featuredImageAlt, imageSource, contentType
      }`,
      { slug }
    )
    .then((data) => { setPost(data); setLoading(false); })
    .catch(() => setLoading(false));
}, [slug]);

  if (loading) return (
    <div className="min-h-screen bg-night flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-pink-bonnas border-t-transparent animate-spin" />
    </div>
  );

  if (!post) return (
    <div className="min-h-screen bg-night flex flex-col items-center justify-center gap-4">
      <p className="text-cream">Post not found.</p>
      <Link to="/blog" className="text-pink-bonnas text-sm hover:underline">← Back to blog</Link>
    </div>
  );

  const canonicalUrl = `https://www.bonnas.co.uk/blog/${post.slug.current}`;
  const publishedDate = new Date(post.publishedAt).toISOString();

  return (
    <>
      {/* ✅ SEO HEAD - Unique per post, Google reads every word */}
      <Helmet>
        <title>{post.title} | Bonna's</title>
        <meta name="description" content={post.excerpt} />
        <meta
          name="keywords"
          content={post.keywords?.join(", ")}
        />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Bonna's Kitchen" />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={`${post.title} | Bonna's`} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content="https://www.bonnas.co.uk/logo.PNG" />
        <meta property="og:site_name" content="Bonna's" />
        <meta property="article:published_time" content={publishedDate} />
        <meta property="article:author" content="Bonna's Kitchen" />
        {post.keywords?.map((k) => (
          <meta key={k} property="article:tag" content={k} />
        ))}

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt} />
        <meta name="twitter:image" content="https://www.bonnas.co.uk/logo.PNG" />

        {/* ✅ JSON-LD BlogPosting Schema — richest SEO signal possible */}
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": "${post.title?.replace(/"/g, '\\"')}",
            "description": "${post.excerpt?.replace(/"/g, '\\"')}",
            "datePublished": "${publishedDate}",
            "dateModified": "${publishedDate}",
            "url": "${canonicalUrl}",
            "author": {
              "@type": "Organization",
              "name": "Bonna's Kitchen",
              "url": "https://www.bonnas.co.uk"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Bonna's",
              "url": "https://www.bonnas.co.uk",
              "logo": {
                "@type": "ImageObject",
                "url": "https://www.bonnas.co.uk/logo.PNG"
              }
            },
            "keywords": "${post.keywords?.join(", ")}",
            "image": {
              "@type": "ImageObject",
              "url": "https://www.bonnas.co.uk/logo.PNG",
              "width": 1200,
              "height": 630
            }
          }
        `}</script>
      </Helmet>

      <article className="py-20 px-6 md:px-20 bg-night min-h-screen">
        <div className="max-w-2xl mx-auto">

          <Link
            to="/blog"
            className="inline-flex items-center gap-1 text-pink-bonnas text-sm hover:underline mb-8 block"
          >
            ← Back to blog
          </Link>

          {/* ✅ Breadcrumb — helps Google understand site structure */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-2 text-xs text-sand" itemScope itemType="https://schema.org/BreadcrumbList">
              <li itemScope itemType="https://schema.org/ListItem" itemProp="itemListElement">
                <Link to="/" itemProp="item" className="hover:text-pink-bonnas transition-colors">
                  <span itemProp="name">Home</span>
                </Link>
                <meta itemProp="position" content="1" />
              </li>
              <li className="text-gold-dust">/</li>
              <li itemScope itemType="https://schema.org/ListItem" itemProp="itemListElement">
                <Link to="/blog" itemProp="item" className="hover:text-pink-bonnas transition-colors">
                  <span itemProp="name">Blog</span>
                </Link>
                <meta itemProp="position" content="2" />
              </li>
              <li className="text-gold-dust">/</li>
              <li itemScope itemType="https://schema.org/ListItem" itemProp="itemListElement">
                <span itemProp="name" className="text-cream truncate max-w-[200px] block">{post.title}</span>
                <meta itemProp="position" content="3" />
              </li>
            </ol>
          </nav>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {post.keywords?.map((k) => (
              <span
                key={k}
                className="text-xs bg-pink-bonnas/10 text-pink-bonnas px-2 py-0.5 rounded-full"
              >
                {k}
              </span>
            ))}
          </div>

          <h1 className="text-2xl md:text-4xl font-bold text-cream mb-4 leading-snug">
            {post.title}
          </h1>

          <div className="flex items-center gap-3 mb-8 pb-8 border-b border-gold-dust">
            <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-pink-bonnas/40">
              <img src="/logo.PNG" alt="Bonna's Kitchen logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-cream text-xs font-medium">Bonna's Kitchen</p>
              <p className="text-sand text-xs">
                <time dateTime={publishedDate}>
                  {new Date(post.publishedAt).toLocaleDateString("en-GB", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </time>
              </p>
            </div>
          </div>

          {post.featuredImageUrl && (
            <div className="rounded-2xl overflow-hidden border border-gold-dust mb-8">
              <img
                src={post.featuredImageUrl}
                alt={post.featuredImageAlt || post.title}
                className="w-full h-64 md:h-80 object-cover"
              />
              {post.imageSource && post.imageSource !== "local" && (
                <p className="text-xs text-sand/50 text-right px-3 py-1">
                  Photo via {post.imageSource === "unsplash" ? "Unsplash" : "Pexels"}
                </p>
              )}
            </div>
          )}

          <p className="text-pink-bonnas/80 text-base italic mb-8 leading-relaxed">
            {post.excerpt}
          </p>

          {/* ✅ body content — readable by Google */}
          <div className="text-sand text-base leading-relaxed whitespace-pre-line prose prose-invert max-w-none">
            {post.body}
          </div>

          <div className="mt-12 bg-ember border border-gold-dust rounded-2xl p-6 text-center">
            <p className="text-cream font-semibold mb-2">Ready to order?</p>
            <p className="text-sand text-sm mb-4">
              Authentic Bangladeshi food delivered to your door in London
            </p>
            <Link
              to="/menu"
              className="inline-flex items-center bg-pink-bonnas text-night px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-pink-dark transition-colors"
            >
              View Our Menu →
            </Link>
          </div>

        </div>
      </article>
    </>
  );
}