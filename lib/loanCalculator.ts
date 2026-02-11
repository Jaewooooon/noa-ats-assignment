import { AmortizationRow, LoanResult, PrepaymentResult, RepaymentMethod } from "./types";

/**
 * 원리금균등상환 스케줄 계산
 * 월 상환액 = P × r(1+r)^n / ((1+r)^n - 1)
 */
function calculateEqualPrincipalAndInterest(
  principal: number,
  annualRate: number,
  months: number
): AmortizationRow[] {
  const monthlyRate = annualRate / 100 / 12;
  const schedule: AmortizationRow[] = [];
  let remaining = principal;
  let cumulativeInterest = 0;

  if (monthlyRate === 0) {
    const monthlyPrincipal = principal / months;
    for (let m = 1; m <= months; m++) {
      const principalPayment = m === months ? remaining : monthlyPrincipal;
      remaining -= principalPayment;
      schedule.push({
        month: m,
        principalPayment,
        interestPayment: 0,
        totalPayment: principalPayment,
        remainingBalance: Math.max(0, remaining),
        cumulativeInterest: 0,
      });
    }
    return schedule;
  }

  const monthlyPayment =
    principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);

  for (let m = 1; m <= months; m++) {
    const interestPayment = remaining * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    remaining -= principalPayment;
    cumulativeInterest += interestPayment;

    schedule.push({
      month: m,
      principalPayment,
      interestPayment,
      totalPayment: monthlyPayment,
      remainingBalance: Math.max(0, remaining),
      cumulativeInterest,
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
  const monthlyRate = annualRate / 100 / 12;
  const monthlyPrincipal = principal / months;
  const schedule: AmortizationRow[] = [];
  let remaining = principal;
  let cumulativeInterest = 0;

  for (let m = 1; m <= months; m++) {
    const interestPayment = remaining * monthlyRate;
    const principalPayment = m === months ? remaining : monthlyPrincipal;
    remaining -= principalPayment;
    cumulativeInterest += interestPayment;

    schedule.push({
      month: m,
      principalPayment,
      interestPayment,
      totalPayment: principalPayment + interestPayment,
      remainingBalance: Math.max(0, remaining),
      cumulativeInterest,
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
  const monthlyRate = annualRate / 100 / 12;
  const monthlyInterest = principal * monthlyRate;
  const schedule: AmortizationRow[] = [];
  let cumulativeInterest = 0;

  for (let m = 1; m <= months; m++) {
    const isLast = m === months;
    const principalPayment = isLast ? principal : 0;
    cumulativeInterest += monthlyInterest;

    schedule.push({
      month: m,
      principalPayment,
      interestPayment: monthlyInterest,
      totalPayment: principalPayment + monthlyInterest,
      remainingBalance: isLast ? 0 : principal,
      cumulativeInterest,
    });
  }

  return schedule;
}

/** 상환 방식에 따른 스케줄 계산 */
function calculateSchedule(
  principal: number,
  annualRate: number,
  months: number,
  method: RepaymentMethod
): AmortizationRow[] {
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
function toLoanResult(schedule: AmortizationRow[]): LoanResult {
  const totalInterest = schedule.reduce((sum, r) => sum + r.interestPayment, 0);
  const totalPayment = schedule.reduce((sum, r) => sum + r.totalPayment, 0);
  return { schedule, totalInterest, totalPayment };
}

/**
 * 조기상환 시뮬레이션
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
  // 기존 대출 스케줄
  const originalSchedule = calculateSchedule(loanBalance, annualRate, remainingMonths, repaymentMethod);
  const originalLoan = toLoanResult(originalSchedule);

  // 조기상환: 여유자금으로 원금 차감
  const actualPrepayment = Math.min(extraFunds, loanBalance);
  const newBalance = loanBalance - actualPrepayment;
  const prepaymentFee = actualPrepayment * (prepaymentFeeRate / 100);

  // 조기상환 후 대출 스케줄
  let prepaidLoan: LoanResult;
  if (newBalance <= 0) {
    prepaidLoan = { schedule: [], totalInterest: 0, totalPayment: 0 };
  } else {
    const prepaidSchedule = calculateSchedule(newBalance, annualRate, remainingMonths, repaymentMethod);
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
