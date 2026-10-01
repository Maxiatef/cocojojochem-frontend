import { Fragment } from 'react';

/**
 * Long-form indexed copy for listing pages, in the Gloss markup. The prototype
 * has no such section, but the pages being ported carry paragraphs that earn
 * search traffic, so they stay: lead paragraph visible, the rest in a native
 * `<details>` (still in the server HTML), with optional `<h3>` waypoints keyed
 * to the paragraph index they precede.
 */
export function CatalogProse({
  eyebrow,
  heading,
  paragraphs,
  subheadings = [],
}: {
  eyebrow: string;
  heading: string;
  paragraphs: string[];
  subheadings?: { beforeIndex: number; text: string }[];
}) {
  const [first, ...rest] = paragraphs;
  const headingBefore = new Map(subheadings.map((s) => [s.beforeIndex, s.text]));
  return (
    <section className="r-wrap r-section g-cat-prose">
      <span className="r-eyebrow">{eyebrow}</span>
      <h2>{heading}</h2>
      <div className="r-policy-copy">
        <p>{first}</p>
        {rest.length > 0 && (
          <details>
            <summary>
              <span className="g-cat-more">Read more</span>
              <span className="g-cat-less">Show less</span>
            </summary>
            {rest.map((p, i) => {
              const subheading = headingBefore.get(i + 1);
              return (
                <Fragment key={i}>
                  {subheading && <h3>{subheading}</h3>}
                  <p>{p}</p>
                </Fragment>
              );
            })}
          </details>
        )}
      </div>
    </section>
  );
}
