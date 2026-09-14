import { LegalBlock, LegalPolicy } from '@/lib/legalPolicies';

/**
 * Renders one legal policy from `@/lib/legalPolicies`.
 *
 * The policy text itself is copied verbatim from the COCOJOJO retail site and
 * must stay that way — this component only decides how each block type is
 * typeset, never what it says.
 *
 * `listItem` blocks arrive as a flat sequence rather than nested inside a
 * list, so consecutive ones are grouped back into a single `<ul>` before
 * rendering. Emitting a separate one-item list per block would tell a screen
 * reader "list, 1 item" forty times in a row through a long clause.
 */

type Group =
  | { kind: 'block'; block: LegalBlock }
  | { kind: 'list'; items: string[] };

function groupBlocks(blocks: LegalBlock[]): Group[] {
  const groups: Group[] = [];

  for (const block of blocks) {
    if (block.type === 'listItem') {
      const last = groups[groups.length - 1];
      if (last && last.kind === 'list') {
        last.items.push(block.text);
      } else {
        groups.push({ kind: 'list', items: [block.text] });
      }
      continue;
    }
    groups.push({ kind: 'block', block });
  }

  return groups;
}

function Block({ block }: { block: LegalBlock }) {
  if (block.type === 'table') {
    // The first row is the header in every table in this data set.
    const [head, ...body] = block.rows;
    return (
      <div className="my-6 overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-left font-sci-body text-sci-label">
          {head && (
            <thead>
              <tr className="border-b border-sci-border">
                {head.map((cell, i) => (
                  <th
                    key={i}
                    className="px-4 py-3 align-top font-semibold text-sci-navy"
                    scope="col"
                  >
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {body.map((row, r) => (
              <tr key={r} className="border-b border-sci-border last:border-0">
                {row.map((cell, c) => (
                  <td key={c} className="px-4 py-3 align-top text-sci-muted">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  switch (block.type) {
    case 'heading2':
      return (
        <h2 className="mt-12 scroll-mt-24 font-sci-heading text-[26px] font-semibold leading-9 text-sci-navy first:mt-0">
          {block.text}
        </h2>
      );
    case 'heading3':
      return (
        <h3 className="mt-8 font-sci-heading text-[20px] font-semibold leading-7 text-sci-navy">
          {block.text}
        </h3>
      );
    case 'heading4':
      return (
        <h4 className="mt-6 font-sci-body text-[17px] font-semibold leading-6 text-sci-navy">
          {block.text}
        </h4>
      );
    default:
      return (
        <p className="mt-4 font-sci-body text-sci-body text-sci-muted">{block.text}</p>
      );
  }
}

export function LegalDocument({ policy }: { policy: LegalPolicy }) {
  const groups = groupBlocks(policy.blocks);

  return (
    <article className="max-w-[820px]">
      {groups.map((group, i) =>
        group.kind === 'list' ? (
          <ul key={i} className="mt-4 flex flex-col gap-2">
            {group.items.map((item, j) => (
              <li
                key={j}
                className="flex gap-3 font-sci-body text-sci-body text-sci-muted"
              >
                <span
                  aria-hidden
                  className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-sci-accent"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <Block key={i} block={group.block} />
        ),
      )}
    </article>
  );
}
