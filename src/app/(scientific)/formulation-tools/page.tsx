import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, FileText, GitCompareArrows } from 'lucide-react';
import { pageMetadata } from '@/lib/seo';
import { BatchCalculator } from '@/components/gloss/workspace/BatchCalculator';

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

export default function FormulationToolsPage() {
  return (
    <>
      <div className="r-page-intro r-wrap">
        <span className="r-eyebrow">Practical tools for creating</span>
        <h1>A little precision goes a long way.</h1>
        <p>Plan ingredient weights and compare technical details.</p>
      </div>
      <section className="r-wrap r-section">
        <BatchCalculator />
        <div className="r-services-grid">
          <Link href="/compare">
            <GitCompareArrows size={24} />
            <h3>Ingredient comparison</h3>
            <p>Review identity, specifications and pack sizes together.</p>
          </Link>
          <Link href="/projects">
            <BookOpen size={24} />
            <h3>Project workspace</h3>
            <p>Keep your materials and notes in one place.</p>
          </Link>
          <Link href="/documents">
            <FileText size={24} />
            <h3>Document search</h3>
            <p>Find published safety sheets and technical references.</p>
          </Link>
        </div>
      </section>
    </>
  );
}
