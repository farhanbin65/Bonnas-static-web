import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.jsx'
import './index.css'

// React takes ownership of the server listing and its metadata on startup.
document.querySelectorAll('[data-blog-ssr]').forEach(element => element.remove());

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>
)