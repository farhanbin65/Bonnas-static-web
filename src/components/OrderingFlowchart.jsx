import { createElement } from 'react';
import { Utensils, MessageCircle, CreditCard, MapPin, Smile, ArrowDown, Mail } from 'lucide-react';

const steps = [
  { title: 'Choose', desc: 'Select your dishes', icon: Utensils },
  { title: 'Contact', desc: 'Send your order', icon: MessageCircle },
  { title: 'Pay', desc: '100% upfront to confirm', icon: CreditCard },
  { title: 'Collect', desc: 'From E2 0RB', icon: MapPin },
  { title: 'Enjoy', desc: 'Fresh Bengali food', icon: Smile },
];

export default function OrderingFlowchart() {
  return <section aria-labelledby="order-flow-heading" className="py-8 lg:py-16 px-3 sm:px-6 lg:px-20 bg-night">
    <div className="max-w-7xl mx-auto">
      <header className="text-center mb-5 lg:mb-10">
        <h2 id="order-flow-heading" className="text-2xl lg:text-4xl font-bold text-cream">How to Order</h2>
        <p className="mt-2 text-xs sm:text-sm text-sand">Five simple steps. Please pre-order at least two days ahead.</p>
      </header>
      <ol className="mx-auto max-w-2xl flex flex-col gap-3">
        {steps.map(({ title, desc, icon: Icon }, index) => <li key={title} className="relative min-w-0 flex items-center gap-3 rounded-xl border border-gold-dust bg-ember px-3 py-2.5 sm:px-5 sm:py-3">
          <span className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-pink-bonnas/15 text-pink-bonnas">
            {createElement(Icon, { "aria-hidden": true, className: "h-5 w-5" })}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm sm:text-base font-bold text-cream"><span className="text-pink-bonnas mr-2">{index + 1}.</span>{title}</h3>
            <p className="mt-0.5 text-xs sm:text-sm leading-snug text-sand break-words">{desc}</p>
          </div>
          {index < 4 && <ArrowDown aria-hidden="true" className="absolute left-1/2 -bottom-3 h-3 w-3 text-pink-bonnas bg-night rounded-full z-10" />}
        </li>)}
      </ol>
      <div className="mt-5 lg:mt-8 flex flex-wrap justify-center gap-3">
        <a href="https://wa.me/447912795556" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-pink-bonnas text-night text-sm font-semibold"><MessageCircle size={17} aria-hidden="true" />WhatsApp</a>
        <a href="mailto:orders@bonnas.co.uk" className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-gold-dust text-cream text-sm"><Mail size={17} aria-hidden="true" />Email</a>
      </div>
    </div>
  </section>;
}
