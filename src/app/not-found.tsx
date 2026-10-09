import { StorefrontStyles } from '@/components/ocean/StorefrontStyles';
import StorefrontLayout from './(scientific)/layout';
import NotFound from './(scientific)/not-found';

export { metadata } from './(scientific)/not-found';

/**
 * 404 for addresses no route matches at all (e.g. /xyz). Those never enter the
 * (scientific) group, so its not-found page alone would leave them on Next's
 * bare default; this wraps the same branded page in the storefront shell.
 * An unknown /admin/... address lands here too, which is harmless.
 */
export default function RootNotFound() {
  return (
    <StorefrontLayout>
      <StorefrontStyles />
      <NotFound />
    </StorefrontLayout>
  );
}
