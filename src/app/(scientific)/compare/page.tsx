import type { Metadata } from 'next';
import { CompareTable } from '@/components/gloss/workspace/CompareTable';

// The comparison lives in the visitor's browser: nothing to index.
export const metadata: Metadata = {
  title: 'Compare Ingredients',
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

export default function ComparePage() {
  return (
    <>
      <div className="r-page-intro r-wrap">
        <span className="r-eyebrow">Side by side</span>
        <h1>Find your best fit.</h1>
        <p>Compare published properties for up to four ingredients.</p>
      </div>
      <section className="r-wrap r-section">
        <CompareTable />
      </section>
    </>
  );
}
