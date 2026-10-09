import type { Metadata } from 'next';
import { Comparison } from '@/components/ocean/workspace/Comparison';

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
        <h1>Compare ingredients.</h1>
        <p>Add up to 7 ingredients to compare their functions, formulation details and physical properties.</p>
      </div>
      <section className="r-wrap r-section">
        <Comparison />
      </section>
    </>
  );
}
