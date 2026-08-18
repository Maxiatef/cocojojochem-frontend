'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { Category, Certification, Paginated, Product, ProductFunction } from '@/lib/types';
import { uploadProductImage, uploadVariantImage } from '@/lib/uploads';
import {
  Button,
  Card,
  SelectField,
  TextAreaField,
  TextField,
} from '@/components/ui';
import { ImageUploadField } from '@/components/admin/ImageUploadField';
import { PlusIcon, TrashIcon } from '@/components/icons';

interface VariantFormRow {
  sku: string;
  label: string;
  price: string;
  salePrice: string;
  stockQuantity: string;
  imageUrl: string;
  moq: string;
}

const EMPTY_VARIANT: VariantFormRow = {
  sku: '',
  label: '',
  price: '',
  salePrice: '',
  stockQuantity: '',
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
  const [imageUrl, setImageUrl] = useState(product?.imageUrl || '');
  const [categoryId, setCategoryId] = useState(product?.category?.id ? String(product.category.id) : '');
  const [functionIds, setFunctionIds] = useState<number[]>(product?.functions?.map((f) => f.id) || []);
  const [certificationIds, setCertificationIds] = useState<number[]>(
    product?.certifications?.map((c) => c.id) || [],
  );
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false);
  const [variants, setVariants] = useState<VariantFormRow[]>(
    product?.variants?.length ? product.variants.map(toVariantRow) : [EMPTY_VARIANT],
  );
  const [error, setError] = useState<string | null>(null);

  const { data: categoriesRes } = useQuery({
    queryKey: ['admin-categories-lite'],
    queryFn: () => api.get<Paginated<Category>>('/wholesale/categories?page=1&limit=200'),
  });
  const { data: functions } = useQuery({
    queryKey: ['admin-functions-lite'],
    queryFn: () => api.get<ProductFunction[]>('/wholesale/functions'),
  });
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
      imageUrl: imageUrl || undefined,
      categoryId: Number(categoryId),
      functionIds,
      certificationIds,
      isActive,
      isFeatured,
      variants: variants.map((v) => ({
        sku: v.sku,
        label: v.label,
        price: Number(v.price),
        salePrice: v.salePrice ? Number(v.salePrice) : undefined,
        stockQuantity: v.stockQuantity ? Number(v.stockQuantity) : undefined,
        imageUrl: v.imageUrl || undefined,
        moq: v.moq ? Number(v.moq) : undefined,
      })),
    };

    saveMutation.mutate(body);
  }

  const categories = categoriesRes?.data || [];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="space-y-4 p-6">
        <h2 className="text-sm font-semibold text-slate-900">Basic Information</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="Name" required value={name} onChange={(e) => setName(e.target.value)} />
          <TextField label="Slug" required value={slug} onChange={(e) => setSlug(e.target.value)} />
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
          <TextField label="INCI Name" value={inciName} onChange={(e) => setInciName(e.target.value)} />
          <TextField
            label="Botanical Name"
            value={botanicalName}
            onChange={(e) => setBotanicalName(e.target.value)}
          />
          <TextField label="CAS Number" value={casNumber} onChange={(e) => setCasNumber(e.target.value)} />
        </div>
        <ImageUploadField
          label="Main Product Image"
          value={imageUrl}
          onChange={setImageUrl}
          upload={uploadProductImage}
        />
        <TextAreaField
          label="Short Description"
          rows={2}
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
        />
        <TextAreaField
          label="Chemical Description"
          rows={3}
          value={chemicalDescriptions}
          onChange={(e) => setChemicalDescriptions(e.target.value)}
        />
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            Active (visible in catalog)
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            Featured
          </label>
        </div>
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
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                <TextField
                  label="SKU"
                  required
                  value={v.sku}
                  onChange={(e) => updateVariant(i, { sku: e.target.value })}
                />
                <TextField
                  label="Size Label"
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
              <div className="mt-3">
                <ImageUploadField
                  label="Variant Image"
                  value={v.imageUrl}
                  onChange={(url) => updateVariant(i, { imageUrl: url })}
                  upload={uploadVariantImage}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {error && (
        <div className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={() => router.push('/admin/products')}>
          Cancel
        </Button>
        <Button type="submit" loading={saveMutation.isPending}>
          {isEdit ? 'Save Changes' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
}
