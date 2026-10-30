import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './menu-viewer.css';

export const MENU_PAGES = [1, 2, 3, 4].map(page => `/photos/menu${page}.png`);
export const MENU_PDF = '/menu.pdf?v=20261029';

export default function MenuViewer({ initialPage = 0, onClose }) {
  const [page, setPage] = useState(initialPage);
  const [zoom, setZoom] = useState(false);
  const dialog = useRef(null);
  const touch = useRef(null);
  const move = delta => { setPage(value => Math.max(0, Math.min(MENU_PAGES.length - 1, value + delta))); setZoom(false); };
  useEffect(() => {
    const element = dialog.current;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    element.showModal();
    return () => { element.close(); document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  return createPortal(
    <dialog ref={dialog} className="menu-viewer" aria-label="Bonna’s four-page menu" onCancel={onClose} onKeyDown={event => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1); }
    }}>
      <div className="menu-viewer-layout">
        <header className="menu-viewer-toolbar">
          <strong>Menu</strong>
          <a href={MENU_PDF}>Menu</a>
          <button type="button" onClick={onClose} aria-label="Close menu">✕</button>
        </header>
        <div className={`menu-viewer-page ${zoom ? 'is-zoomed' : ''}`}
          onTouchStart={event => { touch.current = event.touches.length === 1 ? {x:event.touches[0].clientX,y:event.touches[0].clientY} : null; }}
          onTouchMove={event => { if(event.touches.length !== 1) touch.current = null; }}
          onTouchCancel={() => { touch.current = null; }}
          onTouchEnd={event => {
            const start=touch.current; touch.current=null;
            if(!start || zoom || !event.changedTouches.length) return;
            const dx=event.changedTouches[0].clientX-start.x, dy=event.changedTouches[0].clientY-start.y;
            if(Math.abs(dx)>55 && Math.abs(dx)>Math.abs(dy)*1.5) move(dx<0?1:-1);
          }}>
          <img src={MENU_PAGES[page]} alt={`Bonna’s menu page ${page + 1} of 4`} draggable="false" />
        </div>
        <footer className="menu-viewer-controls">
          <button type="button" disabled={page === 0} onClick={() => move(-1)} aria-label="Previous menu page">←</button>
          <span aria-live="polite">{page + 1} / 4</span>
          <button type="button" disabled={page === 3} onClick={() => move(1)} aria-label="Next menu page">→</button>
          <button type="button" onClick={() => setZoom(value => !value)} aria-pressed={zoom}>{zoom ? 'Fit page' : 'Zoom in'}</button>
          <span className="menu-swipe-hint">Swipe to turn pages</span>
        </footer>
      </div>
    </dialog>, document.body);
}
