import { useEffect, useState } from "react";

const FB_PAGE_ID = import.meta.env.VITE_FB_PAGE_ID;
const FB_TOKEN = import.meta.env.VITE_FB_ACCESS_TOKEN;
const YT_KEY = import.meta.env.VITE_YT_API_KEY;
const YT_CHANNEL_ID = import.meta.env.VITE_YT_CHANNEL_ID;

export default function Social() {
const [ytVideos, setYtVideos] = useState([]);
  const [ytStats, setYtStats] = useState(null);
  const [fbPosts, setFbPosts] = useState([]);
  const [fbStats, setFbStats] = useState(null);
  const [fbLive, setFbLive] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // YouTube latest videos
        const ytVideosRes = await fetch(
          `https://www.googleapis.com/youtube/v3/search?key=${YT_KEY}&channelId=${YT_CHANNEL_ID}&part=snippet,id&order=date&maxResults=4&type=video`
        );
        const ytVideosData = await ytVideosRes.json();
        setYtVideos(ytVideosData.items || []);

        // YouTube channel stats
        const ytStatsRes = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?key=${YT_KEY}&id=${YT_CHANNEL_ID}&part=statistics`
        );
        const ytStatsData = await ytStatsRes.json();
        setYtStats(ytStatsData.items?.[0]?.statistics || null);

        // Facebook page stats
        const fbStatsRes = await fetch(
          "https://graph.facebook.com/v25.0/" + FB_PAGE_ID + "?fields=fan_count,followers_count,name&access_token=" + FB_TOKEN
        );
        const fbStatsData = await fbStatsRes.json();
        setFbStats(fbStatsData);

        // Facebook latest posts
        const fbPostsRes = await fetch(
          "https://graph.facebook.com/v25.0/" + FB_PAGE_ID + "/posts?fields=id,message,created_time,full_picture,permalink_url&limit=8&access_token=" + FB_TOKEN
        );
        const fbPostsData = await fbPostsRes.json();
        setFbPosts(fbPostsData.data || []);

        // Facebook live check
        const fbLiveRes = await fetch(
          "https://graph.facebook.com/v25.0/" + FB_PAGE_ID + "/live_videos?status=LIVE&fields=id,title,embed_html&access_token=" + FB_TOKEN
        );
        const fbLiveData = await fbLiveRes.json();
        setFbLive(fbLiveData.data?.[0] || null);

      } catch (err) {
        console.error("Social fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const formatCount = (num) => {
    if (!num) return "—";
    const n = parseInt(num);
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return n.toString();
  };

  return (
    <section id="social" className="py-20 px-8 md:px-20 bg-gray-100">
      <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-black">
        Our Social Media
      </h2>

      {/* ── STATS ── */}
      <div className="flex flex-col gap-6 mb-16">

        {/* YouTube Stats */}
        <h1 className="text-lg font-semibold text-black mb-3">Youtube</h1>
        <div className="stats shadow bg-white">
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-figure text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block h-8 w-8 stroke-current">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="stat-title text-black">Total Subscribers</div>
              <div className="stat-value text-primary">
                {loading ? "..." : formatCount(ytStats?.subscriberCount)}
              </div>
              <div className="stat-desc text-black">YouTube Channel</div>
            </div>

            <div className="stat">
              <div className="stat-figure text-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block h-8 w-8 stroke-current">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="stat-title text-black">Total Views</div>
              <div className="stat-value text-secondary">
                {loading ? "..." : formatCount(ytStats?.viewCount)}
              </div>
              <div className="stat-desc text-black">All time</div>
            </div>

            <div className="stat">
              <div className="stat-figure text-secondary">
                <div className="avatar avatar-online">
                  <div className="w-16 rounded-full">
                    <img src="/logo.PNG" alt="logo" />
                  </div>
                </div>
              </div>
              <div className="stat-title text-black">Total Videos</div>
              <div className="stat-value">
                {loading ? "..." : formatCount(ytStats?.videoCount)}
              </div>
              <div className="stat-desc text-secondary">Published</div>
            </div>
          </div>
        </div>

        {/* Facebook Stats */}
        <h1 className="text-lg font-semibold text-black mb-3">Facebook</h1>
        <div className="stats shadow bg-white">
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-figure text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block h-8 w-8 stroke-current">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="stat-title text-black">Page Followers</div>
              <div className="stat-value text-primary">
                {loading ? "..." : formatCount(fbStats?.followers_count)}
              </div>
              <div className="stat-desc text-black">Facebook Page</div>
            </div>

            <div className="stat">
              <div className="stat-figure text-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block h-8 w-8 stroke-current">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="stat-title text-black">Page Likes</div>
              <div className="stat-value text-secondary">
                {loading ? "..." : formatCount(fbStats?.fan_count)}
              </div>
              <div className="stat-desc text-black">All time</div>
            </div>

            <div className="stat">
              <div className="stat-figure text-secondary">
                <div className="avatar avatar-online">
                  <div className="w-16 rounded-full">
                    <img src="/logo.PNG" alt="logo" />
                  </div>
                </div>
              </div>
              <div className="stat-title text-black">Page Name</div>
              <div className="stat-value text-sm pt-2">
                {loading ? "..." : fbStats?.name || "Bonna's"}
              </div>
              <div className="stat-desc text-secondary">
                <a
                  href={"https://facebook.com/" + FB_PAGE_ID}
                  target="_blank"
                  rel="noreferrer"
                  className="underline text-blue-500"
                >
                  Visit Page
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FACEBOOK LIVE BANNER ── */}
      {fbLive && (
        <div className="mb-10 border-2 border-red-500 rounded-xl p-5 bg-white">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
              🔴 LIVE NOW
            </span>
            <span className="font-semibold text-black">
              {fbLive.title || "Live on Facebook"}
            </span>
          </div>
          {fbLive.embed_html ? (
            <div dangerouslySetInnerHTML={{ __html: fbLive.embed_html }} className="w-full" />
          ) : (
            <a
              href={"https://facebook.com/" + FB_PAGE_ID + "/videos"}
              target="_blank"
              rel="noreferrer"
              className="btn btn-error btn-sm"
            >
              Watch Live on Facebook →
            </a>
          )}
        </div>
      )}

      {/* ── FACEBOOK POSTS ── */}
      {fbPosts.length > 0 && (
        <div className="mb-16">
          <h3 className="text-2xl font-semibold mb-6 text-center text-black">
            📘 Latest from Facebook
          </h3>
          <div className="grid gap-6 md:grid-cols-4">
            {fbPosts.map((post) => (
              <a
                key={post.id}
                href={post.permalink_url}
                target="_blank"
                rel="noreferrer"
                className="bg-white rounded-xl shadow overflow-hidden hover:shadow-lg transition-shadow"
              >
                {post.full_picture && (
                  <img
                    src={post.full_picture}
                    alt="post"
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <p className="text-sm text-gray-700 mb-2 line-clamp-3">
                    {post.message || "View post on Facebook"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(post.created_time).toLocaleDateString("en-GB", {
                      day: "numeric", month: "long", year: "numeric",
                    })}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ── YOUTUBE LATEST VIDEOS ── */}
      <h3 className="text-2xl font-semibold mb-6 text-center text-black">
        ▶️ Latest Videos
      </h3>

      {loading ? (
        <div className="flex justify-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : ytVideos.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {ytVideos.map((video) => (
            <iframe
              key={video.id.videoId}
              src={"https://www.youtube.com/embed/" + video.id.videoId}
              title={video.snippet.title}
              height="260"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded-xl shadow w-full"
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No videos found.</p>
      )}
    </section>
  );
}