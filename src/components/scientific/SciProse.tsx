import { Fragment } from 'react';
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
  subheadings = [],
}: {
  eyebrow: string;
  heading: string;
  paragraphs: string[];
  /**
   * Optional `<h3>` waypoints inside the collapsed body, each keyed to the
   * index in `paragraphs` it precedes (1 is the first paragraph after the
   * always-visible lead, since index 0 never gets a heading of its own).
   *
   * Nine unbroken paragraphs is a wall for a crawler's readability check and
   * for a person skimming it — the SEO crawl's "subheading distribution"
   * assessment flags any run past ~300 words with nothing to break it up,
   * and a human reader hits the same wall sooner. Optional and empty by
   * default: `about`, `categories` and `functions` all call this component
   * with continuous prose that hasn't been split into labeled sections yet,
   * and passing nothing leaves them exactly as they render today.
   */
  subheadings?: { beforeIndex: number; text: string }[];
}) {
  const [first, ...rest] = paragraphs;
  const headingBefore = new Map(subheadings.map((s) => [s.beforeIndex, s.text]));

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
                {rest.map((p, i) => {
                  const index = i + 1; // rest[i] is paragraphs[index]
                  const subheading = headingBefore.get(index);
                  return (
                    <Fragment key={i}>
                      {subheading && (
                        <h3 className="mt-2 font-sci-heading text-[20px] font-semibold leading-7 text-sci-navy first:mt-0">
                          {subheading}
                        </h3>
                      )}
                      <p>{p}</p>
                    </Fragment>
                  );
                })}
              </div>
            </details>
          )}
        </div>
      </Container>
    </section>
  );
}
