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
      <Routes>
        <Route path="/" element={
          <>
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
        <Route path="/menu"       element={<Menu />} />
        <Route path="/blog"       element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}