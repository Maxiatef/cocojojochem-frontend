'use client';

import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { ProductFunction } from '@/lib/types';
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

interface FunctionFormState {
  id: number | null;
  name: string;
  slug: string;
  description: string;
}

const EMPTY_FORM: FunctionFormState = { id: null, name: '', slug: '', description: '' };

export default function FunctionsAdminPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FunctionFormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ProductFunction | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-functions'],
    queryFn: () => api.get<ProductFunction[]>('/wholesale/functions'),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-functions'] });

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/wholesale/functions', body),
    onSuccess: () => {
      invalidate();
      closeModal();
    },
    onError: (err) => setError(getFriendlyErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) =>
      api.patch(`/wholesale/functions/${id}`, body),
    onSuccess: () => {
      invalidate();
      closeModal();
    },
    onError: (err) => setError(getFriendlyErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/wholesale/functions/${id}`),
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

  function openEditModal(f: ProductFunction) {
    setForm({ id: f.id, name: f.name, slug: f.slug, description: f.description || '' });
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
    };
    if (form.id) {
      updateMutation.mutate({ id: form.id, body });
    } else {
      createMutation.mutate(body);
    }
  }

  const functions = data || [];
  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <PageHeader title="Functions" description="Manage the 'shop by chemical function' tags." />
        <Button onClick={openCreateModal} icon={PlusIcon}>
          Add Function
        </Button>
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState message="Couldn't load functions." />}
      {data && functions.length === 0 && <EmptyState message="No functions yet." />}

      {data && functions.length > 0 && (
        <Card>
          <Table minWidth={560}>
            <TableHead>
              <Th>Name</Th>
              <Th>Slug</Th>
              <Th>Products</Th>
              <Th align="right">Actions</Th>
            </TableHead>
            <tbody>
              {functions.map((f) => (
                <Tr key={f.id}>
                  <Td className="font-medium text-slate-900">{f.name}</Td>
                  <Td className="text-slate-500">{f.slug}</Td>
                  <Td className="text-slate-600">{f.productCount ?? 0}</Td>
                  <Td align="right">
                    <div className="flex justify-end gap-1.5">
                      <IconButton icon={EditIcon} label="Edit" onClick={() => openEditModal(f)} />
                      <IconButton
                        icon={TrashIcon}
                        label="Delete"
                        variant="danger"
                        onClick={() => setPendingDelete(f)}
                      />
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      <Modal open={modalOpen} onClose={closeModal} title={form.id ? 'Edit Function' : 'Add Function'}>
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
            label="Description (optional)"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          {error && (
            <div className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {form.id ? 'Save Changes' : 'Create Function'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete function"
        message={`Delete function "${pendingDelete?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={() => pendingDelete && deleteMutation.mutate(pendingDelete.id)}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
