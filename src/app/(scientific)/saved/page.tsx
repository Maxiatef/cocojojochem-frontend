import type { Metadata } from 'next';
import { SavedList } from '@/components/gloss/workspace/SavedList';

// A per-visitor list: never a search result.
export const metadata: Metadata = {
  title: 'Your Wishlist',
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

export default function SavedPage() {
  return (
    <>
      <div className="r-page-intro r-wrap">
        <span className="r-eyebrow">Your ingredient shortlist</span>
        <h1>Saved for something great.</h1>
        <p>Keep your favorite materials close while you explore.</p>
      </div>
      <section className="r-wrap r-section">
        <SavedList />
      </section>
    </>
  );
}
