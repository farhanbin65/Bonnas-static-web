import { useEffect, useRef, useState } from "react";
import { Polyline } from "react-leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { FaFacebookF, FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa";
import { motion } from "framer-motion";
import { MapPin, Mail, Clock, UtensilsCrossed, Navigation } from "lucide-react";
import { fadeUp, fadeInLeft, fadeInRight, staggerContainer, staggerItem, scrollRevealViewport } from "../lib/motion";

import "leaflet/dist/leaflet.css";

const BONNAS_POS = [51.5265, -0.0554];

const SOCIALS = [
  { icon: <FaFacebookF />,  href: "https://www.facebook.com/bonnas.cooking1",  label: "Facebook"  },
  { icon: <FaInstagram />,  href: "https://instagram.com/bonnas_cuisine",       label: "Instagram" },
  { icon: <FaTiktok />,     href: "https://www.tiktok.com/@bonnas.cuisine",     label: "TikTok"    },
  { icon: <FaYoutube />,    href: "https://www.youtube.com/@bonnas.cooking",    label: "YouTube"   },
];

const HOURS = [
  { day: "Monday – Friday", time: "12:00 – 21:00" },
  { day: "Saturday",        time: "11:00 – 22:00" },
  { day: "Sunday",          time: "11:00 – 21:00" },
];

const bonnasIcon = new L.DivIcon({
  html: `<div style="
    width:38px;height:38px;border-radius:50%;
    background:#F2A8B5;border:3px solid #fff;
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 0 0 4px rgba(242,168,181,0.35);">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0D0A07" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2c1 2 2 3 2 5a2 2 0 1 1-4 0c0-2 1-3 2-5Z"/>
      <path d="M5 13a7 7 0 0 1 14 0H5Z"/>
      <path d="M5 13h14v2a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-2Z"/>
    </svg>
  </div>`,
  className: "",
  iconSize: [38, 38],
  iconAnchor: [19, 19],
});

const userIcon = new L.DivIcon({
  html: `<div style="
    width:16px;height:16px;border-radius:50%;
    background:#fff;border:3px solid #F2A8B5;
    box-shadow:0 0 0 4px rgba(242,168,181,0.35);">
  </div>`,
  className: "",
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function FlyTo({ pos }) {
  const map = useMap();
  useEffect(() => {
    if (pos) {
      map.flyToBounds([BONNAS_POS, pos], { padding: [60, 60], duration: 1.4 });
    }
  }, [pos, map]);
  return null;
}
function RouteLine({ from, to }) {
  const [route, setRoute] = useState(null);

  useEffect(() => {
    if (!from || !to) return;

    const controller = new AbortController();

    async function fetchRoute() {
      try {
        // OSRM expects lng,lat order (opposite of Leaflet's lat,lng)
        const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;
        const res = await fetch(url, { signal: controller.signal });
        const data = await res.json();
        const coords = data.routes?.[0]?.geometry?.coordinates;
        if (coords) {
          // Convert back to [lat, lng] for Leaflet
          setRoute(coords.map(([lng, lat]) => [lat, lng]));
        }
      } catch (err) {
        if (err.name !== "AbortError") console.error("Route fetch error:", err);
      }
    }

    fetchRoute();
    return () => controller.abort();
  }, [from, to]);

  if (!route) return null;

  return (
    <Polyline
      positions={route}
      pathOptions={{ color: "#F2A8B5", weight: 4, opacity: 0.85 }}
    />
  );
}

export default function Contact() {
  const [userPos, setUserPos] = useState(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");

  const handleLocate = () => {
    setError("");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos([pos.coords.latitude, pos.coords.longitude]);
        setLocating(false);
      },
      () => {
        setError("Could not get your location. Please allow location access.");
        setLocating(false);
      }
    );
  };

  return (
    <section id="contact" className="py-20 px-6 md:px-20 bg-ember">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          className="text-center mb-12"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={scrollRevealViewport}
        >
          <p className="text-pink-bonnas text-sm font-semibold tracking-widest uppercase mb-2">Get In Touch</p>
          <h2 className="text-3xl md:text-4xl font-bold text-cream">Contact Us</h2>
          <p className="text-sand text-sm mt-2">Find us on the map or reach out directly</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-10">

          {/* MAP */}
          <motion.div
            className="flex flex-col gap-3"
            variants={fadeInLeft}
            initial="hidden"
            whileInView="visible"
            viewport={scrollRevealViewport}
          >

            {/* Locate button */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleLocate}
                disabled={locating}
                className="flex items-center gap-2 bg-pink-bonnas text-night px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-pink-dark transition-colors disabled:opacity-50"
              >
                <Navigation className="w-4 h-4" strokeWidth={2} />
                {locating ? "Locating…" : "Show my location"}
              </button>
              {userPos && (
                <span className="text-sand text-xs">Location found — map updated</span>
              )}
              {error && (
                <span className="text-red-400 text-xs">{error}</span>
              )}
            </div>

            {/* Map */}
            <div className="rounded-2xl overflow-hidden border border-gold-dust" style={{ height: "420px" }}>
              <MapContainer
                center={BONNAS_POS}
                zoom={14}
                style={{ height: "100%", width: "100%", background: "#0D0A07" }}
                zoomControl={false}
                scrollWheelZoom={false}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                  className="golden-tiles"
                />

                {/* Bonna's marker */}
                <Marker position={BONNAS_POS} icon={bonnasIcon}>
                  <Popup className="bonnas-popup">
                    <div style={{ background: "#1E160D", color: "#F5ECD7", padding: "6px 10px", borderRadius: "8px", fontSize: "13px", fontWeight: 600 }}>
                      Bonna's — London E2
                    </div>
                  </Popup>
                </Marker>

                {/* User marker */}
                {userPos && (
                  <Marker position={userPos} icon={userIcon}>
                    <Popup>
                      <div style={{ background: "#1E160D", color: "#F5ECD7", padding: "6px 10px", borderRadius: "8px", fontSize: "13px" }}>
                        You are here
                      </div>
                    </Popup>
                  </Marker>
                )}

                {userPos && <FlyTo pos={userPos} />}
                {userPos && <RouteLine from={userPos} to={BONNAS_POS} />}
              </MapContainer>
            </div>
          </motion.div>

          {/* RIGHT — details */}
          <motion.div
            className="flex flex-col gap-5"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={scrollRevealViewport}
          >

            {/* Address */}
            <motion.a
              variants={staggerItem}
              href="https://maps.google.com/?q=E2+London+UK"
              target="_blank"
              rel="noreferrer"
              className="flex items-start gap-4 bg-night border border-gold-dust hover:border-pink-bonnas/50 rounded-2xl p-5 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-pink-bonnas/10 border border-pink-bonnas/30 flex items-center justify-center shrink-0">
                <MapPin className="w-4.5 h-4.5 text-pink-bonnas" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-cream font-semibold text-sm">Location</p>
                <p className="text-sand text-xs mt-0.5">London, E2, UK</p>
                <p className="text-pink-bonnas text-xs mt-1 group-hover:underline">Get directions →</p>
              </div>
            </motion.a>

            {/* Email */}
            <motion.a
              variants={staggerItem}
              href="mailto:info@bonnas.co.uk"
              className="flex items-start gap-4 bg-night border border-gold-dust hover:border-pink-bonnas/50 rounded-2xl p-5 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-pink-bonnas/10 border border-pink-bonnas/30 flex items-center justify-center shrink-0">
                <Mail className="w-4.5 h-4.5 text-pink-bonnas" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-cream font-semibold text-sm">Email</p>
                <p className="text-sand text-xs mt-0.5">info@bonnas.co.uk</p>
                <p className="text-pink-bonnas text-xs mt-1 group-hover:underline">Send us an email →</p>
              </div>
            </motion.a>

            {/* Hours */}
            <motion.div variants={staggerItem} className="bg-night border border-gold-dust rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-pink-bonnas/10 border border-pink-bonnas/30 flex items-center justify-center shrink-0">
                  <Clock className="w-4.5 h-4.5 text-pink-bonnas" strokeWidth={1.75} />
                </div>
                <p className="text-cream font-semibold text-sm">Opening Hours</p>
              </div>
              <div className="flex flex-col gap-2">
                {HOURS.map((h) => (
                  <div key={h.day} className="flex justify-between items-center border-b border-gold-dust pb-2 last:border-0 last:pb-0">
                    <span className="text-sand text-xs">{h.day}</span>
                    <span className="text-cream text-xs font-medium">{h.time}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Socials */}
            <motion.div variants={staggerItem} className="bg-night border border-gold-dust rounded-2xl p-5">
              <p className="text-cream font-semibold text-sm mb-4">Follow Us</p>
              <div className="flex gap-3">
                {SOCIALS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.label}
                    className="w-10 h-10 rounded-full bg-pink-bonnas/10 border border-pink-bonnas/30 hover:bg-pink-bonnas hover:text-night text-pink-bonnas flex items-center justify-center transition-colors text-sm"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </motion.div>

          </motion.div>
        </div>
      </div>
    </section>
  );
}