import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { pageMetadata } from '@/lib/seo';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';
import { ServiceDetail } from '@/components/ocean/company/CompanyPages';
import { findService, serviceLinks } from '@/components/ocean/company/services';

type Props = { params: { slug: string } };

export const dynamicParams = false;

export function generateStaticParams() {
  return serviceLinks.map((s) => ({ slug: s.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const s = findService(params.slug);
  if (!s) return { title: 'Service not found' };
  return pageMetadata({
    title: s.title,
    description: s.intro,
    path: '/services/' + s.slug,
    keywords: [s.title, s.group, ...s.offerings],
    images: ['/assets/ingredients/' + s.image + '.webp'],
  });
}

export default function ServiceDetailPage({ params }: Props) {
  const s = findService(params.slug);
  if (!s) notFound();
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Services', path: '/services' },
          { name: s.title, path: '/services/' + s.slug },
        ])}
      />
      <ServiceDetail s={s} />
    </>
  );
}
