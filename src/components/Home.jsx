import MenuSectionContent from "./menu-viewer/MenuSectionContent";
import ContactDetails from "./ContactDetails";
import PageMetadata from "./PageMetadata";
import { lazy } from "react";
import DeferredSection from "./DeferredSection";
import { Helmet } from "react-helmet-async";
import Hero from "./hero";
import About from "./about";
import Services from "./services";
const Gallery = lazy(() => import("./gallery"));
import Reservations from "./reservations";
const Social = lazy(() => import("./social"));
const Contact = lazy(() => import("./contact"));

export default function Home() {
  return (
    <>
      <PageMetadata path="/" title="Bonna's | Authentic Bangladeshi Catering & Home Cooked Food in London" description="Halal Bangladeshi home catering in East London. Collection only from E2 0RB. Please pre-order at least two days ahead." />
      <Helmet>
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "FoodEstablishment",
            "name": "Bonna's",
            "description": "Authentic Bangladeshi home catering service in London",
            "url": "https://www.bonnas.co.uk",
            "image": "https://www.bonnas.co.uk/logo.PNG",
            "servesCuisine": ["Bangladeshi", "Bengali", "South Asian"],
            "email": "hello@bonnas.co.uk",
            "areaServed": {
              "@type": "City",
              "name": "London"
            },
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "London",
              "addressCountry": "GB"
            }
          }
        `}</script>
      </Helmet>
      <Hero />
      <About />
      <Services />
      <section id="menu" aria-label="Menu and how to order" className="py-12 px-4 sm:px-6 md:px-20 bg-night">
        <MenuSectionContent />
      </section>
      <DeferredSection id="gallery" label="Loading gallery"><Gallery /></DeferredSection>
      <Reservations />
      <ContactDetails />
      <DeferredSection id="social" label="Loading social"><Social /></DeferredSection>
      <DeferredSection id="interactive" label="Loading games"><Contact /></DeferredSection>
    </>
  );
}