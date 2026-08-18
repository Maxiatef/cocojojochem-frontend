'use client';

import { useRef, useState } from 'react';
import { getFriendlyErrorMessage } from '@/lib/errorMessages';
import { ImagePlaceholderIcon, TrashIcon } from '@/components/icons';

export function ImageUploadField({
  label,
  value,
  onChange,
  upload,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  upload: (file: File) => Promise<string>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const url = await upload(file);
      onChange(url);
    } catch (err) {
      setError(getFriendlyErrorMessage(err, 'upload'));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      <div className="flex items-center gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImagePlaceholderIcon className="h-6 w-6 text-slate-300" />
          )}
        </div>

        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              disabled={uploading}
              className="block w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-brand-700 hover:file:bg-brand-100"
            />
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                aria-label="Remove image"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
              >
                <TrashIcon className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {uploading && <p className="text-xs text-slate-400">Uploading…</p>}
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}
