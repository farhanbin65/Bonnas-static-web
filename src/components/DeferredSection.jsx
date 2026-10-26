import { Suspense, useEffect, useRef, useState } from 'react';
import LoadingSkeleton from './LoadingSkeleton';

export default function DeferredSection({ id, label, children }) {
  const container = useRef(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const reveal = () => setReady(true);
    const followHash = () => {
      if (window.location.hash === `#${id}`) reveal();
    };
    followHash();
    window.addEventListener('hashchange', followHash);
    if (!('IntersectionObserver' in window)) {
      reveal();
      return () => window.removeEventListener('hashchange', followHash);
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        reveal();
        observer.disconnect();
      }
    }, { rootMargin: '300px' });
    observer.observe(container.current);
    return () => { observer.disconnect(); window.removeEventListener('hashchange', followHash); };
  }, [id]);
  return (
    <div ref={container} id={ready ? undefined : id}>
      {ready ? <Suspense fallback={<LoadingSkeleton label={label} />}>{children}</Suspense> : <LoadingSkeleton label={label} />}
    </div>
  );
}
