import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/navbar";
import Hero from "./components/hero";
import About from "./components/about";
import Services from "./components/services";
import MenuTeaser from "./components/menuTeaser";
import Gallery from "./components/gallery";
import Social from "./components/social";
import Contact from "./components/contact";
import Menu from "./components/menu";

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
      <Routes>
        <Route path="/" element={
          <>
            <Hero />
            <About />
            <Services />
            <MenuTeaser />
            <Gallery />
            <Social />
            <Contact />
          </>
        } />
        <Route path="/menu" element={<Menu />} />
      </Routes>
    </BrowserRouter>
  );
}