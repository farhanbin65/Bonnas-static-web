import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Blog from '../src/components/Blog.jsx';

HelmetProvider.canUseDOM = false;
export function renderBlog(posts) {
  const context = {};
  const html = renderToString(<HelmetProvider context={context}><MemoryRouter initialEntries={['/blog']}><Blog initialPosts={posts} /></MemoryRouter></HelmetProvider>);
  // React 19 renders Helmet metadata using native metadata elements.
  const tags = [];
  const body = html.replace(/<title\b[^>]*>[\s\S]*?<\/title>|<meta\b[^>]*>|<link\b[^>]*>|<script\b[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/g, tag => { tags.push(tag); return ""; });
  return { html: body, head: tags.join("\n") };
}
