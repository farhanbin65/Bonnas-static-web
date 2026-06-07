import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { client } from "../lib/sanityClient";

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client
      .fetch(`*[_type == "blogPost"] | order(publishedAt desc) {
        _id, title, slug, excerpt, publishedAt, keywords
      }`)
      .then((data) => { setPosts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <section className="py-20 px-6 md:px-20 bg-night min-h-screen">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-12">
          <p className="text-pink-bonnas text-sm font-semibold tracking-widest uppercase mb-2">Fresh from the kitchen</p>
          <h1 className="text-3xl md:text-4xl font-bold text-cream">Bonna's Blog</h1>
          <p className="text-sand text-sm mt-2">Food stories, guides and inspiration from our kitchen to yours</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-pink-bonnas border-t-transparent animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <p className="text-center text-sand py-20">No posts yet — check back soon!</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link key={post._id} to={`/blog/${post.slug.current}`}
                className="bg-ember border border-gold-dust hover:border-pink-bonnas/50 rounded-2xl p-6 transition-colors group flex flex-col gap-3">

                <div className="flex flex-wrap gap-1.5">
                  {post.keywords?.slice(0, 2).map((k) => (
                    <span key={k} className="text-xs bg-pink-bonnas/10 text-pink-bonnas px-2 py-0.5 rounded-full">{k}</span>
                  ))}
                </div>

                <h2 className="text-cream font-semibold text-base leading-snug group-hover:text-pink-bonnas transition-colors flex-1">
                  {post.title}
                </h2>

                <p className="text-sand text-xs leading-relaxed line-clamp-2">{post.excerpt}</p>

                <div className="flex items-center justify-between pt-3 border-t border-gold-dust">
                  <p className="text-sand text-xs">
                    {new Date(post.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                  <span className="text-pink-bonnas text-xs">Read →</span>
                </div>

              </Link>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}