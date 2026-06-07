import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { client } from "../lib/sanityClient";

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client
      .fetch(`*[_type == "blogPost" && slug.current == $slug][0] {
        title, excerpt, body, publishedAt, keywords, trendSource
      }`, { slug })
      .then((data) => { setPost(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!post) return;
    document.title = post.title + " | Bonna's";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = post.excerpt;
  }, [post]);

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

  return (
    <article className="py-20 px-6 md:px-20 bg-night min-h-screen">
      <div className="max-w-2xl mx-auto">

        <Link to="/blog" className="inline-flex items-center gap-1 text-pink-bonnas text-sm hover:underline mb-8 block">
          ← Back to blog
        </Link>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {post.keywords?.map((k) => (
            <span key={k} className="text-xs bg-pink-bonnas/10 text-pink-bonnas px-2 py-0.5 rounded-full">{k}</span>
          ))}
        </div>

        <h1 className="text-2xl md:text-4xl font-bold text-cream mb-4 leading-snug">{post.title}</h1>

        <div className="flex items-center gap-3 mb-8 pb-8 border-b border-gold-dust">
          <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-pink-bonnas/40">
            <img src="/logo.PNG" alt="Bonna's" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-cream text-xs font-medium">Bonna's Kitchen</p>
            <p className="text-sand text-xs">
              {new Date(post.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>

        <p className="text-pink-bonnas/80 text-base italic mb-8 leading-relaxed">{post.excerpt}</p>

        <div className="text-sand text-base leading-relaxed whitespace-pre-line">
          {post.body}
        </div>

        <div className="mt-12 bg-ember border border-gold-dust rounded-2xl p-6 text-center">
          <p className="text-cream font-semibold mb-2">Ready to order?</p>
          <p className="text-sand text-sm mb-4">Authentic Bangladeshi food delivered to your door in London</p>
          <Link to="/menu" className="inline-flex items-center bg-pink-bonnas text-night px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-pink-dark transition-colors">
            View Our Menu →
          </Link>
        </div>

      </div>
    </article>
  );
}