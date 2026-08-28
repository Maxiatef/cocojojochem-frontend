export const STATUS_CARD_TONES: Record<string, { ring: string; value: string }> = {
  brand: { ring: 'border-brand-500 ring-brand-100', value: 'text-brand-700' },
  green: { ring: 'border-green-500 ring-green-100', value: 'text-green-700' },
  red: { ring: 'border-red-500 ring-red-100', value: 'text-red-700' },
  amber: { ring: 'border-amber-500 ring-amber-100', value: 'text-amber-700' },
  slate: { ring: 'border-slate-400 ring-slate-100', value: 'text-slate-700' },
};

// A stat tile that doubles as a filter toggle — clicking it filters the table
// below to that status, clicking it again clears the filter. The hover
// lift/border and cursor-pointer are the only signal it's clickable, so make
// them obvious rather than subtle. Shared between the admin Products and
// Users pages (and anywhere else that wants the same clickable stat tiles).
export function StatusCard({
  label,
  value,
  onClick,
  active = false,
  tone = 'brand',
}: {
  label: string;
  value: number;
  onClick: () => void;
  active?: boolean;
  tone?: keyof typeof STATUS_CARD_TONES;
}) {
  const t = STATUS_CARD_TONES[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        active ? `${t.ring} ring-2` : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className={`mt-1 text-xl font-semibold ${active ? t.value : 'text-slate-900'}`}>{value}</p>
    </button>
  );
}
