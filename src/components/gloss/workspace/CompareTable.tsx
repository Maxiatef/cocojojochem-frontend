'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useQueries } from '@tanstack/react-query';
import { FolderPlus, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Product } from '@/lib/types';
import { formatUsd, getPriceRange } from '@/lib/pricing';
import { productImage } from '@/lib/gloss/images';
import { clearCompare, removeFromCompare, useCompare, useProjects } from '@/lib/gloss/stores';
import { CardActions } from '@/components/gloss/ProductCard';
import { EmptyState } from '@/components/gloss/EmptyState';
import { addItemsToProject, createProjectWith } from './projectItems';

const MISSING = 'Not provided. Request the current specification.';

const DOC_LABELS: Record<string, string> = {
  COA: 'COA',
  SDS: 'SDS',
  TDS: 'TDS',
  SPEC_SHEET: 'Spec sheet',
  CERTIFICATE: 'Certificate',
  OTHER: 'Other',
};

type Row = [label: string, value: (p: Product) => string | null | undefined];

function stockText(p: Product) {
  const v = p.variants || [];
  if (!v.length) return 'Confirmed with your quote';
  if (v.some((x) => x.stockStatus === 'IN_STOCK')) return 'In stock';
  if (v.some((x) => x.stockStatus === 'ON_BACKORDER')) return 'On backorder';
  return 'Out of stock';
}

function moqText(p: Product) {
  const withMoq = (p.variants || []).filter((v) => v.moq && v.moq > 1);
  if (!withMoq.length) return 'No minimum';
  return withMoq.map((v) => `${v.moq} × ${v.label}`).join(', ');
}

function priceText(p: Product) {
  const r = getPriceRange(p.variants || []);
  if (!r) return 'Price on request';
  return r.min === r.max ? formatUsd(r.min) : `${formatUsd(r.min)} – ${formatUsd(r.max)}`;
}

function docsText(p: Product) {
  const docs = p.documents || [];
  if (!docs.length) return 'Available on request';
  const kinds = Array.from(new Set(docs.map((d) => DOC_LABELS[d.type] || d.type)));
  return `${docs.length} (${kinds.join(', ')})`;
}

const BASE_ROWS: Row[] = [
  ['Category', (p) => p.category?.name],
  ['INCI', (p) => p.inciName],
  ['CAS', (p) => p.casNumber],
  ['Botanical name', (p) => p.botanicalName],
  ['Functions', (p) => (p.functions || []).map((f) => f.name).join(', ')],
  ['Certifications', (p) => (p.certifications || []).map((c) => c.name).join(', ') || 'None listed'],
  ['Price range', priceText],
  ['Pack sizes', (p) => (p.variants || []).map((v) => v.label).join(', ')],
  ['Stock', stockText],
  ['Minimum order', moqText],
  ['Documents', docsText],
];

/** The prototype's comparison table (fn H), fed by our product API. */
export function CompareTable() {
  const list = useCompare();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const results = useQueries({
    queries: list.map((item) => ({
      queryKey: ['compare-product', item.slug],
      queryFn: () => api.get<Product>(`/wholesale/products/${item.slug}`),
      staleTime: 5 * 60 * 1000,
    })),
  });

  if (!mounted) return <p className="r-loading">Loading your comparison…</p>;

  if (!list.length) {
    return (
      <EmptyState
        title="Find the right fit."
        text="Select Compare on up to four ingredient cards to see their properties side by side."
        href="/products"
        label="Choose ingredients"
      />
    );
  }

  const columns = list.map((item, i) => ({ item, product: results[i]?.data, query: results[i] }));

  // Spec rows: every spec key that appears on any compared product, in the
  // order first seen.
  const specKeys: string[] = [];
  for (const c of columns)
    for (const s of c.product?.specs || []) if (s.key && !specKeys.includes(s.key)) specKeys.push(s.key);
  const rows: Row[] = [
    ...BASE_ROWS,
    ...specKeys.map<Row>((key) => [key, (p) => p.specs?.find((s) => s.key === key)?.value]),
  ];

  const cell = (c: (typeof columns)[number], value: Row[1]) => {
    if (c.product) return value(c.product) || MISSING;
    if (c.query?.isError) return 'Could not load this ingredient.';
    return 'Loading…';
  };

  return (
    <>
      <div className="r-compare-toolbar">
        <p>
          {list.length} of 4 ingredients selected.{' '}
          <Link href="/products">Add another</Link>
        </p>
        <button type="button" className="r-btn r-outline r-small" onClick={clearCompare}>
          <Trash2 size={16} />
          Clear comparison
        </button>
      </div>

      <div className="r-table-scroll">
        <table className="r-comparison">
          <caption>
            Ingredient comparison. Grades and specifications are confirmed per batch; a shared INCI does not establish
            equivalence.
          </caption>
          <thead>
            <tr>
              <th scope="col">Compare details</th>
              {columns.map(({ item, product }) => (
                <th scope="col" key={item.slug}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product ? productImage(product) : productImage({})}
                    alt={product?.imageUrl ? product.name : 'Representative ingredient texture'}
                    width={160}
                    height={130}
                  />
                  <Link href={'/products/' + item.slug}>{product?.name || item.name}</Link>
                  <button type="button" onClick={() => removeFromCompare(item.slug)}>
                    Remove
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, value]) => (
              <tr key={label}>
                <th scope="row">{label}</th>
                {columns.map((c) => (
                  <td key={c.item.slug}>{cell(c, value)}</td>
                ))}
              </tr>
            ))}
            <tr>
              <th scope="row">Next step</th>
              {columns.map((c) => (
                <td key={c.item.slug}>{c.product ? <CardActions product={c.product} /> : null}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <SaveToProject items={list.map((i) => ({ slug: i.slug, name: i.name }))} />
    </>
  );
}

/** Keep this shortlist: add every compared ingredient to a project. */
function SaveToProject({ items }: { items: { slug: string; name: string }[] }) {
  const projects = useProjects();
  const [target, setTarget] = useState('new');
  const [name, setName] = useState('');

  // A deleted project can leave the select pointing at nothing.
  const selected = target !== 'new' && projects.some((p) => p.id === target) ? target : 'new';

  function submit(e: FormEvent) {
    e.preventDefault();
    if (selected === 'new') {
      if (!name.trim()) return;
      createProjectWith(name, items);
      setName('');
    } else {
      addItemsToProject(selected, items);
    }
  }

  return (
    <>
      <form className="r-project-create r-compare-save" onSubmit={submit}>
        <div className="r-field">
          <label htmlFor="compare-project">Save this comparison to</label>
          <select id="compare-project" value={selected} onChange={(e) => setTarget(e.target.value)}>
            <option value="new">A new project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        {selected === 'new' && (
          <div className="r-field">
            <label htmlFor="compare-project-name">New project name</label>
            <input
              id="compare-project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={80}
              placeholder="For example, daily hydrating serum"
            />
          </div>
        )}
        <button type="submit" className="r-btn r-primary">
          <FolderPlus size={18} />
          Save to project
        </button>
      </form>
      <p className="r-fine">
        Signed in, projects are saved to your account. <Link href="/projects">Open your projects</Link>
      </p>
    </>
  );
}
