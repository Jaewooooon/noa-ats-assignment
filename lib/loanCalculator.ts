import Decimal from "decimal.js";
import { AmortizationRow, LoanResult, PrepaymentResult, RepaymentMethod } from "./types";

/** 금액(원)을 Decimal에서 반올림하여 number로 변환 */
function toYen(d: Decimal): number {
  return d.toDecimalPlaces(0, Decimal.ROUND_HALF_UP).toNumber();
}

function assertNonNegative(name: string, value: number) {
  if (!Number.isFinite(value) || Number.isNaN(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative finite number`);
  }
}

function assertPositiveInteger(name: string, value: number) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new RangeError(`${name} must be a positive integer`);
  }
}

/**
 * 원리금균등상환 스케줄 계산
 * 월 상환액 = P × r(1+r)^n / ((1+r)^n - 1)
 */
function calculateEqualPrincipalAndInterest(
  principal: number,
  annualRate: number,
  months: number
): AmortizationRow[] {
  const P = new Decimal(principal);
  const monthlyRate = new Decimal(annualRate).div(100).div(12);
  const schedule: AmortizationRow[] = [];
  let remaining = P;
  let cumulativeInterest = new Decimal(0);

  if (monthlyRate.isZero()) {
    const monthlyPrincipal = P.div(months);
    for (let m = 1; m <= months; m++) {
      const principalPayment = m === months ? remaining : monthlyPrincipal;
      remaining = remaining.minus(principalPayment);
      schedule.push({
        month: m,
        principalPayment: toYen(principalPayment),
        interestPayment: 0,
        totalPayment: toYen(principalPayment),
        remainingBalance: Math.max(0, toYen(remaining)),
        cumulativeInterest: 0,
      });
    }
    return schedule;
  }

  const onePlusR = new Decimal(1).plus(monthlyRate);
  const powN = onePlusR.pow(months);
  const monthlyPayment = P.times(monthlyRate.times(powN)).div(powN.minus(1));
  let principalPaidSoFar = 0;

  for (let m = 1; m <= months; m++) {
    const isLast = m === months;
    const interestPayment = remaining.times(monthlyRate);
    let principalPayment: Decimal;
    if (isLast) {
      principalPayment = new Decimal(principal).minus(principalPaidSoFar);
    } else {
      principalPayment = monthlyPayment.minus(interestPayment);
    }
    remaining = remaining.minus(principalPayment);
    cumulativeInterest = cumulativeInterest.plus(interestPayment);

    const principalYen = toYen(principalPayment);
    principalPaidSoFar += principalYen;

    schedule.push({
      month: m,
      principalPayment: principalYen,
      interestPayment: toYen(interestPayment),
      totalPayment: toYen(principalPayment.plus(interestPayment)),
      remainingBalance: isLast ? 0 : Math.max(0, toYen(remaining)),
      cumulativeInterest: toYen(cumulativeInterest),
    });
  }

  return schedule;
}

/**
 * 원금균등상환 스케줄 계산
 * 월 원금 = P/n, 월 이자 = 잔여원금 × r
 */
function calculateEqualPrincipal(
  principal: number,
  annualRate: number,
  months: number
): AmortizationRow[] {
  const P = new Decimal(principal);
  const monthlyRate = new Decimal(annualRate).div(100).div(12);
  const monthlyPrincipal = P.div(months);
  const schedule: AmortizationRow[] = [];
  let remaining = P;
  let cumulativeInterest = new Decimal(0);

  for (let m = 1; m <= months; m++) {
    const interestPayment = remaining.times(monthlyRate);
    const principalPayment = m === months ? remaining : monthlyPrincipal;
    remaining = remaining.minus(principalPayment);
    cumulativeInterest = cumulativeInterest.plus(interestPayment);

    schedule.push({
      month: m,
      principalPayment: toYen(principalPayment),
      interestPayment: toYen(interestPayment),
      totalPayment: toYen(principalPayment.plus(interestPayment)),
      remainingBalance: Math.max(0, toYen(remaining)),
      cumulativeInterest: toYen(cumulativeInterest),
    });
  }

  return schedule;
}

/**
 * 만기일시상환 스케줄 계산
 * 매월 이자만 납부, 만기에 원금 일시 상환
 */
function calculateBulletRepayment(
  principal: number,
  annualRate: number,
  months: number
): AmortizationRow[] {
  const P = new Decimal(principal);
  const monthlyRate = new Decimal(annualRate).div(100).div(12);
  const monthlyInterest = P.times(monthlyRate);
  const schedule: AmortizationRow[] = [];
  let cumulativeInterest = new Decimal(0);

  for (let m = 1; m <= months; m++) {
    const isLast = m === months;
    const principalPayment = isLast ? P : new Decimal(0);
    cumulativeInterest = cumulativeInterest.plus(monthlyInterest);

    schedule.push({
      month: m,
      principalPayment: toYen(principalPayment),
      interestPayment: toYen(monthlyInterest),
      totalPayment: toYen(principalPayment.plus(monthlyInterest)),
      remainingBalance: isLast ? 0 : principal,
      cumulativeInterest: toYen(cumulativeInterest),
    });
  }

  return schedule;
}

/** 상환 방식에 따른 스케줄 계산 */
export function calculateSchedule(
  principal: number,
  annualRate: number,
  months: number,
  method: RepaymentMethod
): AmortizationRow[] {
  assertNonNegative("principal", principal);
  assertNonNegative("annualRate", annualRate);
  assertPositiveInteger("months", months);

  switch (method) {
    case "equalPrincipalAndInterest":
      return calculateEqualPrincipalAndInterest(principal, annualRate, months);
    case "equalPrincipal":
      return calculateEqualPrincipal(principal, annualRate, months);
    case "bulletRepayment":
      return calculateBulletRepayment(principal, annualRate, months);
  }
}

/** 스케줄로부터 LoanResult 생성 */
export function toLoanResult(schedule: AmortizationRow[]): LoanResult {
  const totalInterest = schedule.reduce((sum, r) => sum + r.interestPayment, 0);
  const totalPayment = schedule.reduce((sum, r) => sum + r.totalPayment, 0);
  return { schedule, totalInterest, totalPayment };
}

/**
 * 중도상환 시뮬레이션
 * 여유자금으로 원금 일부 상환 후 남은 기간 동안의 이자를 재계산
 */
export function simulatePrepayment(
  loanBalance: number,
  annualRate: number,
  remainingMonths: number,
  repaymentMethod: RepaymentMethod,
  extraFunds: number,
  prepaymentFeeRate: number
): PrepaymentResult {
  assertNonNegative("loanBalance", loanBalance);
  assertNonNegative("annualRate", annualRate);
  assertPositiveInteger("remainingMonths", remainingMonths);
  assertNonNegative("extraFunds", extraFunds);
  assertNonNegative("prepaymentFeeRate", prepaymentFeeRate);

  const actualPrepayment = Math.min(extraFunds, loanBalance);
  const newBalance = loanBalance - actualPrepayment;
  const prepaymentFee = new Decimal(actualPrepayment)
    .times(prepaymentFeeRate)
    .div(100)
    .toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
    .toNumber();

  const originalSchedule = calculateSchedule(
    loanBalance,
    annualRate,
    remainingMonths,
    repaymentMethod
  );
  const originalLoan = toLoanResult(originalSchedule);

  let prepaidLoan: LoanResult;
  if (newBalance <= 0) {
    prepaidLoan = { schedule: [], totalInterest: 0, totalPayment: 0 };
  } else {
    const prepaidSchedule = calculateSchedule(
      newBalance,
      annualRate,
      remainingMonths,
      repaymentMethod
    );
    prepaidLoan = toLoanResult(prepaidSchedule);
  }

  const interestSaved = originalLoan.totalInterest - prepaidLoan.totalInterest;
  const netBenefit = interestSaved - prepaymentFee;

  return {
    originalLoan,
    prepaidLoan,
    prepaymentFee,
    interestSaved,
    netBenefit,
  };
}
