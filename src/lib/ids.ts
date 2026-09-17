/**
 * Displaying a uuid.
 *
 * Ids used to be short integers, so printing one whole — `Order #42` — was
 * readable. A uuid is 36 characters and turns a table column into noise, so
 * anywhere an id is shown to a person it is shortened to its first block.
 *
 * Display only. Never use the result to fetch, match or key anything: the
 * first block is not unique, and the full id is what the API expects.
 */
export function shortId(id: string | number | null | undefined): string {
  if (id == null) return '—';
  const text = String(id);
  // The first group of a uuid. Anything else (a legacy integer, a composite
  // audit key) is shown as it is, because truncating it would lose meaning.
  const uuidHead = /^([0-9a-f]{8})-[0-9a-f]{4}-[0-9a-f]{4}-/i.exec(text);
  return uuidHead ? uuidHead[1].toUpperCase() : text;
}

/** `#ABCD1234`, the form used in tables, titles and confirmation prompts. */
export function displayId(id: string | number | null | undefined): string {
  return `#${shortId(id)}`;
}

/**
 * A route segment, ready to put back into a request path.
 *
 * Next's App Router hands back the RAW segment, so an email arrives still
 * percent-encoded. Encoding that again turns `%40` into `%2540` and the
 * lookup 404s. Decoding first makes this safe whether the value arrives
 * encoded or not, and a stray `%` that is not a valid escape falls back to
 * the value as given rather than throwing.
 */
export function encodeRouteParam(value: string): string {
  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    // Not valid percent-encoding — use it as it came.
  }
  return encodeURIComponent(decoded);
}
