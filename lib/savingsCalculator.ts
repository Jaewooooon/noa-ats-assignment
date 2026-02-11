import Decimal from "decimal.js";
import { SavingsResult, TaxType, InterestType } from "./types";

/** 과세 유형별 세율 */
function getTaxRate(taxType: TaxType): Decimal {
  switch (taxType) {
    case "normal":
      return new Decimal(0.154); // 일반과세 15.4% (소득세 14% + 지방소득세 1.4%)
    case "taxFree":
      return new Decimal(0);
    case "taxReduced":
      return new Decimal(0.095); // 세금우대 9.5%
  }
}

/** 금액(원)을 Decimal에서 반올림하여 number로 변환 */
function toYen(d: Decimal): number {
  return d.toDecimalPlaces(0, Decimal.ROUND_HALF_UP).toNumber();
}

/** 이자·세금 등 소수점 있을 수 있는 값을 반올림하여 number로 변환 */
function toRounded(d: Decimal, decimals = 0): number {
  return d.toDecimalPlaces(decimals, Decimal.ROUND_HALF_UP).toNumber();
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
  const P = new Decimal(principal);
  const rate = new Decimal(annualRate).div(100);
  let grossInterest: Decimal;

  if (interestType === "simple") {
    const years = new Decimal(months).div(12);
    grossInterest = P.times(rate).times(years);
  } else {
    const monthlyRate = rate.div(12);
    const maturityAmount = P.times(new Decimal(1).plus(monthlyRate).pow(months));
    grossInterest = maturityAmount.minus(P);
  }

  const taxRate = getTaxRate(taxType);
  const tax = grossInterest.times(taxRate);
  const netInterest = grossInterest.minus(tax);
  const totalAmount = P.plus(netInterest);

  return {
    principal,
    grossInterest: toRounded(grossInterest, 2),
    tax: toRounded(tax, 2),
    netInterest: toRounded(netInterest, 2),
    totalAmount: toRounded(totalAmount, 2),
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
  const P = new Decimal(principal);
  const rate = new Decimal(annualRate).div(100);
  const taxRate = getTaxRate(taxType);
  const result: { month: number; cumulativeNetInterest: number }[] = [];

  for (let m = 1; m <= months; m++) {
    let grossInterest: Decimal;

    if (interestType === "simple") {
      const years = new Decimal(m).div(12);
      grossInterest = P.times(rate).times(years);
    } else {
      const monthlyRate = rate.div(12);
      const maturityAmount = P.times(new Decimal(1).plus(monthlyRate).pow(m));
      grossInterest = maturityAmount.minus(P);
    }

    const tax = grossInterest.times(taxRate);
    const netInterest = grossInterest.minus(tax);
    result.push({ month: m, cumulativeNetInterest: toRounded(netInterest, 2) });
  }

  return result;
}
