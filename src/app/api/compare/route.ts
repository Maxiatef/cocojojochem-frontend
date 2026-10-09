import { NextRequest, NextResponse } from 'next/server';
import { serverFetch } from '@/lib/serverFetch';
import { productImage } from '@/lib/gloss/images';
import type { Product } from '@/lib/types';
import { categoryImage, type CatalogProduct, type ExtraFacts } from '@/lib/ocean/catalog-data';
import { commerceCatalog } from '@/lib/ocean/commerce-catalog';
import type { PackagingProduct } from '@/lib/ocean/packaging-data';
import { materialProperties } from '@/lib/ocean/material-properties';
import chemicalData from '@/lib/ocean/chemical-properties-loader';
import formulationData from '@/lib/ocean/data/formulation-data.json';
import { MAX_COMPARISON_ITEMS, type ProductMini } from '@/lib/ocean/store-types';
import type { ComparisonProduct, FormulationReference } from '@/lib/ocean/comparison-types';

/**
 * Comparison rows for the /compare workspace (reference app/api/compare).
 *
 *   ?slug=a&slug=b…   up to 7, in the order given
 *
 * A slug is either a supplier reference / packaging record from the copied
 * reference data (the reference site's own "cocojojo" products excluded), or
 * one of OUR products, read from our API and mapped onto the same shape.
 */

const references = new Map(
  commerceCatalog.filter((p) => p.source !== 'cocojojo').map((p) => [p.slug, p as CatalogProduct]),
);

/** CAS → a reference slug the chemical data is keyed by, to reuse its sourced profile for our products. */
const slugByCAS = new Map<string, string>();
for (const [slug, m] of Object.entries((chemicalData as { bySlug: Record<string, { cas: string }> }).bySlug))
  if (!slugByCAS.has(m.cas)) slugByCAS.set(m.cas, slug);

function referenceRow(p: CatalogProduct): ComparisonProduct {
  const packaging = p.categoryId === 'packaging';
  const mini: ProductMini = {
    slug: p.slug,
    name: p.name,
    inci: p.inci,
    category: p.category,
    categoryId: p.categoryId,
    source: p.source,
    image: packaging ? (p as PackagingProduct).image : categoryImage(p.categoryId),
    ...(packaging ? { kind: 'packaging' as const, specifications: (p as PackagingProduct).specifications } : {}),
    packSizes: p.packSizes,
    offers: [],
    facts: p.facts,
    identityReference: p.identityReference,
    identityReview: p.identityReview,
    supplierIdentityReference: p.supplierIdentityReference,
    phase: p.extra.phase,
    application: p.extra.applications || [],
  };
  return {
    ...mini,
    sourceUrl: p.sourceUrl,
    functions: p.functions,
    extra: p.extra,
    browsingFunctions: p.browsingFunctions,
    functionReference: p.functionReference,
    ...materialProperties(p),
    manufacturer: p.manufacturer,
    supplierProductId: p.supplierProductId,
    formulationReference: (formulationData as Record<string, FormulationReference>)[p.slug],
  };
}

/** First value of a spec row whose key matches. */
function spec(p: Product, pattern: RegExp): string | null {
  return (p.specs || []).find((s) => pattern.test(s.key))?.value?.trim() || null;
}

function oursRow(p: Product): ComparisonProduct {
  const cas = (p.casNumber || '').match(/\d{2,7}-\d{2}-\d/)?.[0] || null;
  const applications = spec(p, /application/i);
  const extra: ExtraFacts = {
    phase: spec(p, /phase/i),
    materialPH: spec(p, /^ph\b|ph \(|ph value/i),
    formulationPH: spec(p, /formulation ph|ph range/i),
    meltingPoint: spec(p, /melting/i),
    temperature: spec(p, /temperature/i),
    storage: spec(p, /storage/i),
    shelfLife: spec(p, /shelf/i),
    applications: applications ? applications.split(/[,;]\s*/) : [],
    documents: (p.documents || []).map((d) => ({ title: d.label || d.type.replace('_', ' '), url: d.url })),
  };
  const functions = (p.functions || []).map((f) => f.name);
  const pseudo: CatalogProduct = {
    slug: (cas && slugByCAS.get(cas)) || p.slug,
    id: p.id,
    name: p.name,
    inci: p.inciName || '',
    category: p.category?.name || 'Ingredient',
    categoryId: p.category?.slug || 'cocojojo',
    functions,
    description: p.shortDescription || '',
    packSizes: p.variants.map((v) => v.label),
    sourceUrl: '/products/' + p.slug,
    source: 'cocojojo',
    letter: p.name.charAt(0).toUpperCase(),
    facts: { inci: p.inciName, cas },
    extra,
  };
  const { chemical, coreProperties } = materialProperties(pseudo);
  return {
    slug: p.slug,
    name: p.name,
    inci: p.inciName || '',
    category: p.category?.name || 'Ingredient',
    categoryId: p.category?.slug || 'cocojojo',
    source: 'cocojojo',
    image: productImage(p),
    packSizes: p.variants.map((v) => v.label),
    offers: p.variants.map((v) => ({
      id: v.id,
      slug: p.slug,
      label: v.label,
      price: Math.round(Number(v.effectivePrice || v.price) * 100),
      stock: v.stockStatus,
      lead: '',
    })),
    facts: {
      cas,
      appearance: spec(p, /appearance|colou?r|odou?r/i),
      solubility: spec(p, /solubility/i),
      useLevel: spec(p, /use level|usage|recommended/i),
    },
    phase: extra.phase,
    application: extra.applications,
    sourceUrl: '/products/' + p.slug,
    functions,
    browsingFunctions: functions,
    extra,
    manufacturer: p.brand || undefined,
    supplierProductId: p.sku || undefined,
    chemical,
    coreProperties,
  };
}

export async function GET(request: NextRequest) {
  const slugs = Array.from(new Set(request.nextUrl.searchParams.getAll('slug')))
    .filter((s) => /^[a-z0-9-]{1,200}$/i.test(s))
    .slice(0, MAX_COMPARISON_ITEMS);
  const rows = await Promise.all(
    slugs.map(async (slug) => {
      // Our product wins a shared slug, exactly as /products/[slug] resolves it.
      const ref = references.get(slug);
      if (ref?.categoryId !== 'packaging') {
        const ours = await serverFetch<Product>(`/wholesale/products/${encodeURIComponent(slug)}`, { revalidate: 60 });
        if (ours && ours.slug) return oursRow(ours);
      }
      return ref ? referenceRow(ref) : null;
    }),
  );
  const products = rows.filter((r): r is ComparisonProduct => r !== null);
  return NextResponse.json({ products }, { headers: { 'Cache-Control': 'public, max-age=60' } });
}
