import { COMPARISON_SIMILARITY_THRESHOLD } from "./constants";
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
  const absNetBenefit = Math.abs(netBenefit);
  if (absNetBenefit <= COMPARISON_SIMILARITY_THRESHOLD) return "similar";
  return netBenefit > 0 ? "refinance" : "keep";
}
