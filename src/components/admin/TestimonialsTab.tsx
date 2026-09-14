'use client';

import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { Testimonial } from '@/lib/types';
import { uploadCategoryImage } from '@/lib/uploads';
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  IconButton,
  LoadingState,
  Modal,
  SelectField,
  Table,
  TableHead,
  Td,
  TextAreaField,
  TextField,
  Th,
  Tr,
  useToast,
} from '@/components/ui';
import { EditIcon, PlusIcon, TrashIcon } from '@/components/icons';
import { ImageUploadField } from '@/components/admin/ImageUploadField';
import { useCan } from '@/components/AdminShell';

/**
 * Testimonial CRUD, rendered as a tab on the Settings page rather than as its
 * own admin route — it's a small piece of site content and the sidebar is
 * already long.
 *
 * Rows are ordered by sortOrder, the same order the storefront uses, so the
 * list reads as the running order rather than an arbitrary sequence.
 */

interface TestimonialFormState {
  id: number | null;
  authorName: string;
  company: string;
  quote: string;
  result: string;
  imageUrl: string;
  isPublished: boolean;
  sortOrder: string;
}

const EMPTY_FORM: TestimonialFormState = {
  id: null,
  authorName: '',
  company: '',
  quote: '',
  result: '',
  imageUrl: '',
  isPublished: true,
  sortOrder: '0',
};

export function TestimonialsTab() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const canCreate = useCan('canCreateTestimonial');
  const canEdit = useCan('canEditTestimonial');
  const canDelete = useCan('canDeleteTestimonial');

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<TestimonialFormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Testimonial | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-testimonials'],
    // The admin list, not the public one — drafts have to be visible here.
    queryFn: () => api.get<Testimonial[]>('/wholesale/testimonials/admin'),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] });

  const saveMutation = useMutation({
    mutationFn: (body: TestimonialFormState) => {
      const payload = {
        authorName: body.authorName.trim(),
        company: body.company.trim() || null,
        quote: body.quote.trim(),
        result: body.result.trim() || null,
        imageUrl: body.imageUrl.trim() || null,
        isPublished: body.isPublished,
        sortOrder: Number(body.sortOrder) || 0,
      };
      return body.id
        ? api.patch(`/wholesale/testimonials/${body.id}`, payload)
        : api.post('/wholesale/testimonials', payload);
    },
    onSuccess: (_res, body) => {
      invalidate();
      setModalOpen(false);
      toast.success(body.id ? 'Testimonial updated.' : 'Testimonial added.');
    },
    onError: (err) => setError(getFriendlyErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/wholesale/testimonials/${id}`),
    onSuccess: () => {
      invalidate();
      setPendingDelete(null);
      toast.success('Testimonial deleted.');
    },
    onError: (err) => {
      setPendingDelete(null);
      toast.error(getFriendlyErrorMessage(err));
    },
  });

  function openCreate() {
    setForm(EMPTY_FORM);
    setError(null);
    setModalOpen(true);
  }

  function openEdit(t: Testimonial) {
    setForm({
      id: t.id,
      authorName: t.authorName,
      company: t.company ?? '',
      quote: t.quote,
      result: t.result ?? '',
      imageUrl: t.imageUrl ?? '',
      isPublished: t.isPublished,
      sortOrder: String(t.sortOrder ?? 0),
    });
    setError(null);
    setModalOpen(true);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.authorName.trim()) {
      setError('Enter the name of the person being quoted.');
      return;
    }
    if (!form.quote.trim()) {
      setError('Enter the quote itself.');
      return;
    }
    saveMutation.mutate(form);
  }

  const testimonials = data ?? [];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Testimonials</h2>
          <p className="text-xs text-slate-500">
            Customer quotes for the storefront. Drafts stay hidden until published.
          </p>
        </div>
        {canCreate && (
          <Button onClick={openCreate} icon={PlusIcon} size="sm">
            Add Testimonial
          </Button>
        )}
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState message="Couldn't load testimonials." />}
      {!isLoading && !isError && testimonials.length === 0 && (
        <EmptyState message="No testimonials yet." />
      )}

      {!isLoading && testimonials.length > 0 && (
        <Card>
          <Table minWidth={760}>
            <TableHead>
              <Th>Order</Th>
              <Th>Author</Th>
              <Th>Quote</Th>
              <Th>Status</Th>
              <Th align="right">Actions</Th>
            </TableHead>
            <tbody>
              {testimonials.map((t) => (
                <Tr key={t.id}>
                  <Td className="tabular-nums text-slate-500">{t.sortOrder}</Td>
                  <Td>
                    <div className="font-medium text-slate-900">{t.authorName}</div>
                    {t.company && <div className="text-xs text-slate-500">{t.company}</div>}
                  </Td>
                  <Td className="max-w-md text-slate-600">
                    <span className="line-clamp-2">{t.quote}</span>
                    {t.result && (
                      <span className="mt-0.5 block text-xs font-medium text-sci-blue">
                        {t.result}
                      </span>
                    )}
                  </Td>
                  <Td>
                    <Badge status={t.isPublished ? 'PUBLISHED' : 'DRAFT'} />
                  </Td>
                  <Td align="right">
                    <div className="flex justify-end gap-1.5">
                      {canEdit && (
                        <IconButton icon={EditIcon} label="Edit" onClick={() => openEdit(t)} />
                      )}
                      {canDelete && (
                        <IconButton
                          icon={TrashIcon}
                          label="Delete"
                          variant="danger"
                          onClick={() => setPendingDelete(t)}
                        />
                      )}
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={form.id ? 'Edit testimonial' : 'Add testimonial'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Author"
              required
              value={form.authorName}
              onChange={(e) => setForm({ ...form, authorName: e.target.value })}
            />
            <TextField
              label="Company"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
            />
          </div>

          <TextAreaField
            label="Quote"
            required
            rows={4}
            value={form.quote}
            onChange={(e) => setForm({ ...form, quote: e.target.value })}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Result"
              placeholder="300% operational scaling"
              value={form.result}
              onChange={(e) => setForm({ ...form, result: e.target.value })}
            />
            <TextField
              label="Sort order"
              type="number"
              min={0}
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
            />
          </div>

          {/* Reuses the category image endpoint — it's the generic single-image
              upload, and there is no testimonial-specific bucket. */}
          <ImageUploadField
            label="Author Photo"
            value={form.imageUrl}
            onChange={(url) => setForm({ ...form, imageUrl: url })}
            upload={uploadCategoryImage}
          />

          <SelectField
            label="Status"
            value={form.isPublished ? 'published' : 'draft'}
            onChange={(e) => setForm({ ...form, isPublished: e.target.value === 'published' })}
          >
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </SelectField>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saveMutation.isPending}>
              {form.id ? 'Save Changes' : 'Add Testimonial'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete testimonial"
        message={`Delete the testimonial from ${pendingDelete?.authorName}? This cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && deleteMutation.mutate(pendingDelete.id)}
      />
    </div>
  );
}
