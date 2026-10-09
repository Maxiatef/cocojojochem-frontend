import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { pageMetadata } from '@/lib/seo';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';
import { PackagingDetail } from '@/components/ocean/packaging/PackagingPages';
import { packagingCatalog } from '@/lib/ocean/packaging-data';

type Props = { params: { slug: string } };

const find = (slug: string) => packagingCatalog.find((p) => p.slug === slug);

export function generateStaticParams() {
  return packagingCatalog.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const p = find(params.slug);
  if (!p) return { title: 'Packaging not found' };
  return pageMetadata({
    title: p.name,
    description: `${p.name}: cosmetic packaging reference. Explore the format, request dimensions and add your preferred quantity to your sourcing list.`,
    path: '/packaging/' + p.slug,
    keywords: [p.subtype, 'cosmetic packaging'],
    images: [p.image],
  });
}

export default function PackagingDetailPage({ params }: Props) {
  const p = find(params.slug);
  if (!p) notFound();
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Packaging', path: '/packaging' },
          { name: p.name, path: '/packaging/' + p.slug },
        ])}
      />
      <PackagingDetail p={p} />
    </>
  );
}
