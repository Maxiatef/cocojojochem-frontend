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
                    ? 'border-sci-blue bg-sci-blue text-white'
                    : active
                      ? 'border-sci-blue bg-white text-sci-blue'
                      : 'border-sci-border bg-white text-sci-muted'
                }`}
              >
                {done ? '✓' : idx + 1}
              </span>
              <span
                className={`whitespace-nowrap text-[11px] font-medium uppercase tracking-wide ${
                  done || active ? 'text-sci-navy' : 'text-sci-muted'
                }`}
              >
                {step}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`mx-2 h-px flex-1 ${done ? 'bg-sci-blue' : 'bg-sci-border'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
