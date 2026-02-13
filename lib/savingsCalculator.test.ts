import { describe, it, expect } from "vitest";
import {
  calculateSavings,
  calculateMonthlySavingsAccumulation,
} from "./savingsCalculator";

describe("calculateSavings", () => {
  describe("단리(simple)", () => {
    it("일반과세(15.4%)로 정기예금 수익을 계산한다", () => {
      const result = calculateSavings(10_000_000, 3.5, 12, "normal", "simple");

      const grossInterest = 10_000_000 * (3.5 / 100) * 1; // 350,000
      expect(result.grossInterest).toBeCloseTo(grossInterest, 0);
      expect(result.tax).toBeCloseTo(grossInterest * 0.154, 0);
      expect(result.netInterest).toBe(result.grossInterest - result.tax);
      expect(result.totalAmount).toBe(10_000_000 + result.netInterest);
    });

    it("비과세일 때 세금이 0이다", () => {
      const result = calculateSavings(10_000_000, 3.5, 12, "taxFree", "simple");

      expect(result.tax).toBe(0);
      expect(result.netInterest).toBe(result.grossInterest);
    });

    it("세금우대(9.5%)로 정확히 계산한다", () => {
      const result = calculateSavings(10_000_000, 4, 24, "taxReduced", "simple");

      const grossInterest = 10_000_000 * 0.04 * 2; // 800,000
      expect(result.grossInterest).toBe(grossInterest);
      expect(result.tax).toBeCloseTo(grossInterest * 0.095, 0);
    });

    it("기간이 36개월일 때 3년 기준으로 계산한다", () => {
      const result = calculateSavings(10_000_000, 4, 36, "taxFree", "simple");

      const expectedGross = 10_000_000 * 0.04 * 3; // 1,200,000
      expect(result.grossInterest).toBe(expectedGross);
    });
  });

  describe("월복리(monthlyCompound)", () => {
    it("만기금액 = 원금 × (1 + 연이율/12)^개월수 공식으로 계산한다", () => {
      const result = calculateSavings(10_000_000, 4, 12, "taxFree", "monthlyCompound");

      const monthlyRate = 0.04 / 12;
      const maturityAmount = 10_000_000 * Math.pow(1 + monthlyRate, 12);
      const expectedGross = maturityAmount - 10_000_000;
      expect(result.grossInterest).toBeCloseTo(expectedGross, 0);
      expect(result.totalAmount).toBeCloseTo(maturityAmount, 0);
    });

    it("월복리 이자가 단리 이자보다 크다", () => {
      const simple = calculateSavings(10_000_000, 3.5, 12, "taxFree", "simple");
      const compound = calculateSavings(10_000_000, 3.5, 12, "taxFree", "monthlyCompound");

      expect(compound.grossInterest).toBeGreaterThan(simple.grossInterest);
    });

    it("기간이 길수록 단리 대비 월복리 이자 차이가 커진다", () => {
      const simple12 = calculateSavings(10_000_000, 4, 12, "taxFree", "simple");
      const compound12 = calculateSavings(10_000_000, 4, 12, "taxFree", "monthlyCompound");
      const simple36 = calculateSavings(10_000_000, 4, 36, "taxFree", "simple");
      const compound36 = calculateSavings(10_000_000, 4, 36, "taxFree", "monthlyCompound");

      const diff12 = compound12.grossInterest - simple12.grossInterest;
      const diff36 = compound36.grossInterest - simple36.grossInterest;
      expect(diff36).toBeGreaterThan(diff12);
    });

    it("기본값이 월복리이다", () => {
      const explicit = calculateSavings(10_000_000, 3.5, 12, "taxFree", "monthlyCompound");
      const defaults = calculateSavings(10_000_000, 3.5, 12, "taxFree");

      expect(defaults.grossInterest).toBeCloseTo(explicit.grossInterest, 0);
    });

    it("음수 입력이면 에러를 던진다", () => {
      expect(() => calculateSavings(-1, 3.5, 12, "normal", "monthlyCompound")).toThrow(RangeError);
    });
  });
});

describe("calculateMonthlySavingsAccumulation", () => {
  it("요청한 개월수만큼 데이터를 반환한다", () => {
    const result = calculateMonthlySavingsAccumulation(10_000_000, 3.5, 12, "normal");

    expect(result).toHaveLength(12);
    expect(result[0].month).toBe(1);
    expect(result[11].month).toBe(12);
  });

  it("마지막 달 누적 수익이 calculateSavings의 netInterest와 일치한다 (월복리)", () => {
    const savings = calculateSavings(10_000_000, 3.5, 12, "normal");
    const monthly = calculateMonthlySavingsAccumulation(10_000_000, 3.5, 12, "normal");

    const lastMonth = monthly[monthly.length - 1];
    expect(lastMonth.cumulativeNetInterest).toBeCloseTo(savings.netInterest, 0);
  });

  it("마지막 달 누적 수익이 calculateSavings의 netInterest와 일치한다 (단리)", () => {
    const savings = calculateSavings(10_000_000, 3.5, 12, "normal", "simple");
    const monthly = calculateMonthlySavingsAccumulation(10_000_000, 3.5, 12, "normal", "simple");

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

  it("월복리일 때 월별 누적 수익이 증가한다", () => {
    const compound = calculateMonthlySavingsAccumulation(10_000_000, 4, 12, "taxFree", "monthlyCompound");
    const simple = calculateMonthlySavingsAccumulation(10_000_000, 4, 12, "taxFree", "simple");

    // 마지막 달 기준 월복리 누적 > 단리 누적
    expect(compound[11].cumulativeNetInterest).toBeGreaterThan(simple[11].cumulativeNetInterest);
  });
});
