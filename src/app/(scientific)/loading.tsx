/**
 * Route-loading state for the Scientific edition.
 *
 * Without this, navigation inside the group falls through to the root
 * `loading.tsx`, which paints a full-screen ground — replacing the header and
 * footer with a blank page on every link click. This keeps the chrome in
 * place and only blanks the content area.
 *
 * It is a full viewport tall on purpose. Slow pages (category pages, which
 * fetch with no-store) stream this in first; at 60vh the footer painted
 * inside the viewport and was then shoved down when the real content
 * arrived — a 0.17 layout shift in Lighthouse. A layout shift only counts
 * while the moved element is on screen, so keeping the footer below the fold
 * until the content lands removes it.
 */
export default function ScientificLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-sci-blue border-t-transparent" />
    </div>
  );
}
