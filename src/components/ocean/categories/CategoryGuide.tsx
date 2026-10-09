import { Package } from 'lucide-react';

/**
 * The buying guidance kept under our category pages for search, drawn with
 * the reference's own FAQ parts (retail-page.tsx `FAQ`): `r-help-layout`, the
 * `r-faq` disclosure list and the `r-reading-aside` card. The first paragraph
 * stays visible; each further titled group is a disclosure.
 */
export function CategoryGuide({
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
  // Group the remaining paragraphs under their subheadings (index is into `paragraphs`).
  const groups: { title: string; body: string[] }[] = [];
  rest.forEach((p, i) => {
    const title = subheadings.find((s) => s.beforeIndex === i + 1)?.text;
    if (title || !groups.length) groups.push({ title: title || 'More about ordering', body: [p] });
    else groups[groups.length - 1].body.push(p);
  });
  return (
    <section className="r-wrap r-section cg-guide">
      <div className="r-section-heading">
        <div>
          <span className="r-eyebrow">{eyebrow}</span>
          <h2>{heading}</h2>
        </div>
      </div>
      <div className="r-help-layout">
        <div>
          {first && <p className="cg-guide-lead">{first}</p>}
          {groups.length > 0 && (
            <div className="r-faq">
              {groups.map((g) => (
                <details key={g.title}>
                  <summary>{g.title}</summary>
                  {g.body.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </details>
              ))}
            </div>
          )}
        </div>
        <aside className="r-reading-aside">
          <Package size={28} />
          <h3>{aside.title}</h3>
          <p>{aside.text}</p>
          {aside.links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </aside>
      </div>
    </section>
  );
}
