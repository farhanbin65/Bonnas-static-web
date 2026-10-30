import { useState } from 'react';
import MenuViewer, { MENU_PAGES, MENU_PDF } from './MenuViewer';
export default function MenuPreviewGrid() {
  const [selected, setSelected] = useState(null);
  return <div className="mt-16 border-t border-gold-dust pt-12 max-w-7xl mx-auto">
    <h3 className="text-xl font-semibold text-center text-cream mb-2">Our four-page menu</h3>
    <p className="text-center text-sand text-sm mb-8">Tap a page to enlarge, then swipe through the menu.</p>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {MENU_PAGES.map((src, index) => <button type="button" key={src} onClick={() => setSelected(index)} aria-label={`Open menu page ${index + 1}`} className="border border-gold-dust rounded-xl p-2 focus-visible:ring-2 focus-visible:ring-pink-bonnas">
        <img src={src} alt={`Menu page ${index + 1}`} loading="lazy" decoding="async" className="w-full aspect-[1414/2000] object-contain rounded-lg" />
      </button>)}
    </div>
    <div className="flex flex-wrap justify-center gap-4 text-pink-bonnas">
      <a href={MENU_PDF} className="border border-pink-bonnas rounded-full px-6 py-3">Menu</a>
    </div>
    {selected !== null && <MenuViewer initialPage={selected} onClose={() => setSelected(null)} />}
  </div>;
}
