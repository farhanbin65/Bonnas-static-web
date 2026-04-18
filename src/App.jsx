import Navbar from "./components/navbar";
import Hero from "./components/hero";
import About from "./components/about";
import Services from "./components/services";
import Menu from "./components/menu";
import Gallery from "./components/gallery";
import Social from "./components/social";
import Contact from "./components/contact";

export default function App() {
  return (
    <div>
      <Navbar />
      <Hero />
      <About />
      <Services />
      <Menu />
      <Gallery />
      <Social />
      <Contact />
    </div>
  );
}
