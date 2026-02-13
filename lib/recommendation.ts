import {
  COMPARISON_SIMILARITY_THRESHOLD,
  REFINANCE_RECOMMEND_THRESHOLD,
} from "./constants";
import { ComparisonResult } from "./types";

export type RefinanceRecommendation = "refinance" | "keep" | "similar";

export function getComparisonRecommendation(
  difference: number
): ComparisonResult["recommendation"] {
  const absDifference = Math.abs(difference);
  if (absDifference <= COMPARISON_SIMILARITY_THRESHOLD) return "similar";
  return difference > 0 ? "prepayment" : "savings";
}

export function getRefinanceRecommendation(
  netBenefit: number
): RefinanceRecommendation {
  // 대환은 보수적으로 추천: 기존 유지가 1원이라도 유리하면 유지 권장.
  if (netBenefit <= 0) return "keep";
  if (netBenefit <= REFINANCE_RECOMMEND_THRESHOLD) return "similar";
  return "refinance";
}
