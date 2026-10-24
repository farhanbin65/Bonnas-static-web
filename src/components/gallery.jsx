import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Search, X, ZoomIn } from "lucide-react";
import { client, urlFor } from "../lib/sanityClient";
import imageLibrary from "../../scripts/images.json";
import TiltCard from "./TiltCard";
import "./gallery.css";

const originalPhotos = Array.from({ length: 10 }, (_, index) => {
  const image = imageLibrary.local_images.find((entry) => entry.path === `/photos/a${index + 1}.jpeg`);
  return { id: image.path, title: image.name, alt: image.alt, description: `${image.name} · ${image.category}`,
    tags: image.tags, src: image.path, full: image.path };
});
const metadata = new Map(imageLibrary.local_images.filter((image) => image.sanity_id).map((image) => [image.sanity_id, image]));
const fallback = imageLibrary.local_images.filter((image) => image.sanity_id).map((image) => ({
  id: image.sanity_id, title: image.name, alt: image.alt, description: image.alt,
  tags: image.tags, src: `${image.path}?w=640&h=480&fit=crop&auto=format`, full: `${image.path}?w=1600&auto=format`,
}));

export default function Gallery() {
  const [photos, setPhotos] = useState([...originalPhotos, ...fallback]);
  const [query, setQuery] = useState("");
  const [interacting, setInteracting] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [offline, setOffline] = useState(false);
  const dialog = useRef(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    let active = true;
    client.fetch(`*[_type == "galleryImage" && !(_id in path("drafts.**")) && visible != false && defined(image.asset)] | order(displayOrder asc, title asc) {_id, title, alt, description, tags, image}`).then((items) => {
      if (!active) return;
      setPhotos([...originalPhotos, ...items.map((item) => {
        const saved = metadata.get(item._id);
        return { id: item._id, title: item.title, alt: item.alt || saved?.alt || item.title,
          description: item.description || saved?.alt || item.alt || "",
          tags: [...(item.tags || []), ...(saved?.tags || [])],
          src: urlFor(item.image).width(640).height(480).fit("crop").auto("format").url(),
          full: urlFor(item.image).width(1600).auto("format").url() };
      })]);
    }).catch(() => { if (active) setOffline(true); });
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    return photos.filter((photo) => {
      const text = [photo.title, photo.description, ...photo.tags].join(" ").toLowerCase();
      return terms.every((term) => text.includes(term));
    });
  }, [photos, query]);
  const moving = !reduceMotion && !query.trim() && filtered.length > 8;
  const photoRows = moving
    ? [filtered.filter((_, index) => index % 2 === 0), filtered.filter((_, index) => index % 2 === 1)]
    : [filtered];

  useEffect(() => {
    if (lightbox) dialog.current?.showModal();
    else if (dialog.current?.open) dialog.current.close();
  }, [lightbox]);

  return (
    <section id="gallery" className="py-20 px-5 md:px-12 bg-night min-h-[650px]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <p className="text-pink-bonnas text-xs font-semibold tracking-[0.25em] uppercase mb-3">From the BONNAS kitchen</p>
            <h2 className="text-3xl md:text-4xl font-bold text-cream">A taste of home</h2>
            <p className="text-sand text-sm mt-3">Explore our food gallery. A little inspiration for your next gathering.</p>
          </div>
          <label className="flex items-center gap-2 border border-gold-dust rounded-full px-4 py-2.5 text-sand bg-white/5 focus-within:border-pink-bonnas md:w-72">
            <Search size={16} aria-hidden="true" />
            <span className="sr-only">Search food photos</span>
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find biryani, snacks, polao…" className="bg-transparent outline-none text-sm text-cream w-full min-w-0" />
          </label>
        </div>
        {offline && <p className="text-sand text-xs mb-4" role="status">Showing saved photos while the live gallery is unavailable.</p>}
        <div onMouseEnter={() => setInteracting(true)} onMouseLeave={() => setInteracting(false)} onFocusCapture={() => setInteracting(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false); }}>
          <div className={`gallery-window ${moving ? "gallery-window-moving" : ""}`}>
            {photoRows.map((row, rowIndex) => (
              <div key={rowIndex} className={moving ? "gallery-stream" : ""}>
            <div className={moving ? "gallery-track" : ""} style={moving ? { animationDuration: `${row.length * 6}s`, animationDirection: rowIndex === 1 ? "reverse" : "normal", animationPlayState: interacting || lightbox ? "paused" : "running" } : undefined}>
              {(moving ? [0, 1] : [0]).map((copy) => (
                <div key={copy} className={moving ? "gallery-lane" : "grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"} aria-hidden={copy === 1 ? true : undefined}>
              {row.map((photo, index) => (
                <TiltCard key={`${photo.id}-${index}`} className="relative rounded-2xl overflow-hidden border border-gold-dust hover:border-pink-bonnas/50 group shadow-xl">
                  <button type="button" tabIndex={copy === 1 ? -1 : undefined} onClick={() => setLightbox(photo)} className="block w-full aspect-[4/3] relative text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-pink-bonnas focus-visible:-outline-offset-4" aria-label={`View ${photo.title}`}>
                    <img src={photo.src} alt={photo.alt} width="640" height="480" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 motion-reduce:transition-none" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                    <ZoomIn size={18} className="absolute right-3 top-3 text-white opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 inset-x-0 p-3 md:p-4 text-white">
                      <p className="font-semibold text-sm capitalize">{photo.title.replaceAll("_", " ")}</p>
                      <p className="text-xs text-white/80 mt-1 max-h-0 overflow-hidden opacity-0 group-hover:max-h-24 group-hover:opacity-100 group-focus-within:max-h-24 group-focus-within:opacity-100 transition-all duration-300">{photo.description}</p>
                    </div>
                  </button>
                </TiltCard>
              ))}
                </div>
              ))}
            </div>
              </div>
            ))}
          </div>
          {!filtered.length && <p className="text-sand text-center py-24" role="status">{query ? "No matching dishes. Try another search." : "Photos will appear here when published."}</p>}
          <p className="text-sand text-xs mt-6" aria-live="polite">{filtered.length} photos</p>
        </div>
      </div>
      <dialog ref={dialog} onCancel={() => setLightbox(null)} onClose={() => setLightbox(null)} onClick={(event) => { if (event.target === event.currentTarget) setLightbox(null); }} className="bg-transparent text-white w-full max-w-4xl p-4 backdrop:bg-black/90" aria-labelledby="gallery-photo-title">
        {lightbox && <div className="relative bg-night rounded-2xl overflow-hidden border border-gold-dust">
          <button autoFocus type="button" onClick={() => setLightbox(null)} aria-label="Close photo" className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/70 text-white"><X size={22} /></button>
          <img src={lightbox.full} alt={lightbox.alt} className="w-full max-h-[70vh] object-contain" />
          <div className="p-5"><h3 id="gallery-photo-title" className="text-xl font-semibold capitalize">{lightbox.title.replaceAll("_", " ")}</h3><p className="text-sm text-sand mt-2">{lightbox.description}</p></div>
        </div>}
      </dialog>
    </section>
  );
}
