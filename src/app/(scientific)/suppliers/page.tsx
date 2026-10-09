import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';
import { SupplierDirectory } from '@/components/ocean/catalog/SupplierDirectory';

/**
 * /suppliers — sources & coverage of the supplier reference library
 * (reference supplier-directory.tsx). It describes other suppliers'
 * catalogs, so like the reference pages it is noindex,follow.
 */

export const metadata: Metadata = {
  ...pageMetadata({
    title: 'Ingredient Sources & Coverage',
    description:
      'The reviewed supplier sources behind the COCOJOJO ingredient reference library, with coverage notes and links to each original catalog.',
    path: '/suppliers',
  }),
  robots: { index: false, follow: true },
};

export default function SuppliersPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Sources & coverage', path: '/suppliers' },
        ])}
      />
      <SupplierDirectory />
    </>
  );
}
