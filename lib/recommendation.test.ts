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
  it("기존 유지가 1원이라도 유리하면 keep을 반환한다", () => {
    expect(getRefinanceRecommendation(-1)).toBe("keep");
    expect(getRefinanceRecommendation(-9_999)).toBe("keep");
    expect(getRefinanceRecommendation(-10_001)).toBe("keep");
  });

  it("순이익이 0원이면 keep을 반환한다", () => {
    expect(getRefinanceRecommendation(0)).toBe("keep");
  });

  it("대환 순이익이 10,000원 이하이면 similar를 반환한다", () => {
    expect(getRefinanceRecommendation(1)).toBe("similar");
    expect(getRefinanceRecommendation(9_999)).toBe("similar");
    expect(getRefinanceRecommendation(10_000)).toBe("similar");
  });

  it("대환 순이익이 10,001원이면 refinance를 반환한다", () => {
    expect(getRefinanceRecommendation(10_001)).toBe("refinance");
  });
});
