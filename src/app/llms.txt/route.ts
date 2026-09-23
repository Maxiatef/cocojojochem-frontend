import { serverFetch } from '@/lib/serverFetch';
import { Category, Paginated } from '@/lib/types';
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from '@/lib/seo';

// Same cadence as the sitemap — the category list changes rarely.
export const revalidate = 3600;

type AzIndex = Record<string, { id: string; name: string; slug: string }[]>;

/**
 * /llms.txt — a plain-Markdown summary of the site for AI assistants
 * (llmstxt.org). Where the sitemap tells a crawler *which* URLs exist, this
 * tells a language model *what the business is*, in words it can quote.
 *
 * Built from the same backend calls as sitemap.ts, so it can't drift from the
 * live catalog. serverFetch returns null on failure, which degrades to the
 * static sections rather than an error.
 */
export async function GET() {
  const [azIndex, categoriesRes] = await Promise.all([
    serverFetch<AzIndex>('/wholesale/products/az-index', { revalidate: 3600 }),
    serverFetch<Paginated<Category>>('/wholesale/categories?page=1&limit=200', { revalidate: 3600 }),
  ]);

  const categories = (categoriesRes?.data || []).filter((c) => (c.productCount ?? 0) > 0);
  const products = Object.values(azIndex || {})
    .flat()
    .sort((a, b) => a.name.localeCompare(b.name));

  const lines = [
    `# ${SITE_NAME}`,
    '',
    `> ${SITE_NAME} is a B2B wholesale supplier of cosmetic and personal-care ingredients — carrier oils, butters, waxes, emulsifiers, surfactants, actives and peptides — sold in bulk and drum quantities to formulators, manufacturers and brands.`,
    '',
    `${SITE_NAME} (${SITE_TAGLINE}) is the wholesale ingredients business. Product pages list INCI names, CAS numbers, specifications, certifications and technical documents. Pricing is by quantity; larger or custom orders go through a quote request.`,
    '',
    '## Key pages',
    '',
    `- [Ingredient catalog](${SITE_URL}/products): every material in stock, filterable by category and function`,
    `- [Categories](${SITE_URL}/categories): ingredients grouped by type`,
    `- [Functions](${SITE_URL}/functions): ingredients grouped by what they do in a formula`,
    `- [Request a quote](${SITE_URL}/quote-request): bulk and custom pricing`,
    `- [About](${SITE_URL}/about): who we are`,
    `- [Contact](${SITE_URL}/contact): sales enquiries`,
  ];

  if (categories.length) {
    lines.push('', '## Categories', '');
    for (const c of categories) {
      lines.push(`- [${c.name}](${SITE_URL}/categories/${c.slug})`);
    }
  }

  if (products.length) {
    lines.push('', '## Products', '');
    for (const p of products) {
      lines.push(`- [${p.name}](${SITE_URL}/products/${p.slug})`);
    }
  }

  lines.push(
    '',
    '## Optional',
    '',
    `- [Terms of service](${SITE_URL}/legal/terms-of-service)`,
    `- [Privacy policy](${SITE_URL}/legal/privacy-policy)`,
    `- [Sitemap](${SITE_URL}/sitemap.xml)`,
    '',
  );

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
