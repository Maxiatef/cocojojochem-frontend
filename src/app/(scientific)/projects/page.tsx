import type { Metadata } from 'next';
import { ProjectsWorkspace } from '@/components/gloss/workspace/ProjectsWorkspace';

// Per-browser workspace: nothing to index.
export const metadata: Metadata = {
  title: 'Formulation Projects',
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

export default function ProjectsPage() {
  return (
    <>
      <div className="r-page-intro r-wrap">
        <span className="r-eyebrow">A place for your ideas</span>
        <h1>Your formulation projects.</h1>
        <p>Organize shortlisted ingredients and development notes.</p>
      </div>
      <section className="r-wrap r-section">
        <ProjectsWorkspace />
      </section>
    </>
  );
}
