'use client';

import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { Category, Paginated } from '@/lib/types';
import { uploadCategoryImage } from '@/lib/uploads';
import { ImageUploadField } from '@/components/admin/ImageUploadField';
import {
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  IconButton,
  LoadingState,
  Modal,
  PageHeader,
  Pagination,
  SelectField,
  Table,
  TableHead,
  Td,
  TextAreaField,
  TextField,
  Th,
  Tr,
} from '@/components/ui';
import {
  EditIcon,
  EyeIcon,
  ImagePlaceholderIcon,
  PlusIcon,
  TrashIcon,
} from '@/components/icons';
import Link from 'next/link';
import { RequireStaff, useIsAdmin } from '@/components/AdminShell';

type CategorySort = 'name_asc' | 'name_desc' | 'products_desc' | 'products_asc';

interface CategoryFormState {
  id: number | null;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  // '' means "top-level category"; a select cannot hold null.
  parentId: string;
}

const EMPTY_FORM: CategoryFormState = {
  id: null,
  name: '',
  slug: '',
  description: '',
  imageUrl: '',
  parentId: '',
};

function CategoriesAdminPageContent() {
  const isAdmin = useIsAdmin();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<CategoryFormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<CategorySort>('name_asc');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-categories', search, sort, page],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '20');
      params.set('sort', sort);
      if (search) params.set('search', search);
      return api.get<Paginated<Category>>(`/wholesale/categories?${params.toString()}`);
    },
  });

  // The picker needs every root, not the 20 on the current page — `tree`
  // returns exactly the roots and nothing else.
  const { data: roots } = useQuery({
    queryKey: ['admin-category-roots'],
    queryFn: () => api.get<Category[]>('/wholesale/categories/tree'),
  });

  function resetPageAnd<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setPage(1);
    };
  }

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    // A new or re-parented category changes who the available roots are.
    queryClient.invalidateQueries({ queryKey: ['admin-category-roots'] });
  };

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/wholesale/categories', body),
    onSuccess: () => {
      invalidate();
      closeModal();
    },
    onError: (err) => setError(getFriendlyErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) =>
      api.patch(`/wholesale/categories/${id}`, body),
    onSuccess: () => {
      invalidate();
      closeModal();
    },
    onError: (err) => setError(getFriendlyErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/wholesale/categories/${id}`),
    onSuccess: () => {
      invalidate();
      setPendingDelete(null);
      setDeleteError(null);
    },
    // Deleting a category that still has subcategories is refused by the API
    // with an explanation. Without this the dialog just sat there.
    onError: (err) => setDeleteError(getFriendlyErrorMessage(err)),
  });

  function openCreateModal() {
    setForm(EMPTY_FORM);
    setError(null);
    setModalOpen(true);
  }

  function openEditModal(c: Category) {
    setForm({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description || '',
      imageUrl: c.imageUrl || '',
      parentId: c.parentId ? String(c.parentId) : '',
    });
    setError(null);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const body = {
      name: form.name,
      slug: form.slug,
      description: form.description || undefined,
      imageUrl: form.imageUrl || undefined,
      // Sent as null, not omitted: clearing the parent has to be able to
      // promote a subcategory back to the top level.
      parentId: form.parentId ? Number(form.parentId) : null,
    };
    if (form.id) {
      updateMutation.mutate({ id: form.id, body });
    } else {
      createMutation.mutate(body);
    }
  }

  const categories = data?.data || [];
  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <PageHeader title="Categories" description="Manage the wholesale product category taxonomy." />
        {isAdmin && (
          <Button onClick={openCreateModal} icon={PlusIcon}>
            Add Category
          </Button>
        )}
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="w-64">
          <TextField
            label="Search"
            value={search}
            onChange={(e) => resetPageAnd(setSearch)(e.target.value)}
            placeholder="Search by name…"
          />
        </div>
        <div className="w-56">
          <SelectField
            label="Sort"
            value={sort}
            onChange={(e) => resetPageAnd(setSort)(e.target.value as CategorySort)}
          >
            <option value="name_asc">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
            <option value="products_desc">Most products</option>
            <option value="products_asc">Fewest products</option>
          </SelectField>
        </div>
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState message="Couldn't load categories." />}
      {data && categories.length === 0 && <EmptyState message="No categories yet." />}

      {data && categories.length > 0 && (
        <Card>
          <Table minWidth={780}>
            <TableHead>
              <Th>Image</Th>
              <Th>Name</Th>
              <Th>Parent</Th>
              <Th>Slug</Th>
              <Th>Products</Th>
              <Th align="right">Actions</Th>
            </TableHead>
            <tbody>
              {categories.map((c) => (
                <Tr key={c.id}>
                  <Td>
                    <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                      {c.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={c.imageUrl}
                          alt={c.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImagePlaceholderIcon className="h-5 w-5 text-slate-400" />
                      )}
                    </div>
                  </Td>
                  <Td className="font-medium text-slate-900">{c.name}</Td>
                  <Td className="text-slate-600">
                    {c.parent ? (
                      c.parent.name
                    ) : (
                      <span className="text-slate-400">Top level</span>
                    )}
                  </Td>
                  <Td className="text-slate-500">{c.slug}</Td>
                  <Td className="text-slate-600">{c.productCount ?? 0}</Td>
                  <Td align="right">
                    <div className="flex justify-end gap-1.5">
                      <Link href={`/admin/categories/${c.id}`}>
                        <IconButton icon={EyeIcon} label="View" onClick={() => {}} />
                      </Link>
                      {isAdmin && (
                        <>
                          <IconButton icon={EditIcon} label="Edit" onClick={() => openEditModal(c)} />
                          <IconButton
                            icon={TrashIcon}
                            label="Delete"
                            variant="danger"
                            onClick={() => setPendingDelete(c)}
                          />
                        </>
                      )}
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>

          <Pagination
            page={page}
            totalPages={data?.pagination.totalPages || 1}
            onPageChange={setPage}
            totalItems={data?.pagination.total}
            itemLabel="category"
          />
        </Card>
      )}

      <Modal open={modalOpen} onClose={closeModal} title={form.id ? 'Edit Category' : 'Add Category'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            label="Name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            label="Slug"
            required
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          />
          <TextAreaField
            label="Description"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <SelectField
            label="Parent Category"
            value={form.parentId}
            onChange={(e) => setForm({ ...form, parentId: e.target.value })}
          >
            <option value="">Top level (no parent)</option>
            {(roots || [])
              // A category cannot be its own parent, and nesting stops at one
              // level — so only roots other than this one are offered.
              .filter((r) => r.id !== form.id)
              .map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
          </SelectField>

          <ImageUploadField
            label="Category Image"
            value={form.imageUrl}
            onChange={(url) => setForm({ ...form, imageUrl: url })}
            upload={uploadCategoryImage}
          />

          {error && (
            <div className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {form.id ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete category"
        message={
          deleteError ||
          `Delete category "${pendingDelete?.name}"? This cannot be undone.`
        }
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={() => pendingDelete && deleteMutation.mutate(pendingDelete.id)}
        onCancel={() => {
          setPendingDelete(null);
          setDeleteError(null);
        }}
      />
    </div>
  );
}

// Sales can view the catalog but not modify it — the create/edit/delete
// endpoints are ADMIN-only server-side, so the write controls are hidden
// rather than left to fail with a 403 on click.
export default function CategoriesAdminPage() {
  return (
    <RequireStaff>
      <CategoriesAdminPageContent />
    </RequireStaff>
  );
}
