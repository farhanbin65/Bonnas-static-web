import { retiredBlogSlug, retainedBlogSlug } from "./lib/blogRedirects";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/navbar";
import Toast from "./components/Toast";
import MarketingConsent from "./components/MarketingConsent";
import Home from "./components/Home";
const Gallery = lazy(() => import("./components/gallery"));
const Menu = lazy(() => import("./components/menu"));
const Blog = lazy(() => import("./components/Blog"));
const BlogPost = lazy(() => import("./components/BlogPost"));
const Invoice = lazy(() => import("./components/invoice/Invoice"));
const BusinessSheet = lazy(() => import("./components/records/BusinessSheet"));
import Footer from "./components/footer";
import OrderingFlowchart from "./components/OrderingFlowchart"; // Import it

import LoadingSkeleton from "./components/LoadingSkeleton";

function SiteChrome({ children }) {
  const { pathname } = useLocation();
  return pathname === "/records" ? null : children;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <ScrollToTop />
        <SiteChrome><Navbar /><Toast /></SiteChrome>
        <Suspense fallback={<LoadingSkeleton />}><Routes>
          <Route path="/" element={<Home />} />
          <Route 
            path="/menu" 
            element={
              <>
                <OrderingFlowchart />
                <Menu />
              </>
            } 
          />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/blog" element={<Blog />} />
          <Route path={`/blog/${retiredBlogSlug}`} element={<Navigate to={`/blog/${retainedBlogSlug}`} replace />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/invoice" element={<Invoice />} />
          <Route path="/records" element={<BusinessSheet />} />
        </Routes></Suspense>
        <SiteChrome><Footer /></SiteChrome>
        <MarketingConsent />
        <Analytics />
      </BrowserRouter>
    </CartProvider>
  );
}
