import { describe, it, expect } from "vitest";
import { simulateRefinance } from "./refinanceCalculator";
import { RefinanceInput } from "./types";

describe("simulateRefinance", () => {
  const baseInput: RefinanceInput = {
    currentBalance: 10_000_000,
    currentRate: 4.5,
    currentMonths: 36,
    currentMethod: "equalPrincipalAndInterest",
    newRate: 3.5,
    newMonths: 36,
    newMethod: "equalPrincipalAndInterest",
    prepaymentFeeRate: 1.4,
    stampTax: 150_000,
    guaranteeFee: 0,
  };

  it("금리를 낮춰 대환할 때 이자 절감이 발생한다", () => {
    const result = simulateRefinance(baseInput);

    // 기존 대출보다 새 대출의 이자가 적어야 함
    expect(result.newLoan.totalInterest).toBeLessThan(result.currentLoan.totalInterest);

    // 이자 절감액이 양수여야 함
    expect(result.interestSaved).toBeGreaterThan(0);

    // 이자 절감액 = 기존 이자 - 새 이자
    expect(result.interestSaved).toBe(
      result.currentLoan.totalInterest - result.newLoan.totalInterest
    );
  });

  it("대환 비용을 올바르게 계산한다", () => {
    const result = simulateRefinance(baseInput);

    const expectedFee = 10_000_000 * 0.014; // 140,000
    const expectedTotal = expectedFee + 150_000; // 290,000

    expect(result.totalCost).toBe(expectedTotal);
  });

  it("순이익을 올바르게 계산한다", () => {
    const result = simulateRefinance(baseInput);

    // 순이익 = 이자절감 - 대환비용
    expect(result.netBenefit).toBe(result.interestSaved - result.totalCost);
  });

  it("월 납부액 차이를 올바르게 계산한다", () => {
    const result = simulateRefinance(baseInput);

    const currentAvg = result.currentLoan.totalPayment / baseInput.currentMonths;
    const newAvg = result.newLoan.totalPayment / baseInput.newMonths;

    expect(result.monthlyPaymentDiff).toBe(Math.round(newAvg - currentAvg));
  });

  it("손익분기월을 올바르게 계산한다", () => {
    const result = simulateRefinance(baseInput);

    if (result.monthlyPaymentDiff < 0) {
      const expectedBreakEven = Math.ceil(
        result.totalCost / Math.abs(result.monthlyPaymentDiff)
      );
      expect(result.breakEvenMonth).toBe(expectedBreakEven);
    } else {
      expect(result.breakEvenMonth).toBe(0);
    }
  });

  it("금리가 높아지면 대환이 손해다", () => {
    const higherRateInput: RefinanceInput = {
      ...baseInput,
      newRate: 5.5, // 기존 4.5%보다 높음
    };

    const result = simulateRefinance(higherRateInput);

    // 새 대출 이자가 더 많아야 함
    expect(result.newLoan.totalInterest).toBeGreaterThan(result.currentLoan.totalInterest);

    // 이자 절감액이 음수
    expect(result.interestSaved).toBeLessThan(0);

    // 순이익이 음수 (손실)
    expect(result.netBenefit).toBeLessThan(0);
  });

  it("상환방식 변경 시나리오: 원리금균등 → 원금균등", () => {
    const methodChangeInput: RefinanceInput = {
      ...baseInput,
      newRate: 4.5, // 금리는 동일
      newMethod: "equalPrincipal",
    };

    const result = simulateRefinance(methodChangeInput);

    // 원금균등은 초기 납부액이 더 크고, 후기로 갈수록 작아짐
    const currentFirstPayment = result.currentLoan.schedule[0].totalPayment;
    const newFirstPayment = result.newLoan.schedule[0].totalPayment;

    expect(newFirstPayment).toBeGreaterThan(currentFirstPayment);
  });

  it("기간 연장 시나리오", () => {
    const longerTermInput: RefinanceInput = {
      ...baseInput,
      newMonths: 60, // 36개월 → 60개월로 연장
    };

    const result = simulateRefinance(longerTermInput);

    // 총 이자는 증가
    expect(result.newLoan.totalInterest).toBeGreaterThan(result.currentLoan.totalInterest);

    // 이자 절감액이 음수
    expect(result.interestSaved).toBeLessThan(0);

    // 하지만 월 납부액은 감소
    expect(result.monthlyPaymentDiff).toBeLessThan(0);
  });

  it("기간 단축 시나리오", () => {
    const shorterTermInput: RefinanceInput = {
      ...baseInput,
      newMonths: 24, // 36개월 → 24개월로 단축
    };

    const result = simulateRefinance(shorterTermInput);

    // 총 이자는 감소
    expect(result.newLoan.totalInterest).toBeLessThan(result.currentLoan.totalInterest);

    // 이자 절감액이 양수
    expect(result.interestSaved).toBeGreaterThan(0);

    // 월 납부액은 증가
    expect(result.monthlyPaymentDiff).toBeGreaterThan(0);
  });

  it("대환 비용이 매우 높을 때 순이익이 음수가 된다", () => {
    const highCostInput: RefinanceInput = {
      ...baseInput,
      prepaymentFeeRate: 3.0, // 높은 수수료
      stampTax: 500_000,
      guaranteeFee: 300_000,
    };

    const result = simulateRefinance(highCostInput);

    // 대환 비용이 이자 절감액보다 클 수 있음
    if (result.totalCost > result.interestSaved) {
      expect(result.netBenefit).toBeLessThan(0);
    }
  });

  it("보증료 포함 시 총 대환 비용이 정확히 계산된다", () => {
    const withGuaranteeInput: RefinanceInput = {
      ...baseInput,
      guaranteeFee: 200_000,
    };

    const result = simulateRefinance(withGuaranteeInput);

    const expectedFee = 10_000_000 * 0.014; // 140,000
    const expectedTotal = expectedFee + 150_000 + 200_000; // 490,000

    expect(result.totalCost).toBe(expectedTotal);
  });

  it("금리 0%일 때 이자가 0이다", () => {
    const zeroRateInput: RefinanceInput = {
      ...baseInput,
      currentRate: 0,
      newRate: 0,
    };

    const result = simulateRefinance(zeroRateInput);

    expect(result.currentLoan.totalInterest).toBe(0);
    expect(result.newLoan.totalInterest).toBe(0);
    expect(result.interestSaved).toBe(0);
  });

  it("만기일시상환 방식에서 매월 이자만 납부한다", () => {
    const bulletInput: RefinanceInput = {
      ...baseInput,
      currentMethod: "bulletRepayment",
      newMethod: "bulletRepayment",
    };

    const result = simulateRefinance(bulletInput);

    const monthlyInterestCurrent = 10_000_000 * (4.5 / 100 / 12);
    const monthlyInterestNew = 10_000_000 * (3.5 / 100 / 12);

    // 마지막 달 제외하고 원금 상환이 없어야 함
    result.currentLoan.schedule.slice(0, -1).forEach((row) => {
      expect(row.principalPayment).toBe(0);
      expect(row.interestPayment).toBeCloseTo(monthlyInterestCurrent, 0);
    });

    result.newLoan.schedule.slice(0, -1).forEach((row) => {
      expect(row.principalPayment).toBe(0);
      expect(row.interestPayment).toBeCloseTo(monthlyInterestNew, 0);
    });
  });

  it("스케줄 길이가 입력한 기간과 일치한다", () => {
    const result = simulateRefinance(baseInput);

    expect(result.currentLoan.schedule).toHaveLength(baseInput.currentMonths);
    expect(result.newLoan.schedule).toHaveLength(baseInput.newMonths);
  });
});
