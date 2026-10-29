import { Helmet } from 'react-helmet-async';

export default function PageMetadata({ title, description, path }) {
  const url = `https://www.bonnas.co.uk${path}`;
  const image = 'https://www.bonnas.co.uk/logo.PNG';
  return <Helmet>
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={url} />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Bonna's" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={url} />
    <meta property="og:image" content={image} />
    <meta property="og:image:alt" content="Bonna’s — Original Bengali Cuisine" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={image} />
    <meta name="twitter:image:alt" content="Bonna’s — Original Bengali Cuisine" />
  </Helmet>;
}
