export const VALIDATION_RULES = {
  loanBalance: { min: 0 },
  rate: { min: 0, max: 30 },
  savingsRate: { min: 0, max: 15 },
  months: { min: 1, max: 480 },
  prepaymentFeeRate: { min: 0, max: 5 },
  cost: { min: 0 },
} as const;

export function isInRange(
  value: number,
  range: { min: number; max?: number }
): boolean {
  if (!Number.isFinite(value) || Number.isNaN(value)) return false;
  if (value < range.min) return false;
  if (range.max !== undefined && value > range.max) return false;
  return true;
}

export function isPositiveIntegerInRange(
  value: unknown,
  range: { min: number; max?: number }
): value is number {
  if (!Number.isInteger(value)) return false;
  return isInRange(value as number, range);
}
