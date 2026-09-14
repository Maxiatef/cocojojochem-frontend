import type { Metadata } from 'next';

// Transactional page — nothing here should ever appear in search results, and
// crawling it just burns crawl budget on pages that need a session to render.
// robots.txt disallows it too; this is the belt-and-braces meta version, which
// also covers a URL that was already indexed before robots.txt existed.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function NoIndexLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
