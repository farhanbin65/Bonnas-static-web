import { Helmet } from "react-helmet-async";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/navbar";
import Hero from "./components/hero";
import About from "./components/about";
import Services from "./components/services";
import MenuTeaser from "./components/menuTeaser";
import Gallery from "./components/gallery";
import Reservations from "./components/reservations";
import Social from "./components/social";
import Contact from "./components/contact";
import Menu from "./components/menu";
import Blog from "./components/Blog";
import BlogPost from "./components/BlogPost";
import Footer from "./components/footer";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Navbar />
      <Route path="/" element={
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
          <Gallery />
          <Reservations />
          <Social />
          <Contact />
        </>
      } />
      <Footer />
    </BrowserRouter>
  );
}