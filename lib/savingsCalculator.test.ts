import { describe, it, expect } from "vitest";
import {
  calculateSavings,
  calculateMonthlySavingsAccumulation,
} from "./savingsCalculator";

describe("calculateSavings", () => {
  it("일반과세(15.4%)로 정기예금 수익을 계산한다", () => {
    const result = calculateSavings(10_000_000, 3.5, 12, "normal");

    const years = 12 / 12;
    const grossInterest = 10_000_000 * (3.5 / 100) * years;
    expect(result.grossInterest).toBeCloseTo(350_000, 0);
    expect(result.tax).toBeCloseTo(350_000 * 0.154, 0);
    expect(result.netInterest).toBe(result.grossInterest - result.tax);
    expect(result.totalAmount).toBe(10_000_000 + result.netInterest);
  });

  it("비과세일 때 세금이 0이다", () => {
    const result = calculateSavings(10_000_000, 3.5, 12, "taxFree");

    expect(result.tax).toBe(0);
    expect(result.netInterest).toBe(result.grossInterest);
  });

  it("세금우대(9.5%)로 정확히 계산한다", () => {
    const result = calculateSavings(10_000_000, 4, 24, "taxReduced");

    const years = 2;
    const grossInterest = 10_000_000 * 0.04 * years;
    expect(result.grossInterest).toBe(800_000);
    expect(result.tax).toBeCloseTo(800_000 * 0.095, 0);
  });

  it("기간이 36개월일 때 3년 기준으로 계산한다", () => {
    const result = calculateSavings(10_000_000, 4, 36, "taxFree");

    const expectedGross = 10_000_000 * 0.04 * 3;
    expect(result.grossInterest).toBe(expectedGross);
    expect(result.grossInterest).toBe(1_200_000);
  });
});

describe("calculateMonthlySavingsAccumulation", () => {
  it("요청한 개월수만큼 데이터를 반환한다", () => {
    const result = calculateMonthlySavingsAccumulation(10_000_000, 3.5, 12, "normal");

    expect(result).toHaveLength(12);
    expect(result[0].month).toBe(1);
    expect(result[11].month).toBe(12);
  });

  it("마지막 달 누적 수익이 calculateSavings의 netInterest와 일치한다", () => {
    const savings = calculateSavings(10_000_000, 3.5, 12, "normal");
    const monthly = calculateMonthlySavingsAccumulation(10_000_000, 3.5, 12, "normal");

    const lastMonth = monthly[monthly.length - 1];
    expect(lastMonth.cumulativeNetInterest).toBeCloseTo(savings.netInterest, 0);
  });

  it("월별 누적 수익이 시간에 비례하여 증가한다", () => {
    const result = calculateMonthlySavingsAccumulation(10_000_000, 4, 12, "taxFree");

    for (let i = 1; i < result.length; i++) {
      expect(result[i].cumulativeNetInterest).toBeGreaterThan(
        result[i - 1].cumulativeNetInterest
      );
    }
  });
});
