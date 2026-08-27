// Simple linear breadcrumb-style step indicator for checkout — not
// interactive (unlike the admin OrderStatusStepper), just shows where the
// shopper is in Cart -> Shipping -> Payment.
const STEPS = ['Cart', 'Shipping', 'Payment'] as const;

export function CheckoutStepper({ current }: { current: 0 | 1 | 2 }) {
  return (
    <div className="flex items-center" aria-label="Checkout progress">
      {STEPS.map((step, idx) => {
        const done = idx < current;
        const active = idx === current;
        return (
          <div key={step} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition ${
                  done
                    ? 'border-olive-700 bg-olive-700 text-white'
                    : active
                      ? 'border-olive-700 bg-white text-olive-700'
                      : 'border-sand-300 bg-white text-ink-soft'
                }`}
              >
                {done ? '✓' : idx + 1}
              </span>
              <span
                className={`whitespace-nowrap text-[11px] font-medium uppercase tracking-wide ${
                  done || active ? 'text-ink' : 'text-ink-soft/70'
                }`}
              >
                {step}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`mx-2 h-px flex-1 ${done ? 'bg-olive-700' : 'bg-sand-300'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
