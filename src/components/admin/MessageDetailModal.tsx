import { Modal, Button, Badge } from '@/components/ui';
import { ArchiveIcon, CheckCircleIcon, ReplyIcon, TrashIcon } from '@/components/icons';

/**
 * Generic inbox-style message detail view — built for Contact Messages but
 * intentionally decoupled from that entity (plain string/callback props) so
 * it can be reused for any other "sender + subject + body" inbox later
 * (e.g. Quote Requests) without changes.
 */
export function MessageDetailModal({
  open,
  onClose,
  senderName,
  senderEmail,
  senderPhone,
  subject,
  body,
  receivedAt,
  status,
  isReplied,
  busy,
  onArchiveToggle,
  onMarkUnread,
  onToggleReplied,
  onDelete,
}: {
  open: boolean;
  onClose: () => void;
  senderName: string;
  senderEmail: string;
  senderPhone?: string | null;
  subject: string;
  body: string;
  receivedAt: string;
  status: 'UNREAD' | 'READ' | 'ARCHIVED';
  isReplied: boolean;
  busy?: boolean;
  onArchiveToggle: () => void;
  onMarkUnread: () => void;
  onToggleReplied: () => void;
  onDelete: () => void;
}) {
  if (!open) return null;

  const mailtoHref = `mailto:${senderEmail}?subject=${encodeURIComponent(`Re: ${subject}`)}`;
  const received = new Date(receivedAt);

  return (
    <Modal open={open} onClose={onClose} title={subject}>
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{senderName}</p>
            <p className="truncate text-xs text-slate-500">{senderEmail}</p>
            {senderPhone && <p className="text-xs text-slate-500">{senderPhone}</p>}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <Badge status={status} />
            {isReplied && <Badge status="WON" />}
          </div>
        </div>

        <p className="text-xs text-slate-400">
          {received.toLocaleDateString()} · {received.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>

        <div className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          {body}
        </div>

        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          <a href={mailtoHref}>
            <Button variant="primary" size="sm" icon={ReplyIcon}>
              Reply by email
            </Button>
          </a>
          <Button variant="secondary" size="sm" icon={CheckCircleIcon} disabled={busy} onClick={onToggleReplied}>
            {isReplied ? 'Mark not replied' : 'Mark replied'}
          </Button>
          {status !== 'UNREAD' && (
            <Button variant="secondary" size="sm" disabled={busy} onClick={onMarkUnread}>
              Mark unread
            </Button>
          )}
          <Button variant="secondary" size="sm" icon={ArchiveIcon} disabled={busy} onClick={onArchiveToggle}>
            {status === 'ARCHIVED' ? 'Unarchive' : 'Archive'}
          </Button>
          <Button variant="danger" size="sm" icon={TrashIcon} disabled={busy} onClick={onDelete} className="ml-auto">
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
}
