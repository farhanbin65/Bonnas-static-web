import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PlayCircle, ThumbsUp, Radio } from "lucide-react";
import { fadeUp, fadeInLeft, fadeInRight, staggerContainer, staggerItem, scrollRevealViewport } from "../lib/motion";
import TiltCard from "./TiltCard";

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
        const YT_CACHE_KEY = "yt_cache";
        const YT_CACHE_TTL = 1000 * 60 * 60 * 3;
        const cached = localStorage.getItem(YT_CACHE_KEY);
        const cachedTime = localStorage.getItem(YT_CACHE_KEY + "_time");
        const isExpired = !cachedTime || Date.now() - parseInt(cachedTime) > YT_CACHE_TTL;

        if (cached && !isExpired) {
          const { videos, stats } = JSON.parse(cached);
          setYtVideos(videos);
          setYtStats(stats);
        } else {
          const ytVideosRes = await fetch(
            "https://www.googleapis.com/youtube/v3/search?key=" + YT_KEY + "&channelId=" + YT_CHANNEL_ID + "&part=snippet,id&order=date&maxResults=4&type=video"
          );
          const ytVideosData = await ytVideosRes.json();
          const ytStatsRes = await fetch(
            "https://www.googleapis.com/youtube/v3/channels?key=" + YT_KEY + "&id=" + YT_CHANNEL_ID + "&part=statistics"
          );
          const ytStatsData = await ytStatsRes.json();
          const videos = ytVideosData.items || [];
          const stats = ytStatsData.items?.[0]?.statistics || null;
          setYtVideos(videos);
          setYtStats(stats);
          localStorage.setItem(YT_CACHE_KEY, JSON.stringify({ videos, stats }));
          localStorage.setItem(YT_CACHE_KEY + "_time", Date.now().toString());
        }

        const fbStatsRes = await fetch(
          "https://graph.facebook.com/v25.0/" + FB_PAGE_ID + "?fields=fan_count,followers_count,name&access_token=" + FB_TOKEN
        );
        const fbStatsData = await fbStatsRes.json();
        setFbStats(fbStatsData);

        const fbPostsRes = await fetch(
          "https://graph.facebook.com/v25.0/" + FB_PAGE_ID + "/posts?fields=id,message,created_time,full_picture,permalink_url&limit=8&access_token=" + FB_TOKEN
        );
        const fbPostsData = await fbPostsRes.json();
        setFbPosts(fbPostsData.data || []);

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

  const StatCard = ({ label, value, sub }) => (
    <div className="bg-night border border-gold-dust rounded-2xl p-5 flex flex-col gap-1">
      <p className="text-sand text-xs">{label}</p>
      <p className="text-pink-bonnas text-2xl font-bold">{loading ? "…" : value}</p>
      <p className="text-sand text-xs">{sub}</p>
    </div>
  );

  return (
    <section id="social" className="py-20 px-6 md:px-20 bg-night">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          className="text-center mb-12"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={scrollRevealViewport}
        >
          <p className="text-pink-bonnas text-sm font-semibold tracking-widest uppercase mb-2">Follow Along</p>
          <h2 className="text-3xl md:text-4xl font-bold text-cream">Our Social Media</h2>
          <p className="text-sand text-sm mt-2">Stay connected with Bonna's latest content</p>
        </motion.div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">

          {/* YouTube */}
          <motion.div
            className="bg-ember border border-gold-dust rounded-2xl p-6"
            variants={fadeInLeft}
            initial="hidden"
            whileInView="visible"
            viewport={scrollRevealViewport}
          >
            <div className="flex items-center gap-2 mb-5">
              <PlayCircle className="w-5 h-5 text-pink-bonnas" strokeWidth={1.75} />
              <p className="text-cream font-semibold text-sm">YouTube</p>
              <a href={"https://youtube.com/@bonnas.cooking"} target="_blank" rel="noreferrer"
                className="ml-auto text-pink-bonnas text-xs hover:underline">Visit Channel →</a>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Subscribers" value={formatCount(ytStats?.subscriberCount)} sub="YouTube" />
              <StatCard label="Total Views"  value={formatCount(ytStats?.viewCount)}       sub="All time" />
              <StatCard label="Videos"       value={formatCount(ytStats?.videoCount)}      sub="Published" />
            </div>
          </motion.div>

          {/* Facebook */}
          <motion.div
            className="bg-ember border border-gold-dust rounded-2xl p-6"
            variants={fadeInRight}
            initial="hidden"
            whileInView="visible"
            viewport={scrollRevealViewport}
          >
            <div className="flex items-center gap-2 mb-5">
              <ThumbsUp className="w-5 h-5 text-pink-bonnas" strokeWidth={1.75} />
              <p className="text-cream font-semibold text-sm">Facebook</p>
              <a href={"https://facebook.com/" + FB_PAGE_ID} target="_blank" rel="noreferrer"
                className="ml-auto text-pink-bonnas text-xs hover:underline">Visit Page →</a>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Followers"  value={formatCount(fbStats?.followers_count)} sub="Facebook" />
              <StatCard label="Page Likes" value={formatCount(fbStats?.fan_count)}       sub="All time" />
              <StatCard label="Page"       value={fbStats?.name || "Bonna's"}            sub="Name" />
            </div>
          </motion.div>

        </div>

        {/* FACEBOOK LIVE */}
        {fbLive && (
          <motion.div
            className="mb-12 border-2 border-red-500/60 bg-ember rounded-2xl p-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse flex items-center gap-1.5">
                <Radio className="w-3 h-3" />
                LIVE NOW
              </span>
              <span className="font-semibold text-cream text-sm">
                {fbLive.title || "Live on Facebook"}
              </span>
            </div>
            {fbLive.embed_html ? (
              <div dangerouslySetInnerHTML={{ __html: fbLive.embed_html }} className="w-full rounded-xl overflow-hidden" />
            ) : (
              <a href={"https://facebook.com/" + FB_PAGE_ID + "/videos"} target="_blank" rel="noreferrer"
                className="inline-flex items-center bg-red-500 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-red-600 transition-colors">
                Watch Live on Facebook →
              </a>
            )}
          </motion.div>
        )}

        {/* FACEBOOK POSTS */}
        {fbPosts.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-cream">Latest from Facebook</h3>
              <a href={"https://facebook.com/" + FB_PAGE_ID} target="_blank" rel="noreferrer"
                className="text-pink-bonnas text-xs hover:underline">See all →</a>
            </div>
            <motion.div
              className="grid gap-5 sm:grid-cols-2 md:grid-cols-4"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={scrollRevealViewport}
            >
              {fbPosts.map((post) => (
                <motion.div key={post.id} variants={staggerItem}>
                  <TiltCard className="h-full">
                    <a href={post.permalink_url} target="_blank" rel="noreferrer"
                      className="block h-full bg-ember border border-gold-dust hover:border-pink-bonnas/50 rounded-2xl overflow-hidden transition-colors group">
                      {post.full_picture && (
                        <div className="h-44 overflow-hidden">
                          <img src={post.full_picture} alt="post" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                      )}
                      <div className="p-4">
                        <p className="text-xs text-sand line-clamp-3 mb-2">
                          {post.message || "View post on Facebook"}
                        </p>
                        <p className="text-xs text-pink-bonnas/60">
                          {new Date(post.created_time).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                      </div>
                    </a>
                  </TiltCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}

        {/* YOUTUBE VIDEOS */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-cream">Latest Videos</h3>
            <a href={"https://youtube.com/@bonnas.cooking"} target="_blank" rel="noreferrer"
              className="text-pink-bonnas text-xs hover:underline">See all →</a>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 rounded-full border-2 border-pink-bonnas border-t-transparent animate-spin" />
            </div>
          ) : ytVideos.length > 0 ? (
            <motion.div
              className="grid gap-5 md:grid-cols-2"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={scrollRevealViewport}
            >
              {ytVideos.map((video) => (
                <motion.div key={video.id.videoId} variants={staggerItem} className="rounded-2xl overflow-hidden border border-gold-dust">
                  <iframe
                    src={"https://www.youtube.com/embed/" + video.id.videoId}
                    title={video.snippet.title}
                    height="260"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full"
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <p className="text-center text-sand">No videos found.</p>
          )}
        </div>

      </div>
    </section>
  );
}