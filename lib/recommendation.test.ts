import { describe, expect, it } from "vitest";
import {
  getComparisonRecommendation,
  getRefinanceRecommendation,
} from "./recommendation";

describe("getComparisonRecommendation", () => {
  it("차이가 10,000원보다 작으면 similar를 반환한다", () => {
    expect(getComparisonRecommendation(9_999)).toBe("similar");
    expect(getComparisonRecommendation(-9_999)).toBe("similar");
  });

  it("차이가 정확히 10,000원이면 similar를 반환한다", () => {
    expect(getComparisonRecommendation(10_000)).toBe("similar");
    expect(getComparisonRecommendation(-10_000)).toBe("similar");
  });

  it("차이가 10,001원이면 방향에 맞는 추천을 반환한다", () => {
    expect(getComparisonRecommendation(10_001)).toBe("prepayment");
    expect(getComparisonRecommendation(-10_001)).toBe("savings");
  });
});

describe("getRefinanceRecommendation", () => {
  it("순이익 차이가 10,000원보다 작으면 similar를 반환한다", () => {
    expect(getRefinanceRecommendation(9_999)).toBe("similar");
    expect(getRefinanceRecommendation(-9_999)).toBe("similar");
  });

  it("순이익 차이가 정확히 10,000원이면 similar를 반환한다", () => {
    expect(getRefinanceRecommendation(10_000)).toBe("similar");
    expect(getRefinanceRecommendation(-10_000)).toBe("similar");
  });

  it("순이익 차이가 10,001원이면 방향에 맞는 추천을 반환한다", () => {
    expect(getRefinanceRecommendation(10_001)).toBe("refinance");
    expect(getRefinanceRecommendation(-10_001)).toBe("keep");
  });
});
