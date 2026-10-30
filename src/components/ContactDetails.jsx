import { Link } from 'react-router-dom';

export default function ContactDetails() {
  return (
    <section id="contact" aria-labelledby="contact-heading" className="bg-night px-6 py-14 md:px-20 scroll-mt-24">
      <div className="max-w-6xl mx-auto rounded-2xl border border-gold-dust bg-ember p-6 md:p-8">
        <h2 id="contact-heading" className="text-2xl md:text-3xl font-bold text-cream">Contact Bonna’s</h2>
        <p className="mt-4 text-sand">Home-cooked Bangladeshi food, 100% halal and cooked fresh to order.</p>
        <p className="mt-2 text-sand">Collection only from E2 0RB, East London. Please pre-order at least two days ahead.</p>
        <p className="mt-2 text-sand">Browse the menu, then message us to arrange your order and collection.</p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Link to="/menu" className="rounded-full border border-gold-dust px-5 py-3 text-cream hover:border-pink-bonnas">Browse the menu</Link>
          <a href="https://wa.me/447912795556" target="_blank" rel="noreferrer" className="rounded-full bg-pink-bonnas px-5 py-3 font-semibold text-night hover:bg-pink-dark">Order on WhatsApp</a>
          <a href="mailto:orders@bonnas.co.uk" className="text-pink-bonnas underline break-all">orders@bonnas.co.uk</a>
        </div>
      </div>
    </section>
  );
}
