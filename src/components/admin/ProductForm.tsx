'use client';

import { FormEvent, KeyboardEvent, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { Category, Certification, Paginated, Product, ProductFunction, ProductVisibility } from '@/lib/types';
import { uploadMultipleProductImages, uploadVariantImage } from '@/lib/uploads';
import {
  Button,
  Card,
  SelectField,
  TextAreaField,
  TextField,
} from '@/components/ui';
import { ImagePlaceholderIcon, PlusIcon, StarIcon, TrashIcon } from '@/components/icons';

interface SpecFormRow {
  key: string;
  value: string;
}

const EMPTY_SPEC: SpecFormRow = { key: '', value: '' };

interface VariantFormRow {
  sku: string;
  label: string;
  price: string;
  salePrice: string;
  stockQuantity: string;
  backorder: boolean;
  imageUrl: string;
  moq: string;
}

const EMPTY_VARIANT: VariantFormRow = {
  sku: '',
  label: '',
  price: '',
  salePrice: '',
  stockQuantity: '',
  backorder: false,
  imageUrl: '',
  moq: '',
};

function toVariantRow(v: Product['variants'][number]): VariantFormRow {
  return {
    sku: v.sku,
    label: v.label,
    price: v.price,
    salePrice: v.salePrice || '',
    stockQuantity: v.stockQuantity != null ? String(v.stockQuantity) : '',
    backorder: v.stockStatus === 'ON_BACKORDER',
    imageUrl: v.imageUrl || '',
    moq: '',
  };
}

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = !!product;

  const [name, setName] = useState(product?.name || '');
  const [slug, setSlug] = useState(product?.slug || '');
  const [sku, setSku] = useState(product?.sku || '');
  const [inciName, setInciName] = useState(product?.inciName || '');
  const [botanicalName, setBotanicalName] = useState(product?.botanicalName || '');
  const [casNumber, setCasNumber] = useState(product?.casNumber || '');
  const [shortDescription, setShortDescription] = useState(product?.shortDescription || '');
  const [chemicalDescriptions, setChemicalDescriptions] = useState(product?.chemicalDescriptions || '');
  const [categoryId, setCategoryId] = useState(product?.category?.id ? String(product.category.id) : '');
  const [functionIds, setFunctionIds] = useState<number[]>(product?.functions?.map((f) => f.id) || []);
  const [certificationIds, setCertificationIds] = useState<number[]>(
    product?.certifications?.map((c) => c.id) || [],
  );
  const [isPublished, setIsPublished] = useState(product?.isPublished ?? true);
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false);
  const [visibility, setVisibility] = useState<ProductVisibility>(product?.visibility ?? 'PUBLIC');
  const [visibilityPassword, setVisibilityPassword] = useState(product?.visibilityPassword || '');
  const [scheduledPublishAt, setScheduledPublishAt] = useState(
    product?.scheduledPublishAt ? product.scheduledPublishAt.slice(0, 16) : '',
  );
  const [brand, setBrand] = useState(product?.brand || '');
  const [description, setDescription] = useState(product?.description || '');
  const [specs, setSpecs] = useState<SpecFormRow[]>(
    product?.specs?.length ? product.specs.map((s) => ({ key: s.key, value: s.value })) : [],
  );
  const [slugEditing, setSlugEditing] = useState(!isEdit);

  // SEO panel state
  const [focusKeyphrase, setFocusKeyphrase] = useState(product?.seo?.focusKeyphrase || '');
  const [seoTitle, setSeoTitle] = useState(product?.seo?.seoTitle || '');
  const [metaDescription, setMetaDescription] = useState(product?.seo?.metaDescription || '');
  const [socialTitle, setSocialTitle] = useState(product?.seo?.socialTitle || '');
  const [socialDescription, setSocialDescription] = useState(product?.seo?.socialDescription || '');
  const [socialImageUrl, setSocialImageUrl] = useState(product?.seo?.socialImageUrl || '');
  const [tags, setTags] = useState<string[]>(product?.seo?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [seoOpen, setSeoOpen] = useState(false);

  const [variants, setVariants] = useState<VariantFormRow[]>(
    product?.variants?.length ? product.variants.map(toVariantRow) : [EMPTY_VARIANT],
  );
  // One unified image list — whichever URL is first is the "cover" shown
  // everywhere a single product image is needed (imageUrl, on the backend).
  // Falls back to the legacy standalone imageUrl for older products that
  // predate the gallery table and have never re-saved since.
  const [gallery, setGallery] = useState<string[]>(() => {
    const sorted = (product?.gallery || []).slice().sort((a, b) => a.sortOrder - b.sortOrder).map((g) => g.url);
    if (sorted.length > 0) return sorted;
    return product?.imageUrl ? [product.imageUrl] : [];
  });
  const [error, setError] = useState<string | null>(null);

  const { data: categoriesRes } = useQuery({
    queryKey: ['admin-categories-lite'],
    queryFn: () => api.get<Paginated<Category>>('/wholesale/categories?page=1&limit=200'),
  });
  const { data: functionsRes } = useQuery({
    queryKey: ['admin-functions-lite'],
    queryFn: () => api.get<Paginated<ProductFunction>>('/wholesale/functions?page=1&limit=200'),
  });
  const functions = functionsRes?.data;
  const { data: certifications } = useQuery({
    queryKey: ['admin-certifications-lite'],
    queryFn: () => api.get<Certification[]>('/wholesale/certifications'),
  });

  const saveMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      isEdit ? api.patch(`/wholesale/products/${product!.id}`, body) : api.post('/wholesale/products', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      router.push('/admin/products');
    },
    onError: (err) => setError(getFriendlyErrorMessage(err)),
  });

  function toggleId(list: number[], id: number, setList: (v: number[]) => void) {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  }

  function updateVariant(index: number, patch: Partial<VariantFormRow>) {
    setVariants((rows) => rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function addVariant() {
    setVariants((rows) => [...rows, EMPTY_VARIANT]);
  }

  function removeVariant(index: number) {
    setVariants((rows) => rows.filter((_, i) => i !== index));
  }

  function updateSpec(index: number, patch: Partial<SpecFormRow>) {
    setSpecs((rows) => rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function addSpec() {
    setSpecs((rows) => [...rows, EMPTY_SPEC]);
  }

  function removeSpec(index: number) {
    setSpecs((rows) => rows.filter((_, i) => i !== index));
  }

  function addTag(raw: string) {
    const t = raw.trim();
    if (!t) return;
    setTags((list) => (list.includes(t) ? list : [...list, t]));
    setTagInput('');
  }

  function removeTag(t: string) {
    setTags((list) => list.filter((x) => x !== t));
  }

  function handleTagInputKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!categoryId) {
      setError('Please choose a category.');
      return;
    }
    if (variants.length === 0 || variants.some((v) => !v.sku || !v.label || !v.price)) {
      setError('Every variant needs at least a SKU, size label, and price.');
      return;
    }

    const body = {
      name,
      slug,
      sku,
      inciName: inciName || undefined,
      botanicalName: botanicalName || undefined,
      casNumber: casNumber || undefined,
      shortDescription: shortDescription || undefined,
      chemicalDescriptions: chemicalDescriptions || undefined,
      // No standalone imageUrl — the backend derives the cover image from
      // gallery[0] whenever `gallery` is sent.
      categoryId: Number(categoryId),
      functionIds,
      certificationIds,
      isPublished,
      isFeatured,
      visibility,
      visibilityPassword: visibility === 'PASSWORD_PROTECTED' ? visibilityPassword || undefined : undefined,
      scheduledPublishAt: scheduledPublishAt ? new Date(scheduledPublishAt).toISOString() : undefined,
      brand: brand || undefined,
      description: description || undefined,
      specs: specs.filter((s) => s.key.trim() && s.value.trim()).map((s) => ({ key: s.key, value: s.value })),
      seo: {
        focusKeyphrase: focusKeyphrase || undefined,
        seoTitle: seoTitle || undefined,
        metaDescription: metaDescription || undefined,
        socialTitle: socialTitle || undefined,
        socialDescription: socialDescription || undefined,
        socialImageUrl: socialImageUrl || undefined,
        tags,
      },
      variants: variants.map((v) => ({
        sku: v.sku,
        label: v.label,
        price: Number(v.price),
        salePrice: v.salePrice ? Number(v.salePrice) : undefined,
        stockQuantity: v.stockQuantity ? Number(v.stockQuantity) : undefined,
        // IN_STOCK/OUT_OF_STOCK are derived server-side from stockQuantity —
        // the only thing worth sending here is the deliberate backorder
        // override, which always wins regardless of quantity.
        stockStatus: v.backorder ? 'ON_BACKORDER' : undefined,
        imageUrl: v.imageUrl || undefined,
        moq: v.moq ? Number(v.moq) : undefined,
      })),
      gallery: gallery.map((url, i) => ({ url, sortOrder: i })),
    };

    saveMutation.mutate(body);
  }

  const categories = categoriesRes?.data || [];

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card className="space-y-4 p-6">
          <h2 className="text-sm font-semibold text-slate-900">Basic Information</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField label="Name" required value={name} onChange={(e) => setName(e.target.value)} />
            <TextField label="SKU" required value={sku} onChange={(e) => setSku(e.target.value)} />
            <SelectField
              label="Category"
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Select a category…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </SelectField>
            <TextField label="Brand" value={brand} onChange={(e) => setBrand(e.target.value)} />
            <TextField label="INCI Name" value={inciName} onChange={(e) => setInciName(e.target.value)} />
            <TextField
              label="Botanical Name"
              value={botanicalName}
              onChange={(e) => setBotanicalName(e.target.value)}
            />
            <TextField label="CAS Number" value={casNumber} onChange={(e) => setCasNumber(e.target.value)} />
          </div>

          {/* WP-style permalink preview under Name/Slug */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Permalink</label>
            {slugEditing ? (
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <TextField label="Slug" required value={slug} onChange={(e) => setSlug(e.target.value)} />
                </div>
                <Button type="button" variant="secondary" size="sm" onClick={() => setSlugEditing(false)}>
                  OK
                </Button>
              </div>
            ) : (
              <p className="flex items-center gap-2 text-sm text-slate-600">
                <span className="text-slate-400">yoursite.com/products/</span>
                <span className="font-medium text-slate-900">{slug || '—'}</span>
                <button
                  type="button"
                  onClick={() => setSlugEditing(true)}
                  className="text-xs font-medium text-brand-600 hover:underline"
                >
                  Edit
                </button>
              </p>
            )}
          </div>

          <GalleryField images={gallery} onChange={setGallery} />
          <TextAreaField
            label="Short Description"
            rows={2}
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
          />
          <TextAreaField
            label="Description (Full Details)"
            rows={7}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Long-form product details shown below the fold on the storefront page…"
          />
          <TextAreaField
            label="Chemical Description"
            rows={3}
            value={chemicalDescriptions}
            onChange={(e) => setChemicalDescriptions(e.target.value)}
          />
        </Card>

        <Card className="p-6">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Functions</h2>
          <div className="flex flex-wrap gap-2">
            {(functions || []).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => toggleId(functionIds, f.id, setFunctionIds)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  functionIds.includes(f.id)
                    ? 'border-brand-600 bg-brand-50 text-brand-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Certifications</h2>
          <div className="flex flex-wrap gap-2">
            {(certifications || []).map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleId(certificationIds, c.id, setCertificationIds)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  certificationIds.includes(c.id)
                    ? 'border-green-600 bg-green-50 text-green-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Specifications</h2>
            <Button type="button" variant="secondary" size="sm" icon={PlusIcon} onClick={addSpec}>
              Add Spec
            </Button>
          </div>
          {specs.length === 0 && (
            <p className="text-sm text-slate-400">
              No specifications yet — e.g. pH, Appearance, Odor, Solubility.
            </p>
          )}
          <div className="space-y-3">
            {specs.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <input
                  placeholder="Key (e.g. pH)"
                  value={s.key}
                  onChange={(e) => updateSpec(i, { key: e.target.value })}
                  className="flex-1 rounded-lg border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
                <input
                  placeholder="Value (e.g. 6.5)"
                  value={s.value}
                  onChange={(e) => updateSpec(i, { value: e.target.value })}
                  className="flex-1 rounded-lg border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
                <button
                  type="button"
                  onClick={() => removeSpec(i)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                  aria-label="Remove spec"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </Card>

      </div>

      {/* Right sidebar: Publish box, then SEO below it */}
      <div className="space-y-6">
        <Card className="sticky top-4 space-y-4 p-5">
          <h2 className="text-sm font-semibold text-slate-900">Publish</h2>

          <div>
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Status</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsPublished(true)}
                className={`flex-1 rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                  isPublished
                    ? 'border-green-600 bg-green-50 text-green-700'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                Published
              </button>
              <button
                type="button"
                onClick={() => setIsPublished(false)}
                className={`flex-1 rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                  !isPublished
                    ? 'border-slate-500 bg-slate-100 text-slate-700'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                Draft
              </button>
            </div>
          </div>

          <SelectField
            label="Visibility"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as ProductVisibility)}
          >
            <option value="PUBLIC">Public</option>
            <option value="PRIVATE">Private</option>
            <option value="PASSWORD_PROTECTED">Password protected</option>
          </SelectField>

          {visibility === 'PASSWORD_PROTECTED' && (
            <TextField
              label="Password"
              type="text"
              value={visibilityPassword}
              onChange={(e) => setVisibilityPassword(e.target.value)}
            />
          )}

          <TextField
            label="Schedule (optional)"
            type="datetime-local"
            value={scheduledPublishAt}
            onChange={(e) => setScheduledPublishAt(e.target.value)}
          />
          <p className="text-xs text-slate-400">
            Leave blank to publish immediately once Status is Published. If set to a future date, the
            product stays hidden from the storefront until then.
          </p>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            Featured
          </label>

          <div className="flex gap-2 border-t border-slate-100 pt-4">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => router.push('/admin/products')}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" loading={saveMutation.isPending}>
              {isEdit ? 'Update' : 'Publish'}
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <button
            type="button"
            onClick={() => setSeoOpen((v) => !v)}
            className="flex w-full items-center justify-between text-sm font-semibold text-slate-900"
          >
            SEO
            <span className="text-slate-400">{seoOpen ? '−' : '+'}</span>
          </button>
          {seoOpen && (
            <div className="mt-4 space-y-4">
              <TextField
                label="Focus Keyphrase"
                value={focusKeyphrase}
                onChange={(e) => setFocusKeyphrase(e.target.value)}
              />
              <TextField label="SEO Title" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
              <TextAreaField
                label="Meta Description"
                rows={2}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
              />

              {/* Yoast-style live search preview */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Search Preview
                </p>
                <p className="truncate text-base text-blue-700 hover:underline">
                  {seoTitle || name || 'Product title'}
                </p>
                <p className="text-sm text-green-700">
                  yoursite.com/products/{slug || 'product-slug'}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {metaDescription || shortDescription || 'A meta description will appear here as you type.'}
                </p>
              </div>

              <TextField
                label="Social Title"
                value={socialTitle}
                onChange={(e) => setSocialTitle(e.target.value)}
              />
              <TextAreaField
                label="Social Description"
                rows={2}
                value={socialDescription}
                onChange={(e) => setSocialDescription(e.target.value)}
              />
              <TextField
                label="Social Image URL"
                value={socialImageUrl}
                onChange={(e) => setSocialImageUrl(e.target.value)}
                placeholder="https://…"
              />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Tags</label>
                <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-300 px-2.5 py-2">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700"
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() => removeTag(t)}
                        aria-label={`Remove tag ${t}`}
                        className="text-brand-500 hover:text-brand-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagInputKeyDown}
                    onBlur={() => addTag(tagInput)}
                    placeholder="Type a tag, press Enter…"
                    className="min-w-[10rem] flex-1 border-none text-sm outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card className="p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Variants &amp; Pricing</h2>
          <Button type="button" variant="secondary" size="sm" icon={PlusIcon} onClick={addVariant}>
            Add Variant
          </Button>
        </div>

        <div className="space-y-4">
          {variants.map((v, i) => (
            <div key={i} className="rounded-lg border border-slate-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Variant {i + 1}
                </p>
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(i)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                    aria-label="Remove variant"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                <div className="lg:col-span-1">
                  <VariantImagePanel
                    value={v.imageUrl}
                    onChange={(url) => updateVariant(i, { imageUrl: url })}
                    upload={uploadVariantImage}
                  />
                </div>

                <div className="lg:col-span-2">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <TextField
                      label="SKU"
                      required
                      value={v.sku}
                      onChange={(e) => updateVariant(i, { sku: e.target.value })}
                    />
                    <TextField
                      label="Size"
                      required
                      placeholder="1 Gallon"
                      value={v.label}
                      onChange={(e) => updateVariant(i, { label: e.target.value })}
                    />
                    <TextField
                      label="Price ($)"
                      type="number"
                      step="0.01"
                      required
                      value={v.price}
                      onChange={(e) => updateVariant(i, { price: e.target.value })}
                    />
                    <TextField
                      label="Sale Price ($)"
                      type="number"
                      step="0.01"
                      value={v.salePrice}
                      onChange={(e) => updateVariant(i, { salePrice: e.target.value })}
                    />
                    <TextField
                      label="Stock Qty"
                      type="number"
                      min={0}
                      value={v.stockQuantity}
                      onChange={(e) => updateVariant(i, { stockQuantity: e.target.value })}
                    />
                    <TextField
                      label="MOQ"
                      type="number"
                      value={v.moq}
                      onChange={(e) => updateVariant(i, { moq: e.target.value })}
                    />
                  </div>
                  <div className="mt-3 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={v.backorder}
                        onChange={(e) => updateVariant(i, { backorder: e.target.checked })}
                      />
                      Mark as backorder (still purchasable while restocking)
                    </label>
                    <span className="text-xs text-slate-400">
                      {Number(v.stockQuantity) <= 0 && v.stockQuantity !== '' && !v.backorder
                        ? 'Will show as Out of Stock (0 qty).'
                        : 'In Stock / Out of Stock is set automatically from quantity.'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        </Card>

        {error && (
          <div className="mt-6 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => router.push('/admin/products')}>
            Cancel
          </Button>
          <Button type="submit" loading={saveMutation.isPending}>
            {isEdit ? 'Save Changes' : 'Create Product'}
          </Button>
        </div>
      </div>
    </form>
  );
}

// Multi-image gallery uploader — beyond the single "Main Product Image",
// these are extra photos (packaging, COA, angles, etc.) shown as a strip on
// the storefront. Uploads go to POST /uploads/multiple-images (same local
// disk-storage flow as every other image field, not a third-party URL),
// persisted as ProductImage rows keyed by their position in this list.
function GalleryField({ images, onChange }: { images: string[]; onChange: (urls: string[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      const urls = await uploadMultipleProductImages(files);
      onChange([...images, ...urls]);
    } catch (err) {
      setError(getFriendlyErrorMessage(err, 'upload'));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function removeAt(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  // Jumps straight to the front (the cover slot) rather than a one-step swap —
  // this is "make this the cover", not "nudge it left".
  function setCover(index: number) {
    if (index === 0) return;
    const next = images.slice();
    const [chosen] = next.splice(index, 1);
    next.unshift(chosen);
    onChange(next);
  }

  const hasMultiple = images.length > 1;

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">Product Image{images.length !== 1 ? 's' : ''}</label>
      <p className="mb-2 text-xs text-slate-500">
        {images.length === 0
          ? 'Upload one image, or several — the first one becomes the product’s cover image automatically.'
          : hasMultiple
            ? 'The starred image is the cover shown everywhere. Hover an image to pick a different cover, reorder, or remove it.'
            : 'This is the cover image. Add more to enable reordering.'}
      </p>

      {images.length > 0 && (
        <div className="mb-3 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {images.map((url, i) => (
            <div
              key={url + i}
              className={`group relative aspect-square overflow-hidden rounded-lg border bg-slate-50 ${
                i === 0 ? 'border-amber-400 ring-1 ring-amber-300' : 'border-slate-200'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
                {hasMultiple && i !== 0 && (
                  <button
                    type="button"
                    onClick={() => setCover(i)}
                    aria-label="Set as cover image"
                    title="Set as cover image"
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-amber-500 hover:bg-white"
                  >
                    <StarIcon className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  aria-label="Remove image"
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-red-600 hover:bg-white"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                </button>
              </div>
              {i === 0 && (
                <span className="absolute left-1 top-1 flex items-center gap-1 rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  <StarIcon className="h-2.5 w-2.5" /> Cover
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFilesChange}
        disabled={uploading}
        className="block w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-brand-700 hover:file:bg-brand-100"
      />
      {uploading && <p className="mt-1 text-xs text-slate-400">Uploading…</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

// Large, dedicated preview for a variant's image — sized to actually fill its
// 1/3-width column rather than the shared ImageUploadField's small 64px
// thumbnail (which is fine for the single main product image, but not enough
// room to actually judge a variant photo before saving).
function VariantImagePanel({
  value,
  onChange,
  upload,
}: {
  value: string;
  onChange: (url: string) => void;
  upload: (file: File) => Promise<string>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const url = await upload(file);
      onChange(url);
    } catch (err) {
      setError(getFriendlyErrorMessage(err, 'upload'));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">Variant Image</label>
      <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <ImagePlaceholderIcon className="h-10 w-10 text-slate-300" />
        )}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          disabled={uploading}
          className="block w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-brand-700 hover:file:bg-brand-100"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="Remove image"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
          >
            <TrashIcon className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {uploading && <p className="mt-1 text-xs text-slate-400">Uploading…</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
