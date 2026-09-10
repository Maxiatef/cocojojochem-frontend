import type { Metadata } from 'next';
import './globals.css';
import 'flag-icons/css/flag-icons.min.css';
import { Providers } from './providers';
import { BASE_KEYWORDS, SITE_NAME, SITE_TAGLINE, SITE_URL } from '@/lib/seo';

const DEFAULT_TITLE = `${SITE_NAME} — ${SITE_TAGLINE} for Brands & Formulators`;
const DEFAULT_DESCRIPTION =
  'Wholesale cosmetic ingredients in bulk and drum quantities — carrier oils, butters, waxes, emulsifiers, surfactants, actives and peptides. Trade pricing, INCI and CAS data, fast US shipping.';

export const metadata: Metadata = {
  // Required for relative Open Graph / canonical URLs to resolve. Without it
  // Next emits relative og:image and canonical values, which crawlers and
  // social scrapers can't follow, and logs a build-time warning.
  metadataBase: new URL(SITE_URL),

  title: {
    default: DEFAULT_TITLE,
    // Child pages set a bare title (e.g. "Cetearyl Alcohol") and get the
    // brand appended here, so every tab and every search result is branded
    // without each page repeating the suffix by hand.
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,

  // Ignored by Google since 2009 and only marginally weighted by Bing, but
  // free to emit. The same terms do real work in the titles, descriptions and
  // JSON-LD, which search engines actually read.
  keywords: BASE_KEYWORDS,

  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: 'Cosmetic Ingredients',

  alternates: { canonical: '/' },

  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      // Let Google use full-length snippets, large image previews and full
      // video previews rather than its conservative defaults.
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },

  // Stops iOS Safari auto-linking phone-number-looking strings (CAS numbers,
  // SKUs) as tel: links, which mangles the product spec tables.
  formatDetection: { telephone: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
