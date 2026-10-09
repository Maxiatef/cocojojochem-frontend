import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import FormulationTools from '@/components/ocean/tools/FormulationTools';

export const metadata: Metadata = pageMetadata({
  title: 'Formulation Tools & Batch Calculator',
  description:
    'Free formulation tools for cosmetic makers: convert formula percentages into ingredient weights for any batch size, compare ingredients side by side, and organize projects and technical documents.',
  path: '/formulation-tools',
  keywords: [
    'cosmetic batch calculator',
    'formula percentage to grams',
    'formulation weight calculator',
    'cosmetic formulation tools',
    'ingredient comparison tool',
  ],
});

/** Reference "/formulation-tools": Formulation studio — 38 calculators + the formula worksheet. */
export default function FormulationToolsPage() {
  return (
    <>
      <div className="r-page-intro r-wrap">
        <span className="r-eyebrow">Formulation studio</span>
        <h1>Precision for every stage.</h1>
        <p>Explore practical calculations for cosmetic chemistry, production and laboratory planning.</p>
      </div>
      <section className="r-wrap r-section">
        <FormulationTools />
      </section>
    </>
  );
}
