import { SavingsResult, TaxType } from "./types";

/** 과세 유형별 세율 */
function getTaxRate(taxType: TaxType): number {
  switch (taxType) {
    case "normal":
      return 0.154;     // 일반과세 15.4%
    case "taxFree":
      return 0;          // 비과세
    case "taxReduced":
      return 0.095;      // 세금우대 9.5%
  }
}

/**
 * 정기예금 (거치식) 수익 계산
 * 일시 납입 → 만기 수령
 * 세전 이자 = 원금 × 연이율 × 기간(년)
 */
export function calculateSavings(
  principal: number,
  annualRate: number,
  months: number,
  taxType: TaxType
): SavingsResult {
  const years = months / 12;
  const grossInterest = principal * (annualRate / 100) * years;
  const taxRate = getTaxRate(taxType);
  const tax = grossInterest * taxRate;
  const netInterest = grossInterest - tax;
  const totalAmount = principal + netInterest;

  return {
    principal,
    grossInterest,
    tax,
    netInterest,
    totalAmount,
  };
}

/**
 * 월별 누적 정기예금 수익 계산 (차트용)
 */
export function calculateMonthlySavingsAccumulation(
  principal: number,
  annualRate: number,
  months: number,
  taxType: TaxType
): { month: number; cumulativeNetInterest: number }[] {
  const taxRate = getTaxRate(taxType);
  const result: { month: number; cumulativeNetInterest: number }[] = [];

  for (let m = 1; m <= months; m++) {
    const years = m / 12;
    const grossInterest = principal * (annualRate / 100) * years;
    const tax = grossInterest * taxRate;
    const netInterest = grossInterest - tax;
    result.push({ month: m, cumulativeNetInterest: netInterest });
  }

  return result;
}
