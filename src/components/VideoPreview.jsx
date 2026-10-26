import { useState } from 'react';
import { PlayCircle } from 'lucide-react';

export default function VideoPreview({ video }) {
  const [playing, setPlaying] = useState(false);
  return playing ? (
    <iframe src={`https://www.youtube-nocookie.com/embed/${video.id.videoId}?autoplay=1`}
      title={video.snippet.title} width="560" height="315"
      allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen className="aspect-video w-full h-auto" />
  ) : (
    <button type="button" onClick={() => setPlaying(true)} aria-label={`Play ${video.snippet.title}`}
      className="relative block aspect-video w-full bg-ember text-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-pink-bonnas">
      <img src={video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.medium?.url}
        alt="" width="480" height="360" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
      <span className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/50 p-4">
        <PlayCircle size={48} aria-hidden="true" /><span className="text-sm">{video.snippet.title}</span>
      </span>
    </button>
  );
}
