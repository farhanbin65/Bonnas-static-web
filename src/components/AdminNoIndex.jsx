import { Helmet } from 'react-helmet-async';
export default function AdminNoIndex({ children }) {
  return <><Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>{children}</>;
}
