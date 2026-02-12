import { RefinanceInput, RefinanceResult, LoanResult, RepaymentMethod } from "./types";

/**
 * 원리금균등상환 스케줄 계산 (단순화 버전)
 */
function calculateLoan(
  principal: number,
  annualRate: number,
  months: number,
  method: RepaymentMethod
): LoanResult {
  const monthlyRate = annualRate / 100 / 12;
  let totalInterest = 0;
  let totalPayment = 0;
  const schedule = [];

  if (method === "equalPrincipalAndInterest") {
    // 원리금균등상환
    if (monthlyRate === 0) {
      const monthlyPayment = principal / months;
      totalPayment = principal;
      totalInterest = 0;
    } else {
      const monthlyPayment =
        principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1);

      let remaining = principal;
      for (let m = 1; m <= months; m++) {
        const interestPayment = remaining * monthlyRate;
        const principalPayment = monthlyPayment - interestPayment;
        remaining -= principalPayment;
        totalInterest += interestPayment;
        totalPayment += monthlyPayment;

        schedule.push({
          month: m,
          principalPayment,
          interestPayment,
          totalPayment: monthlyPayment,
          remainingBalance: Math.max(0, remaining),
          cumulativeInterest: totalInterest,
        });
      }
    }
  } else if (method === "equalPrincipal") {
    // 원금균등상환
    const monthlyPrincipal = principal / months;
    let remaining = principal;

    for (let m = 1; m <= months; m++) {
      const interestPayment = remaining * monthlyRate;
      const principalPayment = m === months ? remaining : monthlyPrincipal;
      remaining -= principalPayment;
      totalInterest += interestPayment;
      const payment = principalPayment + interestPayment;
      totalPayment += payment;

      schedule.push({
        month: m,
        principalPayment,
        interestPayment,
        totalPayment: payment,
        remainingBalance: Math.max(0, remaining),
        cumulativeInterest: totalInterest,
      });
    }
  } else {
    // 만기일시상환
    const monthlyInterest = principal * monthlyRate;

    for (let m = 1; m <= months; m++) {
      const isLast = m === months;
      const principalPayment = isLast ? principal : 0;
      totalInterest += monthlyInterest;
      const payment = principalPayment + monthlyInterest;
      totalPayment += payment;

      schedule.push({
        month: m,
        principalPayment,
        interestPayment: monthlyInterest,
        totalPayment: payment,
        remainingBalance: isLast ? 0 : principal,
        cumulativeInterest: totalInterest,
      });
    }
  }

  return {
    schedule,
    totalInterest,
    totalPayment,
  };
}

/**
 * 대환대출 시뮬레이션
 */
export function simulateRefinance(input: RefinanceInput): RefinanceResult {
  // 기존 대출 계산
  const currentLoan = calculateLoan(
    input.currentBalance,
    input.currentRate,
    input.currentMonths,
    input.currentMethod
  );

  // 새 대출 계산
  const newLoan = calculateLoan(
    input.currentBalance,
    input.newRate,
    input.newMonths,
    input.newMethod
  );

  // 대환 비용 계산
  const prepaymentFee = input.currentBalance * (input.prepaymentFeeRate / 100);
  const totalCost = prepaymentFee + input.stampTax + input.guaranteeFee;

  // 이자 절감액
  const interestSaved = currentLoan.totalInterest - newLoan.totalInterest;

  // 월 납부액 차이 (평균)
  const currentAvgMonthly = currentLoan.totalPayment / input.currentMonths;
  const newAvgMonthly = newLoan.totalPayment / input.newMonths;
  const monthlyPaymentDiff = newAvgMonthly - currentAvgMonthly;

  // 순이익
  const netBenefit = interestSaved - totalCost;

  // 손익분기월 계산 (대환 비용을 월 절감액으로 회수하는데 걸리는 기간)
  let breakEvenMonth = 0;
  if (monthlyPaymentDiff < 0) {
    breakEvenMonth = Math.ceil(totalCost / Math.abs(monthlyPaymentDiff));
  }

  return {
    currentLoan,
    newLoan,
    totalCost,
    interestSaved,
    monthlyPaymentDiff,
    netBenefit,
    breakEvenMonth,
  };
}
