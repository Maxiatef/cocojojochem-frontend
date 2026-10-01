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
      <div className="r-legal-table">
        <table>
          {head && (
            <thead>
              <tr>
                {head.map((cell, i) => (
                  <th key={i} scope="col">
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {body.map((row, r) => (
              <tr key={r}>
                {row.map((cell, c) => (
                  <td key={c}>{cell}</td>
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
      return <h2>{block.text}</h2>;
    case 'heading3':
      return <h3>{block.text}</h3>;
    case 'heading4':
      return <h4>{block.text}</h4>;
    default:
      return <p>{block.text}</p>;
  }
}

/** Typeset by `.r-legal-doc` in src/styles/gloss-content.css. */
export function LegalDocument({ policy }: { policy: LegalPolicy }) {
  const groups = groupBlocks(policy.blocks);

  return (
    <article className="r-legal-doc">
      {groups.map((group, i) =>
        group.kind === 'list' ? (
          <ul key={i}>
            {group.items.map((item, j) => (
              <li key={j}>{item}</li>
            ))}
          </ul>
        ) : (
          <Block key={i} block={group.block} />
        ),
      )}
    </article>
  );
}
