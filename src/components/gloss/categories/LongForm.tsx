import Link from 'next/link';
import { Fragment } from 'react';
import { FileText } from 'lucide-react';

/**
 * The long-form buying copy the directory pages carry for search engines,
 * laid out like the prototype's help pages: prose on the left
 * (`r-help-layout`), a `r-reading-aside` on the right.
 *
 * Same behaviour as the SciProse it replaces: the lead paragraph is always
 * visible, the rest sits in a plain `<details>` — no client JS, and the full
 * text is in the server HTML either way. Subheadings are keyed to the index
 * in `paragraphs` they precede.
 */
export function LongForm({
  eyebrow,
  heading,
  paragraphs,
  subheadings = [],
  aside,
}: {
  eyebrow: string;
  heading: string;
  paragraphs: string[];
  subheadings?: { beforeIndex: number; text: string }[];
  aside: { title: string; text: string; links: { href: string; label: string }[] };
}) {
  const [first, ...rest] = paragraphs;
  const headingBefore = new Map(subheadings.map((s) => [s.beforeIndex, s.text]));

  return (
    <section className="r-wrap r-section g-cat-longform">
      <div className="r-help-layout">
        <div className="g-cat-prose">
          <span className="r-eyebrow">{eyebrow}</span>
          <h2>{heading}</h2>
          {first && <p>{first}</p>}
          {rest.length > 0 && (
            <details>
              <summary>
                <span className="g-cat-more">Read more</span>
                <span className="g-cat-less">Show less</span>
              </summary>
              <div>
                {rest.map((p, i) => {
                  const subheading = headingBefore.get(i + 1);
                  return (
                    <Fragment key={i}>
                      {subheading && <h3>{subheading}</h3>}
                      <p>{p}</p>
                    </Fragment>
                  );
                })}
              </div>
            </details>
          )}
        </div>
        <aside className="r-reading-aside">
          <FileText size={30} aria-hidden="true" />
          <h3>{aside.title}</h3>
          <p>{aside.text}</p>
          {aside.links.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
        </aside>
      </div>
    </section>
  );
}
