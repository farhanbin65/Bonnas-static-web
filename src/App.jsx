import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/navbar";
import Toast from "./components/Toast";
import Home from "./components/Home";
import Menu from "./components/menu";
import Blog from "./components/Blog";
import BlogPost from "./components/BlogPost";
import Invoice from "./components/Invoice";
import Footer from "./components/footer";
import OrderingFlowchart from "./components/OrderingFlowchart"; // Import it

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
        <Navbar />
        <Toast />
        <Routes>
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
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/invoice" element={<Invoice />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </CartProvider>
  );
}