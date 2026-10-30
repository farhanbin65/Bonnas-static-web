import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function NotFound({ article = false }) {
  return <section className="min-h-screen py-24 px-6 text-center text-cream">
    <Helmet><title>Page not found | Bonna’s</title><meta name="robots" content="noindex, follow" /></Helmet>
    <h1 className="text-3xl font-bold">{article ? 'Article not found' : 'Page not found'}</h1>
    <p className="mt-4 text-sand">This page may have moved or is no longer available.</p>
    <Link className="inline-block mt-6 text-pink-bonnas underline" to={article ? '/blog' : '/'}>{article ? 'Browse the blog' : 'Back to home'}</Link>
  </section>;
}
