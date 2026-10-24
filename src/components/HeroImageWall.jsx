import imageLibrary from "../../scripts/images.json";
import "./hero-image-wall.css";

const photos = imageLibrary.local_images
  .filter((image) => image.sanity_id || /^\/photos\/a\d+\.jpeg$/.test(image.path))
  .map((image) => image.sanity_id
    ? `${image.path}?w=600&h=450&fit=crop&auto=format`
    : image.path);
const rows = Array.from({ length: 3 }, (_, row) => photos.filter((_, index) => index % 3 === row));

export default function HeroImageWall() {
  return (
    <div className="hero-image-wall" aria-hidden="true">
      <div className="hero-image-wall-plane">
        {rows.map((images, row) => (
          <div className="hero-image-wall-row" key={row}>
            <div className="hero-image-wall-track" style={{ "--wall-duration": `${images.length * (row === 1 ? 5 : 6)}s` }}>
              {[0, 1].map((copy) => (
                <div className="hero-image-wall-group" key={copy}>
                  {images.map((src, index) => (
                    <img key={src} src={src} alt="" width="600" height="450"
                      loading={copy === 0 && index < 3 ? "eager" : "lazy"}
                      fetchPriority={row === 0 && copy === 0 && index === 0 ? "high" : "auto"}
                      decoding="async" className="hero-image-wall-photo" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
