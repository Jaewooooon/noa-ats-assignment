"use client";

import { formatNumberWithCommas } from "@/lib/formatter";

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  step?: number;
  min?: number;
  max?: number;
}

function sanitizeNumber(
  raw: number,
  min: number | undefined,
  max: number | undefined,
  fallback: number
): number {
  if (!Number.isFinite(raw) || Number.isNaN(raw)) return fallback;
  let v = raw;
  if (min !== undefined && v < min) v = min;
  if (max !== undefined && v > max) v = max;
  return v;
}

export default function NumberInput({
  label,
  value,
  onChange,
  suffix,
  step,
  min,
  max,
}: NumberInputProps) {
  const fallback = min ?? 0;
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/,/g, '');
    const raw = Number(rawValue);
    const sanitized = sanitizeNumber(raw, min, max, fallback);
    onChange(sanitized);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={formatNumberWithCommas(value)}
          onChange={handleChange}
          step={step}
          min={min}
          max={max}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-12 text-right text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
