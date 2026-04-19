import { FaFacebookF, FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa";

export default function Contact() {
  return (
    <section id="contact" className="py-20 px-8 md:px-20">
      <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center text-black">
        Contact Us
      </h2>

      <div className="text-center space-y-4 mb-6">
        <p className="text-black">Email: sbcuicuisine@gmail.com</p>
        <p className="text-black">Location: London, UK</p>
      </div>

      {/* Email Us Button */}
      <div className="text-center mb-6">
        <a
          href="mailto:sbcuicuisine@gmail.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-6 py-3 bg-black text-white font-semibold rounded hover:bg-gray-800 transition"
        >
          Email Us
        </a>
      </div>


      {/* Social Links */}
      <div className="flex justify-center space-x-6 text-black text-2xl">
        <a
          href="https://www.facebook.com/bonnas.cooking1"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-600 transition"
        >
          <FaFacebookF />
        </a>
        <a
          href="https://instagram.com/bonnas_cuisine"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-600 transition"
        >
          <FaInstagram />
        </a>
        <a
          href="https://www.tiktok.com/@sharanika.cuisine"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-600 transition"
        >
          <FaTiktok />
        </a>
        <a
          href="https://www.youtube.com/@bonnas.cooking"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-600 transition"
        >
          <FaYoutube />
        </a>
      </div>
    </section>
  );
}
