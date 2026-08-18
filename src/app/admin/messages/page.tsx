'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { ContactMessage, ContactMessageStatus } from '@/lib/types';
import {
  Badge,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  IconButton,
  LoadingState,
  PageHeader,
  Table,
  TableHead,
  Td,
  Th,
} from '@/components/ui';
import { ArchiveIcon, EyeIcon, TrashIcon } from '@/components/icons';
import { MessageDetailModal } from '@/components/admin/MessageDetailModal';

const TABS: { label: string; value: ContactMessageStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Unread', value: 'UNREAD' },
  { label: 'Read', value: 'READ' },
  { label: 'Archived', value: 'ARCHIVED' },
];

export default function AdminMessagesPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<ContactMessageStatus | 'ALL'>('ALL');
  const [openId, setOpenId] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ContactMessage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: messages, isLoading, isError } = useQuery({
    queryKey: ['contact-messages', tab],
    queryFn: () =>
      api.get<ContactMessage[]>(`/wholesale/contact-messages${tab !== 'ALL' ? `?status=${tab}` : ''}`),
  });

  // Fetching a single message marks it READ server-side — this is the
  // "opening it makes it read" behavior, no separate action needed.
  const { data: openMessage } = useQuery({
    queryKey: ['contact-message', openId],
    queryFn: () => api.get<ContactMessage>(`/wholesale/contact-messages/${openId}`),
    enabled: openId != null,
  });

  // Note: GET /contact-messages/:id marks the message READ as a side effect
  // (that's how "opening it makes it read" works) — so status/replied
  // mutations must NOT invalidate (and thus refetch) the single-message
  // query, or a "mark unread" would immediately get flipped back to READ
  // the moment its result re-fetches. Instead, seed the detail cache
  // directly from the mutation's response, which already reflects the
  // status we just set.
  function applyUpdatedMessage(updated: ContactMessage) {
    queryClient.setQueryData(['contact-message', updated.id], updated);
    queryClient.invalidateQueries({ queryKey: ['contact-messages'] });
    queryClient.invalidateQueries({ queryKey: ['contact-messages-stats'] });
  }

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: ContactMessageStatus }) =>
      api.patch<ContactMessage>(`/wholesale/contact-messages/${id}/status`, { status }),
    onSuccess: applyUpdatedMessage,
    onError: (err) => setError(getFriendlyErrorMessage(err)),
  });

  const setReplied = useMutation({
    mutationFn: ({ id, replied }: { id: number; replied: boolean }) =>
      api.patch<ContactMessage>(`/wholesale/contact-messages/${id}/replied`, { replied }),
    onSuccess: applyUpdatedMessage,
    onError: (err) => setError(getFriendlyErrorMessage(err)),
  });

  const deleteMessage = useMutation({
    mutationFn: (id: number) => api.delete(`/wholesale/contact-messages/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-messages'] });
      queryClient.invalidateQueries({ queryKey: ['contact-messages-stats'] });
      setPendingDelete(null);
      setOpenId(null);
    },
    onError: (err) => setError(getFriendlyErrorMessage(err)),
  });

  const busy = updateStatus.isPending || setReplied.isPending || deleteMessage.isPending;

  return (
    <div>
      <PageHeader title="Messages" description="Contact form submissions from the storefront." />

      <div className="mb-4 flex gap-1.5">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              tab === t.value ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>
      )}

      {isLoading && <LoadingState />}
      {isError && <ErrorState message="Couldn't load messages." />}
      {messages && messages.length === 0 && <EmptyState message="No messages here." />}

      {messages && messages.length > 0 && (
        <Card>
          <Table minWidth={720}>
            <TableHead>
              <Th>From</Th>
              <Th>Subject</Th>
              <Th>Received</Th>
              <Th>Status</Th>
              <Th align="right">Actions</Th>
            </TableHead>
            <tbody>
              {messages.map((m) => {
                const received = new Date(m.createdAt);
                return (
                  <tr
                    key={m.id}
                    onClick={() => setOpenId(m.id)}
                    className="cursor-pointer border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                    <Td>
                      <div className="flex items-center gap-2">
                        {m.status === 'UNREAD' && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-brand-600" />
                        )}
                        <div className="min-w-0">
                          <p className={`truncate ${m.status === 'UNREAD' ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
                            {m.fullName}
                          </p>
                          <p className="truncate text-xs text-slate-400">{m.email}</p>
                        </div>
                      </div>
                    </Td>
                    <Td className="max-w-xs truncate">{m.subject}</Td>
                    <Td className="text-slate-500">
                      {received.toLocaleDateString()}{' '}
                      <span className="text-xs text-slate-400">
                        {received.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-1.5">
                        <Badge status={m.status} />
                        {m.repliedAt && <Badge status="WON" />}
                      </div>
                    </Td>
                    <Td align="right">
                      <div className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <IconButton icon={EyeIcon} label="View" onClick={() => setOpenId(m.id)} />
                        <IconButton
                          icon={ArchiveIcon}
                          label={m.status === 'ARCHIVED' ? 'Unarchive' : 'Archive'}
                          onClick={() =>
                            updateStatus.mutate({ id: m.id, status: m.status === 'ARCHIVED' ? 'READ' : 'ARCHIVED' })
                          }
                        />
                        <IconButton icon={TrashIcon} label="Delete" variant="danger" onClick={() => setPendingDelete(m)} />
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card>
      )}

      {openMessage && (
        <MessageDetailModal
          open={openId != null}
          onClose={() => setOpenId(null)}
          senderName={openMessage.fullName}
          senderEmail={openMessage.email}
          senderPhone={openMessage.phone}
          subject={openMessage.subject}
          body={openMessage.message}
          receivedAt={openMessage.createdAt}
          status={openMessage.status}
          isReplied={!!openMessage.repliedAt}
          busy={busy}
          onArchiveToggle={() =>
            updateStatus.mutate({
              id: openMessage.id,
              status: openMessage.status === 'ARCHIVED' ? 'READ' : 'ARCHIVED',
            })
          }
          onMarkUnread={() => updateStatus.mutate({ id: openMessage.id, status: 'UNREAD' })}
          onToggleReplied={() => setReplied.mutate({ id: openMessage.id, replied: !openMessage.repliedAt })}
          onDelete={() => setPendingDelete(openMessage)}
        />
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete message"
        message={`Delete the message from "${pendingDelete?.fullName}"? This cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteMessage.isPending}
        onConfirm={() => pendingDelete && deleteMessage.mutate(pendingDelete.id)}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
