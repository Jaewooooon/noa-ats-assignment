import Decimal from "decimal.js";
import { RefinanceInput, RefinanceResult, RepaymentMethod } from "./types";
import { calculateSchedule, toLoanResult, AmortizationRow, LoanResult } from "./loanCalculator";

/** 금액(원)을 Decimal에서 반올림하여 number로 변환 */
function toYen(d: Decimal): number {
  return d.toDecimalPlaces(0, Decimal.ROUND_HALF_UP).toNumber();
}

/**
 * 대환대출 시뮬레이션
 */
export function simulateRefinance(input: RefinanceInput): RefinanceResult {
  const currentBalanceD = new Decimal(input.currentBalance);
  const prepaymentFeeRateD = new Decimal(input.prepaymentFeeRate);
  const stampTaxD = new Decimal(input.stampTax);
  const guaranteeFeeD = new Decimal(input.guaranteeFee);

  // 기존 대출 계산
  const currentLoanSchedule = calculateSchedule(
    input.currentBalance,
    input.currentRate,
    input.currentMonths,
    input.currentMethod
  );
  const currentLoan = toLoanResult(currentLoanSchedule);

  // 새 대출 계산
  const newLoanSchedule = calculateSchedule(
    input.currentBalance, // 대환대출은 기존 대출 잔액을 기준으로 함
    input.newRate,
    input.newMonths,
    input.newMethod
  );
  const newLoan = toLoanResult(newLoanSchedule);

  // 대환 비용 계산
  const prepaymentFee = currentBalanceD.times(prepaymentFeeRateD.div(100));
  const totalCost = prepaymentFee.plus(stampTaxD).plus(guaranteeFeeD);

  // 이자 절감액
  const interestSaved = new Decimal(currentLoan.totalInterest).minus(new Decimal(newLoan.totalInterest));

  // 월 납부액 차이 (평균)
  const currentAvgMonthly = new Decimal(currentLoan.totalPayment).div(input.currentMonths);
  const newAvgMonthly = new Decimal(newLoan.totalPayment).div(input.newMonths);
  const monthlyPaymentDiff = newAvgMonthly.minus(currentAvgMonthly);

  // 순이익
  const netBenefit = interestSaved.minus(totalCost);

  // 손익분기월 계산 (대환 비용을 월 절감액으로 회수하는데 걸리는 기간)
  let breakEvenMonth = 0;
  if (monthlyPaymentDiff.isNegative()) {
    breakEvenMonth = Math.ceil(totalCost.div(monthlyPaymentDiff.abs()).toNumber());
  }

  return {
    currentLoan,
    newLoan,
    totalCost: toYen(totalCost),
    interestSaved: toYen(interestSaved),
    monthlyPaymentDiff: toYen(monthlyPaymentDiff),
    netBenefit: toYen(netBenefit),
    breakEvenMonth,
  };
}
