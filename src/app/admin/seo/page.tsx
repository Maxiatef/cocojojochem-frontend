'use client';

import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { RequireAdmin } from '@/components/AdminShell';
import { SeoPage } from '@/lib/types';
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
import { CheckCircleIcon, EditIcon, PlusIcon, TrashIcon } from '@/components/icons';

interface SeoFormState {
  id: number | null;
  path: string;
  metaTitle: string;
  metaDescription: string;
  ogImageUrl: string;
}

const EMPTY_FORM: SeoFormState = {
  id: null,
  path: '',
  metaTitle: '',
  metaDescription: '',
  ogImageUrl: '',
};

export default function SeoAdminPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<SeoFormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<SeoPage | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-seo-pages'],
    queryFn: () => api.get<SeoPage[]>('/seo-pages'),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-seo-pages'] });

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/seo-pages', body),
    onSuccess: () => {
      invalidate();
      closeModal();
    },
    onError: (err) => setError(getFriendlyErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) =>
      api.patch(`/seo-pages/${id}`, body),
    onSuccess: () => {
      invalidate();
      closeModal();
    },
    onError: (err) => setError(getFriendlyErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/seo-pages/${id}`),
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

  function openEditModal(p: SeoPage) {
    setForm({
      id: p.id,
      path: p.path,
      metaTitle: p.metaTitle || '',
      metaDescription: p.metaDescription || '',
      ogImageUrl: p.ogImageUrl || '',
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
      path: form.path,
      metaTitle: form.metaTitle || undefined,
      metaDescription: form.metaDescription || undefined,
      ogImageUrl: form.ogImageUrl || undefined,
    };
    if (form.id) {
      updateMutation.mutate({ id: form.id, body });
    } else {
      createMutation.mutate(body);
    }
  }

  const pages = data || [];
  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <RequireAdmin>
      <div>
        <div className="mb-6 flex items-center justify-between">
          <PageHeader title="SEO Pages" description="Per-path meta title, description, and social image overrides." />
          <Button onClick={openCreateModal} icon={PlusIcon}>
            Add SEO Page
          </Button>
        </div>

        {isLoading && <LoadingState />}
        {isError && <ErrorState message="Couldn't load SEO pages." />}
        {!isLoading && !isError && pages.length === 0 && <EmptyState message="No SEO pages configured yet." />}

        {!isLoading && pages.length > 0 && (
          <Card>
            <Table minWidth={640}>
              <TableHead>
                <Th>Path</Th>
                <Th>Meta Title</Th>
                <Th>Has Description</Th>
                <Th align="right">Actions</Th>
              </TableHead>
              <tbody>
                {pages.map((p) => (
                  <Tr key={p.id}>
                    <Td className="font-medium text-slate-900">{p.path}</Td>
                    <Td className="text-slate-600">{p.metaTitle || '—'}</Td>
                    <Td>
                      {p.metaDescription ? (
                        <CheckCircleIcon className="h-4 w-4 text-green-600" />
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </Td>
                    <Td align="right">
                      <div className="flex justify-end gap-1.5">
                        <IconButton icon={EditIcon} label="Edit" onClick={() => openEditModal(p)} />
                        <IconButton
                          icon={TrashIcon}
                          label="Delete"
                          variant="danger"
                          onClick={() => setPendingDelete(p)}
                        />
                      </div>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </Card>
        )}

        <Modal open={modalOpen} onClose={closeModal} title={form.id ? 'Edit SEO Page' : 'Add SEO Page'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              label="Path"
              placeholder="/products/example-product"
              required
              value={form.path}
              onChange={(e) => setForm({ ...form, path: e.target.value })}
            />
            <TextField
              label="Meta Title"
              value={form.metaTitle}
              onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
            />
            <TextAreaField
              label="Meta Description"
              rows={3}
              value={form.metaDescription}
              onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
            />
            <TextField
              label="OG Image URL"
              value={form.ogImageUrl}
              onChange={(e) => setForm({ ...form, ogImageUrl: e.target.value })}
            />

            {error && <div className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit" loading={saving}>
                {form.id ? 'Save Changes' : 'Create SEO Page'}
              </Button>
            </div>
          </form>
        </Modal>

        <ConfirmDialog
          open={!!pendingDelete}
          title="Delete SEO page"
          message={`Delete SEO overrides for "${pendingDelete?.path}"? This cannot be undone.`}
          confirmLabel="Delete"
          loading={deleteMutation.isPending}
          onConfirm={() => pendingDelete && deleteMutation.mutate(pendingDelete.id)}
          onCancel={() => setPendingDelete(null)}
        />
      </div>
    </RequireAdmin>
  );
}
