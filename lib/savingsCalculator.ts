import { SavingsResult, TaxType, InterestType } from "./types";

/** 과세 유형별 세율 */
function getTaxRate(taxType: TaxType): number {
  switch (taxType) {
    case "normal":
      return 0.154;     // 일반과세 15.4% (소득세 14% + 지방소득세 1.4%)
    case "taxFree":
      return 0;          // 비과세
    case "taxReduced":
      return 0.095;      // 세금우대 9.5%
  }
}

/**
 * 정기예금 (거치식) 수익 계산
 * 일시 납입 → 만기 수령
 *
 * 단리: 세전 이자 = 원금 × 연이율 × 기간(년)
 * 월복리: 만기금액 = 원금 × (1 + 연이율/12)^(개월수), 세전 이자 = 만기금액 - 원금
 */
export function calculateSavings(
  principal: number,
  annualRate: number,
  months: number,
  taxType: TaxType,
  interestType: InterestType = "monthlyCompound"
): SavingsResult {
  const rate = annualRate / 100;
  let grossInterest: number;

  if (interestType === "simple") {
    // 단리 계산
    const years = months / 12;
    grossInterest = principal * rate * years;
  } else {
    // 월복리 계산
    const monthlyRate = rate / 12;
    const maturityAmount = principal * Math.pow(1 + monthlyRate, months);
    grossInterest = maturityAmount - principal;
  }

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
  taxType: TaxType,
  interestType: InterestType = "monthlyCompound"
): { month: number; cumulativeNetInterest: number }[] {
  const taxRate = getTaxRate(taxType);
  const rate = annualRate / 100;
  const result: { month: number; cumulativeNetInterest: number }[] = [];

  for (let m = 1; m <= months; m++) {
    let grossInterest: number;

    if (interestType === "simple") {
      // 단리 계산
      const years = m / 12;
      grossInterest = principal * rate * years;
    } else {
      // 월복리 계산
      const monthlyRate = rate / 12;
      const maturityAmount = principal * Math.pow(1 + monthlyRate, m);
      grossInterest = maturityAmount - principal;
    }

    const tax = grossInterest * taxRate;
    const netInterest = grossInterest - tax;
    result.push({ month: m, cumulativeNetInterest: netInterest });
  }

  return result;
}
