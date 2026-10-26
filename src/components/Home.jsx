import { lazy } from "react";
import DeferredSection from "./DeferredSection";
import { Helmet } from "react-helmet-async";
import Hero from "./hero";
import About from "./about";
import Services from "./services";
import MenuTeaser from "./menuTeaser";
const Gallery = lazy(() => import("./gallery"));
import Reservations from "./reservations";
const Social = lazy(() => import("./social"));
const Contact = lazy(() => import("./contact"));

export default function Home() {
  return (
    <>
      <Helmet>
        <title>Bonna's | Authentic Bangladeshi Catering & Home Cooked Food in London</title>
        <meta name="description" content="Halal Bangladeshi home catering in London. Authentic Bengali home cooked meals, event catering and food delivery. Order online from Bonna's today." />
        <link rel="canonical" href="https://www.bonnas.co.uk/" />
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
      <MenuTeaser />
      <DeferredSection id="gallery" label="Loading gallery"><Gallery /></DeferredSection>
      <Reservations />
      <DeferredSection id="social" label="Loading social"><Social /></DeferredSection>
      <DeferredSection id="interactive" label="Loading contact"><Contact /></DeferredSection>
    </>
  );
}