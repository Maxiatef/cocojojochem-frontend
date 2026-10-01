'use client';

import { Minus, Plus } from 'lucide-react';

/** The prototype's `r-quantity` stepper: − [n] +, clamped to 1–999. */
export function Quantity({
  value,
  onChange,
  min = 1,
  max = 999,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
}) {
  const clamp = (n: number) => Math.max(min, Math.min(max, Math.floor(n) || min));
  return (
    <div className="r-quantity">
      <button type="button" aria-label="Decrease quantity" disabled={value <= min} onClick={() => onChange(clamp(value - 1))}>
        <Minus size={15} />
      </button>
      <input
        type="number"
        min={min}
        max={max}
        aria-label="Quantity"
        value={value}
        onChange={(e) => onChange(clamp(Number(e.target.value)))}
      />
      <button type="button" aria-label="Increase quantity" disabled={value >= max} onClick={() => onChange(clamp(value + 1))}>
        <Plus size={15} />
      </button>
    </div>
  );
}
