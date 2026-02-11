import { describe, it, expect } from "vitest";
import { simulatePrepayment } from "./loanCalculator";

describe("simulatePrepayment", () => {
  it("조기상환 시 이자 절감액과 수수료를 올바르게 계산한다", () => {
    const result = simulatePrepayment(
      50_000_000, // loanBalance
      4.5, // annualRate
      36, // remainingMonths
      "equalPrincipalAndInterest",
      10_000_000, // extraFunds
      1.4 // prepaymentFeeRate
    );

    expect(result.originalLoan.schedule).toHaveLength(36);
    expect(result.prepaidLoan.schedule).toHaveLength(36);
    expect(result.originalLoan.totalInterest).toBeGreaterThan(result.prepaidLoan.totalInterest);
    expect(result.interestSaved).toBe(
      result.originalLoan.totalInterest - result.prepaidLoan.totalInterest
    );
    expect(result.prepaymentFee).toBe(10_000_000 * 0.014); // 140,000
    expect(result.netBenefit).toBe(result.interestSaved - result.prepaymentFee);
  });

  it("조기상환 금액이 대출 잔액보다 클 때 잔액만큼만 상환한다", () => {
    const result = simulatePrepayment(
      10_000_000, // loanBalance
      4.5,
      36,
      "equalPrincipalAndInterest",
      50_000_000, // extraFunds > loanBalance
      1.4
    );

    expect(result.prepaidLoan.schedule).toHaveLength(0);
    expect(result.prepaidLoan.totalInterest).toBe(0);
    expect(result.prepaymentFee).toBe(10_000_000 * 0.014); // 10M 기준 수수료
  });

  it("원리금균등상환 시 마지막 달 잔액이 0이 된다", () => {
    const result = simulatePrepayment(
      30_000_000,
      4.5,
      12,
      "equalPrincipalAndInterest",
      0,
      0
    );

    const lastRow = result.originalLoan.schedule[11];
    expect(lastRow.remainingBalance).toBe(0);
    expect(result.originalLoan.schedule.reduce((sum, r) => sum + r.principalPayment, 0)).toBeCloseTo(
      30_000_000,
      0
    );
  });

  it("원금균등상환 방식으로 올바르게 계산한다", () => {
    const result = simulatePrepayment(
      12_000_000,
      4.5,
      12,
      "equalPrincipal",
      0,
      0
    );

    const monthlyPrincipal = 12_000_000 / 12;
    expect(result.originalLoan.schedule[0].principalPayment).toBe(monthlyPrincipal);
    expect(result.originalLoan.schedule[11].remainingBalance).toBe(0);
  });

  it("만기일시상환 방식에서 매월 이자만 납부한다", () => {
    const result = simulatePrepayment(
      10_000_000,
      4.5,
      12,
      "bulletRepayment",
      0,
      0
    );

    const monthlyInterest = 10_000_000 * (4.5 / 100 / 12);
    result.originalLoan.schedule.forEach((row, i) => {
      expect(row.interestPayment).toBeCloseTo(monthlyInterest, 0);
      if (i < 11) {
        expect(row.principalPayment).toBe(0);
        expect(row.remainingBalance).toBe(10_000_000);
      } else {
        expect(row.principalPayment).toBe(10_000_000);
        expect(row.remainingBalance).toBe(0);
      }
    });
  });

  it("금리 0%일 때 이자가 0이다", () => {
    const result = simulatePrepayment(
      10_000_000,
      0,
      12,
      "equalPrincipalAndInterest",
      0,
      0
    );

    expect(result.originalLoan.totalInterest).toBe(0);
    result.originalLoan.schedule.forEach((row) => {
      expect(row.interestPayment).toBe(0);
    });
  });
});
