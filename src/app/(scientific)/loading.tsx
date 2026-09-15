/**
 * Route-loading state for the Scientific edition.
 *
 * Without this, navigation inside the group falls through to the root
 * `loading.tsx`, which paints a full-screen ground — replacing the header and
 * footer with a blank page on every link click. This keeps the chrome in
 * place and only blanks the content area.
 */
export default function ScientificLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-white">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-sci-blue border-t-transparent" />
    </div>
  );
}
