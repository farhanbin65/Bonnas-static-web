import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm px-6 py-4">
      <div className="flex justify-between items-center">
        {/* Logo + Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <img src="/logo.PNG" alt="Bonna's Logo" />
          </div>
          <h1 className="text-xl font-bold text-black">Bonna's</h1>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6 text-black font-medium">
          <a href="#about" className="hover:underline">About</a>
          <a href="#services" className="hover:underline">Services</a>
          <a href="#menu" className="hover:underline">Menu</a>
          <a href="#gallery" className="hover:underline">Gallery</a>
          <a href="#contact" className="hover:underline">Contact</a>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-black text-xl"
          onClick={() => setOpen(!open)}
        >
          {open ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden mt-4 flex flex-col space-y-4 text-black font-medium">
          <a href="#about" onClick={() => setOpen(false)}>About</a>
          <a href="#services" onClick={() => setOpen(false)}>Services</a>
          <a href="#menu" onClick={() => setOpen(false)}>Menu</a>
          <a href="#gallery" onClick={() => setOpen(false)}>Gallery</a>
          <a href="#contact" onClick={() => setOpen(false)}>Contact</a>
        </div>
      )}
    </nav>
  );
}
