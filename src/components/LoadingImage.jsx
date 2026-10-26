import { useState } from 'react';

export default function LoadingImage({ src, alt, className = '', loading = 'lazy', ...props }) {
  const [finished, setFinished] = useState(null);
  const [failed, setFailed] = useState(null);
  return (
    <span className={`relative block overflow-hidden ${className}`}>
      {finished !== src && <span aria-hidden="true" className="loading-skeleton absolute inset-0" />}
      <img {...props} src={src} alt={alt} loading={loading} decoding="async"
        ref={(node) => { if (node?.complete && node.naturalWidth > 0 && finished !== src) setFinished(src); }}
        onLoad={() => setFinished(src)} onError={() => { setFinished(src); setFailed(src); }}
        className="block h-full w-full object-cover" />
      {failed === src && <span className="absolute inset-0 flex items-center justify-center bg-ember p-3 text-center text-xs text-sand">Image unavailable</span>}
    </span>
  );
}
