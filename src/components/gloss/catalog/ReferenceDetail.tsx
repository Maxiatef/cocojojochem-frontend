'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, ExternalLink, Package, ShoppingBag } from 'lucide-react';
import { categoryImage } from '@/lib/gloss/images';
import { addReferenceToCart } from '@/lib/gloss/useUnifiedCart';
import { Quantity } from '@/components/gloss/Quantity';
import { ReferenceCard, ReferenceItem } from './ReferenceCatalog';

/**
 * A supplier reference material's page (/products/<item code>), as in the
 * prototype. Not a product of ours: no price, no stock. "Add to cart" puts it
 * in the cart's "Price to confirm" group with the quantity and, optionally,
 * the size the customer wants; we source it and reply with a price.
 */
export function ReferenceDetail({ entry, related }: { entry: ReferenceItem; related: ReferenceItem[] }) {
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState('');
  const [busy, setBusy] = useState(false);

  return (
    <>
      <nav className="r-breadcrumb r-wrap" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span aria-hidden>/</span>
        <Link href="/products?source=makingcosmetics">Supplier reference library</Link>
        <span aria-hidden>/</span>
        <span>{entry.category}</span>
      </nav>

      <section className="r-wrap r-product-detail">
        <div className="g-cat-media">
          <div className="r-detail-image">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={categoryImage(entry.category)}
              alt={`${entry.category} representative ingredient texture`}
              width={740}
              height={740}
              fetchPriority="high"
            />
            <span>Representative category image</span>
          </div>
        </div>

        <div className="r-detail-copy">
          <span className="r-product-source">Supplier reference library</span>
          <h1>{entry.name}</h1>
          {entry.inci && <p className="r-inci">{entry.inci}</p>}
          <p className="r-description">
            A material from our supplier reference library, in {entry.category.toLowerCase()}. We can source it on
            request: add it to your cart and we confirm the grade, pack size, price and lead time with you.
          </p>

          <div className="r-purchase">
            <div className="r-price">
              <strong>Price on request</strong>
            </div>

            <label className="r-field" htmlFor="ref-size">
              <span>
                Preferred size <small>optional</small>
              </span>
              <input
                id="ref-size"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="For example, 5 kg or 1 gallon"
                maxLength={120}
              />
            </label>

            <div className="r-stock">
              <Package size={16} aria-hidden />
              <span>COCOJOJO stock and grade are not confirmed · sourced on request</span>
            </div>

            <div className="r-buy-row">
              <Quantity value={quantity} onChange={setQuantity} />
              <button
                type="button"
                className="r-btn r-primary"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  await addReferenceToCart(
                    {
                      slug: entry.slug,
                      name: entry.name,
                      category: entry.category,
                      sourceUrl: entry.sourceUrl || '',
                    },
                    size,
                    quantity,
                  );
                  setBusy(false);
                }}
              >
                <ShoppingBag size={18} aria-hidden />
                {busy ? 'Adding…' : 'Add to cart'}
              </button>
            </div>
            <p className="r-fine">
              Added under “Price to confirm”. It isn’t charged at checkout — we reply with a price first.
            </p>
          </div>

          <div className="r-detail-assurance">
            <p>
              <BookOpen size={16} aria-hidden /> Supplier reference only. COCOJOJO stock and grade are not confirmed.
            </p>
            {entry.sourceUrl && (
              <p>
                <a href={entry.sourceUrl} target="_blank" rel="noopener nofollow">
                  View the original supplier listing <ExternalLink size={14} aria-hidden />
                </a>
              </p>
            )}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="r-wrap r-section">
          <div className="r-section-heading">
            <div>
              <span className="r-eyebrow">Also in {entry.category}</span>
              <h2>More we can source.</h2>
            </div>
            <Link href="/products?source=makingcosmetics">Supplier reference library</Link>
          </div>
          <div className="r-product-grid">
            {related.map((item) => (
              <ReferenceCard key={item.slug} item={item} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
