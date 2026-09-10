import { Product } from '@/lib/types';
import { getPriceRange } from '@/lib/pricing';
import { SITE_NAME, SITE_URL, absoluteUrl } from '@/lib/seo';

/**
 * Renders a schema.org JSON-LD block.
 *
 * This is what actually gets a listing upgraded to a rich result in Google —
 * product price/availability under the search title, breadcrumb trails
 * instead of a bare URL, and a sitelinks search box. Plain meta tags can't
 * produce any of that.
 *
 * Note it is deliberately NOT wrapped in `dangerouslySetInnerHTML` of a
 * template string built by hand: JSON.stringify escapes the values, and the
 * `<` replacement below prevents a product name containing "</script>" from
 * breaking out of the tag.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}

// --- Builders ---------------------------------------------------------------

/**
 * Identifies the business itself. Feeds Google's knowledge panel and is the
 * `@id` every other node points at as its seller/publisher, so the graph
 * hangs together instead of being a pile of unrelated objects.
 */
export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    description:
      'Wholesale supplier of cosmetic and personal-care ingredients — carrier oils, butters, waxes, emulsifiers, surfactants, actives and peptides in bulk and drum quantities.',
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl('/icon.svg'),
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      email: 'support@cocojojochem.com',
      availableLanguage: ['English'],
    },
  };
}

/**
 * The site node, plus a SearchAction describing the on-site search URL.
 * That's what lets Google render a search box directly in the result for
 * branded queries.
 */
export function webSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    publisher: { '@id': `${SITE_URL}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/products?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Breadcrumb trail. Replaces the raw URL under a search result with a
 * readable path, and is the cheapest structured data to get right.
 */
export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

// schema.org availability values. ON_BACKORDER maps to BackOrder rather than
// InStock so Google never advertises stock we don't hold.
const AVAILABILITY: Record<string, string> = {
  IN_STOCK: 'https://schema.org/InStock',
  OUT_OF_STOCK: 'https://schema.org/OutOfStock',
  ON_BACKORDER: 'https://schema.org/BackOrder',
};

/**
 * Product rich result. This is the highest-value block on the site: it's what
 * puts price, availability and SKU into the search listing itself.
 *
 * Uses AggregateOffer because a product here has multiple pack sizes at
 * different prices (1 Gallon … 1 Drum); a single Offer would have to pick one
 * price and would misrepresent the rest. The chemical identifiers (INCI, CAS,
 * botanical name) go in as additionalProperty — formulators search by those,
 * and nothing else on the page tells a crawler what they mean.
 */
export function productSchema(product: Product) {
  const variants = product.variants || [];
  // Null when the product has no variants at all — the offers block below is
  // then omitted rather than quoting a fabricated price.
  const priceRange = getPriceRange(variants);

  // De-duplicated: the main image and a variant image are frequently the
  // same file, and repeating a URL in `image` is a validation warning.
  const images = Array.from(
    new Set(
      [product.imageUrl, ...(product.gallery || []).map((g) => g.url), ...variants.map((v) => v.imageUrl)]
        .filter(Boolean)
        .map((src) => absoluteUrl(src as string)),
    ),
  ).slice(0, 8);

  // Best availability across variants — if any size is in stock, the product
  // is buyable.
  const anyInStock = variants.some((v) => v.stockStatus === 'IN_STOCK');
  const anyBackorder = variants.some((v) => v.stockStatus === 'ON_BACKORDER');
  const availability = anyInStock
    ? AVAILABILITY.IN_STOCK
    : anyBackorder
      ? AVAILABILITY.ON_BACKORDER
      : AVAILABILITY.OUT_OF_STOCK;

  const additionalProperty = [
    product.inciName && { '@type': 'PropertyValue', name: 'INCI Name', value: product.inciName },
    product.botanicalName && {
      '@type': 'PropertyValue',
      name: 'Botanical Name',
      value: product.botanicalName,
    },
    product.casNumber && { '@type': 'PropertyValue', name: 'CAS Number', value: product.casNumber },
    ...(product.specs || []).map((spec) => ({
      '@type': 'PropertyValue',
      name: spec.key,
      value: spec.value,
    })),
  ].filter(Boolean);

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': absoluteUrl(`/products/${product.slug}#product`),
    name: product.name,
    url: absoluteUrl(`/products/${product.slug}`),
    sku: product.sku,
    description:
      product.shortDescription ||
      product.description ||
      `${product.name} available in bulk and drum quantities from ${SITE_NAME}.`,
    ...(images.length ? { image: images } : {}),
    brand: { '@type': 'Brand', name: product.brand || SITE_NAME },
    ...(product.category ? { category: product.category.name } : {}),
    ...(additionalProperty.length ? { additionalProperty } : {}),
    ...(product.certifications?.length
      ? { hasCertification: product.certifications.map((c) => ({ '@type': 'Certification', name: c.name })) }
      : {}),
    // Only claim offers when there's a real price to quote.
    ...(priceRange && priceRange.max > 0
      ? {
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'USD',
            lowPrice: priceRange.min.toFixed(2),
            highPrice: priceRange.max.toFixed(2),
            offerCount: variants.length,
            availability,
            seller: { '@id': `${SITE_URL}/#organization` },
          },
        }
      : {}),
  };
}

/**
 * ItemList for a listing page. Tells crawlers these links are one collection
 * in a meaningful order, rather than incidental navigation.
 */
export function itemListSchema({
  name,
  path,
  items,
}: {
  name: string;
  path: string;
  items: { name: string; path: string }[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': absoluteUrl(`${path}#itemlist`),
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      url: absoluteUrl(item.path),
    })),
  };
}
