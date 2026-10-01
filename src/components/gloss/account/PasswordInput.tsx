'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * A password input with a show/hide toggle, in the prototype's r-field look.
 *
 * The toggle is icon-only, so it carries an aria-label that names what it will
 * do, plus aria-pressed for its state. It stays out of the tab order
 * (tabIndex -1) as before: keyboard users tab from the password straight to
 * the next field, and the browser's own reveal control is still available.
 */
export function PasswordInput({
  id,
  value,
  onChange,
  required,
  minLength,
  autoComplete,
  className,
  showLabel = 'Show password',
  hideLabel = 'Hide password',
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
  className?: string;
  showLabel?: string;
  hideLabel?: string;
}) {
  const [visible, setVisible] = useState(false);
  const label = visible ? hideLabel : showLabel;

  return (
    <div className="ga-password">
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={className}
      />
      <button
        type="button"
        className="r-icon-button"
        onClick={() => setVisible((v) => !v)}
        aria-label={label}
        title={label}
        aria-pressed={visible}
        tabIndex={-1}
      >
        {visible ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
      </button>
    </div>
  );
}
