import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';
import { ServicesExperience } from '@/components/ocean/company/CompanyPages';

export const metadata: Metadata = pageMetadata({
  title: 'Formulation & Manufacturing Services',
  description:
    'Ingredient sourcing, formulation support, private label and contract manufacturing from COCOJOJO in California. Tell us about your project and start a conversation with our team.',
  path: '/services',
  keywords: [
    'cosmetic ingredient sourcing',
    'cosmetic formulation support',
    'private label skincare manufacturer',
    'contract manufacturing beauty products',
  ],
});

/**
 * Services, in the ocean design (reference ServicesExperience): animated hero,
 * the four-card service deck and the directory of every service pathway. The
 * shell adds the cinematic intro, the e-company-shell wrapper and the finale.
 */
export default function ServicesPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Services', path: '/services' },
        ])}
      />
      <ServicesExperience />
    </>
  );
}
