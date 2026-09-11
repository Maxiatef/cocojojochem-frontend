import { Container, Eyebrow, SectionHeading } from '@/components/scientific/primitives';

/**
 * The long-form descriptive copy that listing pages carry for search engines,
 * restyled for the Scientific edition.
 *
 * The design has no equivalent section, but the pages being migrated do — and
 * silently dropping nine paragraphs of indexed copy would cost real ranking on
 * pages that earn traffic. So it stays, in the new type scale.
 *
 * Unlike the storefront's SeoIntro this is a plain `<details>`: no client
 * component, no max-height animation, and the full text is in the server HTML
 * either way. The first paragraph shows while collapsed so the section reads
 * as content rather than as an empty disclosure.
 */
export function SciProse({
  eyebrow,
  heading,
  paragraphs,
}: {
  eyebrow: string;
  heading: string;
  paragraphs: string[];
}) {
  const [first, ...rest] = paragraphs;

  return (
    <section className="border-t border-sci-border bg-white py-16">
      <Container className="flex flex-col gap-6">
        <Eyebrow>{eyebrow}</Eyebrow>
        <SectionHeading>{heading}</SectionHeading>

        <div className="max-w-[820px] font-sci-body text-sci-body text-sci-muted">
          <p>{first}</p>

          {rest.length > 0 && (
            <details className="group mt-4">
              <summary className="cursor-pointer list-none font-sci-body text-sci-label font-medium text-sci-blue marker:content-none">
                <span className="group-open:hidden">Read more ↓</span>
                <span className="hidden group-open:inline">Show less ↑</span>
              </summary>
              <div className="mt-4 flex flex-col gap-4">
                {rest.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </details>
          )}
        </div>
      </Container>
    </section>
  );
}
