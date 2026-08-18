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
  Table,
  TableHead,
  Td,
  TextAreaField,
  TextField,
  Th,
  Tr,
} from '@/components/ui';
import { EditIcon, PlusIcon, TrashIcon } from '@/components/icons';

interface CategoryFormState {
  id: number | null;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  sortOrder: string;
}

const EMPTY_FORM: CategoryFormState = {
  id: null,
  name: '',
  slug: '',
  description: '',
  imageUrl: '',
  sortOrder: '0',
};

export default function CategoriesAdminPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<CategoryFormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => api.get<Paginated<Category>>('/wholesale/categories?page=1&limit=200'),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-categories'] });

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
    },
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
      sortOrder: String(c.sortOrder ?? 0),
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
      sortOrder: Number(form.sortOrder) || 0,
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
        <Button onClick={openCreateModal} icon={PlusIcon}>
          Add Category
        </Button>
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState message="Couldn't load categories." />}
      {data && categories.length === 0 && <EmptyState message="No categories yet." />}

      {data && categories.length > 0 && (
        <Card>
          <Table minWidth={640}>
            <TableHead>
              <Th>Name</Th>
              <Th>Slug</Th>
              <Th>Products</Th>
              <Th>Sort Order</Th>
              <Th align="right">Actions</Th>
            </TableHead>
            <tbody>
              {categories.map((c) => (
                <Tr key={c.id}>
                  <Td className="font-medium text-slate-900">{c.name}</Td>
                  <Td className="text-slate-500">{c.slug}</Td>
                  <Td className="text-slate-600">{c.productCount ?? 0}</Td>
                  <Td className="text-slate-600">{c.sortOrder}</Td>
                  <Td align="right">
                    <div className="flex justify-end gap-1.5">
                      <IconButton icon={EditIcon} label="Edit" onClick={() => openEditModal(c)} />
                      <IconButton
                        icon={TrashIcon}
                        label="Delete"
                        variant="danger"
                        onClick={() => setPendingDelete(c)}
                      />
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
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
          <ImageUploadField
            label="Category Image"
            value={form.imageUrl}
            onChange={(url) => setForm({ ...form, imageUrl: url })}
            upload={uploadCategoryImage}
          />
          <TextField
            label="Sort Order"
            type="number"
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
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
        message={`Delete category "${pendingDelete?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={() => pendingDelete && deleteMutation.mutate(pendingDelete.id)}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
