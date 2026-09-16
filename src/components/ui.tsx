'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { CloseIcon } from '@/components/icons';

// --- Toast ------------------------------------------------------------------

type ToastVariant = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  show: (message: string, variant?: ToastVariant) => void;
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_VARIANT_STYLES: Record<ToastVariant, string> = {
  success: 'border-green-200 bg-green-50 text-green-800',
  error: 'border-red-200 bg-red-50 text-red-800',
  info: 'border-sci-border bg-white text-sci-navy',
};

const TOAST_VARIANT_ICON: Record<ToastVariant, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const show = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = ++idRef.current;
    setToasts((list) => [...list, { id, message, variant }]);
    setTimeout(() => {
      setToasts((list) => list.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const value: ToastContextValue = {
    show,
    success: (message) => show(message, 'success'),
    error: (message) => show(message, 'error'),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-2 rounded-lg border px-4 py-2.5 font-sci-body text-sci-label font-medium shadow-lg ${TOAST_VARIANT_STYLES[t.variant]}`}
          >
            <span aria-hidden>{TOAST_VARIANT_ICON[t.variant]}</span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}

export function StatCard({
  label,
  value,
  sublabel,
  accent = 'brand',
  icon: Icon,
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  accent?: 'brand' | 'amber' | 'red' | 'slate';
  icon?: (props: { className?: string }) => React.ReactElement;
}) {
  const accents: Record<string, string> = {
    brand: 'bg-sci-blue/10 text-sci-blue',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-700',
    slate: 'bg-sci-pale text-sci-muted',
  };
  return (
    <div className="rounded-xl border border-sci-border bg-white p-5">
      <div className="flex items-start justify-between">
        <p className="font-sci-body text-sci-label font-medium text-sci-muted">{label}</p>
        {Icon && (
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${accents[accent]}`}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <p className="mt-2 font-sci-heading text-[28px] font-semibold leading-9 text-sci-navy">
        {value}
      </p>
      {sublabel && (
        <span className={`mt-3 inline-block rounded-full px-2.5 py-1 text-xs font-medium ${accents[accent]}`}>
          {sublabel}
        </span>
      )}
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  NEW: 'bg-blue-50 text-blue-700',
  IN_PROGRESS: 'bg-amber-50 text-amber-700',
  QUOTED: 'bg-purple-50 text-purple-700',
  WON: 'bg-green-50 text-green-700',
  LOST: 'bg-slate-100 text-slate-500',
  PENDING: 'bg-amber-50 text-amber-700',
  PROCESSING: 'bg-blue-50 text-blue-700',
  SHIPPED: 'bg-purple-50 text-purple-700',
  DELIVERED: 'bg-green-50 text-green-700',
  CANCELLED: 'bg-red-50 text-red-700',
  APPROVED: 'bg-green-50 text-green-700',
  REJECTED: 'bg-red-50 text-red-700',
  SUSPENDED: 'bg-slate-100 text-slate-500',
  ACTIVE: 'bg-green-50 text-green-700',
  DELETED: 'bg-red-50 text-red-700',
  IN_STOCK: 'bg-green-50 text-green-700',
  OUT_OF_STOCK: 'bg-red-50 text-red-700',
  ON_BACKORDER: 'bg-slate-100 text-slate-500',
  UNREAD: 'bg-blue-50 text-blue-700',
  READ: 'bg-slate-100 text-slate-500',
  ARCHIVED: 'bg-slate-100 text-slate-400',
  CRITICAL: 'bg-red-50 text-red-700',
  HIGH: 'bg-orange-50 text-orange-700',
  MEDIUM: 'bg-amber-50 text-amber-700',
  LOW: 'bg-slate-100 text-slate-500',
  // Audit log
  CREATE: 'bg-green-50 text-green-700',
  UPDATE: 'bg-amber-50 text-amber-700',
  DELETE: 'bg-red-50 text-red-700',
  LOGIN: 'bg-blue-50 text-blue-700',
  LOGIN_FAILED: 'bg-red-50 text-red-700',
  LOGOUT: 'bg-slate-100 text-slate-500',
  PASSWORD_CHANGE: 'bg-purple-50 text-purple-700',
  SESSION_REVOKE: 'bg-orange-50 text-orange-700',
  SYSTEM: 'bg-slate-100 text-slate-500',
  SALES: 'bg-blue-50 text-blue-700',
  // Testimonials
  PUBLISHED: 'bg-green-50 text-green-700',
  DRAFT: 'bg-slate-100 text-slate-500',
};

export function Badge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
        STATUS_STYLES[status] || 'bg-sci-pale text-sci-muted'
      }`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}

export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-6">
      <h1 className="font-sci-heading text-[26px] font-semibold leading-9 text-sci-navy">{title}</h1>
      {description && (
        <p className="mt-1 font-sci-body text-sci-label text-sci-muted">{description}</p>
      )}
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-sci-blue border-t-transparent" />
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {message}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-sci-border bg-white px-4 py-12 text-center font-sci-body text-sci-label text-sci-muted">
      {message}
    </div>
  );
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-sci-border bg-white ${className}`}>
      {children}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'md' | 'lg' | 'xl';
}) {
  if (!open) return null;
  const maxWidth = size === 'xl' ? 'max-w-4xl' : size === 'lg' ? 'max-w-2xl' : 'max-w-md';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 bg-sci-deep/50" onClick={onClose} />
      <div className={`relative z-10 flex max-h-full w-full ${maxWidth} flex-col rounded-xl bg-white shadow-xl`}>
        <div className="flex shrink-0 items-center justify-between border-b border-sci-border px-6 py-4">
          <h2 className="pr-8 font-sci-heading text-[17px] font-semibold text-sci-navy">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sci-muted transition hover:bg-sci-pale hover:text-sci-navy"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-4">{children}</div>
      </div>
    </div>
  );
}

/**
 * The red star on a required field's label.
 *
 * Driven by the same `required` prop that already reaches the input, so the
 * mark and the browser's own validation can never disagree — a field cannot
 * be starred without actually being required, or required without being
 * starred. aria-hidden because the input's `required` already tells a screen
 * reader; announcing "asterisk" as well is noise.
 */
function RequiredMark({ required }: { required?: boolean }) {
  if (!required) return null;
  return (
    <span aria-hidden className="ml-0.5 text-red-500">
      *
    </span>
  );
}

export function TextField({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      {/* An empty label is a deliberate caller signal that the field is
          already labelled by its surrounding layout (see the admin user
          editor's two-column FieldRow) — rendering the element anyway would
          leave a stray gap above the input. */}
      {label && (
        <label className="mb-1.5 block font-sci-body text-sci-label font-medium text-sci-navy">
          {label}
          <RequiredMark required={props.required} />
        </label>
      )}
      <input
        {...props}
        className="w-full rounded-lg border border-sci-border px-3.5 py-2 font-sci-body text-sci-label text-sci-navy outline-none transition placeholder:text-sci-muted focus:border-sci-blue focus:ring-2 focus:ring-sci-blue/15"
      />
    </div>
  );
}

export function TextAreaField({
  label,
  ...props
}: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      <label className="mb-1.5 block font-sci-body text-sci-label font-medium text-sci-navy">
        {label}
        <RequiredMark required={props.required} />
      </label>
      <textarea
        {...props}
        className="w-full rounded-lg border border-sci-border px-3.5 py-2 font-sci-body text-sci-label text-sci-navy outline-none transition placeholder:text-sci-muted focus:border-sci-blue focus:ring-2 focus:ring-sci-blue/15"
      />
    </div>
  );
}

export function SelectField({
  label,
  children,
  ...props
}: { label: string; children: React.ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      {/* Empty label = labelled by the surrounding layout; see TextField. */}
      {label && (
        <label className="mb-1.5 block font-sci-body text-sci-label font-medium text-sci-navy">
          {label}
          <RequiredMark required={props.required} />
        </label>
      )}
      <select
        {...props}
        className="w-full rounded-lg border border-sci-border bg-white px-3.5 py-2 font-sci-body text-sci-label text-sci-navy outline-none transition focus:border-sci-blue focus:ring-2 focus:ring-sci-blue/15"
      >
        {children}
      </select>
    </div>
  );
}

// --- Button ---------------------------------------------------------------

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md';

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-sci-navy text-white hover:bg-sci-deep disabled:opacity-60',
  secondary: 'border border-sci-border text-sci-navy hover:bg-sci-pale disabled:opacity-60',
  danger: 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-60',
  ghost: 'text-sci-muted hover:bg-sci-pale hover:text-sci-navy disabled:opacity-60',
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  className = '',
  children,
  disabled,
  ...props
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: (props: { className?: string }) => React.ReactElement;
  className?: string;
  children?: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-sci-body font-medium transition ${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        Icon && <Icon className="h-4 w-4" />
      )}
      {children}
    </button>
  );
}

export function IconButton({
  icon: Icon,
  label,
  variant = 'ghost',
  className = '',
  ...props
}: {
  icon: (props: { className?: string }) => React.ReactElement;
  label: string;
  variant?: 'ghost' | 'danger';
} & React.ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }) {
  const variants = {
    ghost: 'text-sci-muted hover:bg-sci-pale hover:text-sci-navy',
    danger: 'text-sci-muted hover:bg-red-50 hover:text-red-600',
  };
  return (
    // `title` carries the same string as `aria-label`, so the hover tooltip
    // and the screen-reader name can never describe the button differently.
    // These buttons are icon-only: without it, the only way to find out what
    // the bin or the box does is to click one.
    //
    // Declared before {...props} so a caller with something longer to say —
    // the reason an action is unavailable, say — can still override it.
    <button
      aria-label={label}
      title={label}
      className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${variants[variant]} ${className}`}
      {...props}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

// --- Pagination -------------------------------------------------------------

export function Pagination({
  page,
  totalPages,
  onPageChange,
  totalItems,
  itemLabel = 'item',
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemLabel?: string;
}) {
  if (totalPages <= 1 && totalItems == null) return null;
  return (
    <div className="flex flex-col gap-2 border-t border-sci-border px-5 py-3 font-sci-body text-xs text-sci-muted sm:flex-row sm:items-center sm:justify-between">
      {totalItems != null && (
        <span>
          {totalItems} {itemLabel}
          {totalItems === 1 ? '' : 's'} total
        </span>
      )}
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="rounded-lg border border-sci-border px-2.5 py-1 transition hover:bg-sci-pale disabled:opacity-40 disabled:hover:bg-transparent"
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="rounded-lg border border-sci-border px-2.5 py-1 transition hover:bg-sci-pale disabled:opacity-40 disabled:hover:bg-transparent"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

// --- Table (thin semantic wrappers for consistent styling) ------------------

// Tall enough that the scrollbar has somewhere to draw on every platform.
const BAR_HEIGHT = 16;

export function Table({ children, minWidth = 640 }: { children: React.ReactNode; minWidth?: number }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const proxyRef = useRef<HTMLDivElement>(null);
  const [scrollWidth, setScrollWidth] = useState(0);
  const [bar, setBar] = useState<{ left: number; width: number } | null>(null);

  // A wide table's own scrollbar sits at the bottom of the table, which on a
  // long list is far below the fold — so to scroll sideways you first had to
  // scroll all the way down, losing the rows you were reading. This adds a
  // second scrollbar along the bottom of the screen for as long as the real
  // one is out of view, and drops it once the real one is reachable, so there
  // are never two visible at once.
  //
  // Fixed and measured rather than `position: sticky`: the admin shell's
  // <main> is an overflow-y-auto container, which makes it the sticky
  // ancestor, so a sticky bar pins to the bottom of that element — well below
  // the viewport — and is never seen.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const sync = () => {
      const overflows = el.scrollWidth > el.clientWidth + 1;
      const box = el.getBoundingClientRect();
      const viewportH = window.innerHeight || document.documentElement.clientHeight;
      const needed = overflows && box.bottom > viewportH - BAR_HEIGHT && box.top < viewportH;
      setBar(needed ? { left: box.left, width: box.width } : null);
      setScrollWidth(el.scrollWidth);
      // Deliberately does NOT push el.scrollLeft onto the proxy. This runs on
      // the capture phase, so dragging the proxy reaches it BEFORE the proxy's
      // own onScroll has told the table to follow — it would read the table's
      // old position and snap the bar straight back, making the bar look dead.
      // The two onScroll handlers already keep the pair in step.
    };

    sync();
    // Capture phase: the page may not be what scrolls — the admin shell scrolls
    // an inner element, whose scroll events never reach window on the bubble
    // phase.
    window.addEventListener('scroll', sync, { passive: true, capture: true });
    window.addEventListener('resize', sync);
    // Rows arriving, a filter shrinking the table, or columns changing width
    // all change whether this is needed.
    const observer = new ResizeObserver(sync);
    observer.observe(el);

    return () => {
      window.removeEventListener('scroll', sync, { capture: true });
      window.removeEventListener('resize', sync);
      observer.disconnect();
    };
  }, [children]);

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="overflow-x-auto"
        onScroll={(e) => {
          // Guarded against feeding each other in a loop: assigning scrollLeft
          // fires the other element's scroll handler too.
          const proxy = proxyRef.current;
          if (proxy && proxy.scrollLeft !== e.currentTarget.scrollLeft) {
            proxy.scrollLeft = e.currentTarget.scrollLeft;
          }
        }}
      >
        <table className="w-full text-left font-sci-body text-sci-label" style={{ minWidth }}>
          {children}
        </table>
      </div>

      {bar && (
        <div
          ref={proxyRef}
          onScroll={(e) => {
            const main = scrollRef.current;
            if (main && main.scrollLeft !== e.currentTarget.scrollLeft) {
              main.scrollLeft = e.currentTarget.scrollLeft;
            }
          }}
          className="fixed bottom-0 z-30 overflow-x-auto overflow-y-hidden border-t border-sci-border bg-white/95 shadow-[0_-2px_6px_rgba(15,23,42,0.06)] backdrop-blur"
          style={{ left: bar.left, width: bar.width, height: BAR_HEIGHT }}
          aria-hidden
        >
          {/* Nothing to show — this element exists only for its scrollbar. */}
          <div style={{ width: scrollWidth, height: 1 }} />
        </div>
      )}
    </div>
  );
}

export function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-sci-border text-xs uppercase tracking-wide text-sci-muted">
        {children}
      </tr>
    </thead>
  );
}

export function Th({
  children,
  align = 'left',
  sortDirection,
  onSort,
}: {
  children: React.ReactNode;
  align?: 'left' | 'right';
  // When provided, renders this header as a clickable sort toggle.
  // 'asc' | 'desc' shows the active arrow; null/undefined means this column
  // isn't the current sort key.
  sortDirection?: 'asc' | 'desc' | null;
  onSort?: () => void;
}) {
  if (!onSort) {
    return (
      <th className={`px-5 py-3 font-medium ${align === 'right' ? 'text-right' : 'text-left'}`}>
        {children}
      </th>
    );
  }
  return (
    <th className={`px-5 py-3 font-medium ${align === 'right' ? 'text-right' : 'text-left'}`}>
      <button
        type="button"
        onClick={onSort}
        className={`inline-flex items-center gap-1 hover:text-sci-navy ${
          sortDirection ? 'text-sci-navy' : 'text-sci-muted'
        } ${align === 'right' ? 'flex-row-reverse' : ''}`}
      >
        {children}
        <span className="text-[10px] leading-none">
          {sortDirection === 'asc' ? '▲' : sortDirection === 'desc' ? '▼' : '⇅'}
        </span>
      </button>
    </th>
  );
}

export function Td({
  children,
  align = 'left',
  className = '',
}: {
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
}) {
  return (
    <td className={`px-5 py-3.5 ${align === 'right' ? 'text-right' : 'text-left'} ${className}`}>
      {children}
    </td>
  );
}

export function Tr({
  children,
  onClick,
}: {
  children: React.ReactNode;
  /** Makes the whole row activate. Keyboard support comes with it. */
  onClick?: () => void;
}) {
  if (!onClick) {
    return <tr className="border-b border-sci-border/60 last:border-0">{children}</tr>;
  }

  // role="link" + tabIndex + Enter/Space keeps a clickable row reachable
  // without a mouse; a row that only responds to click is invisible to
  // keyboard and screen-reader users.
  return (
    <tr
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      role="link"
      tabIndex={0}
      className="cursor-pointer border-b border-sci-border/60 transition last:border-0 hover:bg-sci-pale focus:bg-sci-pale focus:outline-none"
    >
      {children}
    </tr>
  );
}

// --- Confirm dialog (replaces window.confirm with a styled modal) -----------

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  danger = true,
  loading = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="font-sci-body text-sci-label text-sci-muted">{message}</p>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant={danger ? 'danger' : 'primary'} size="sm" loading={loading} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
