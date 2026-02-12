import { RepaymentMethod, TaxType, InterestType } from "./types";

export const repaymentMethodLabels: Record<RepaymentMethod, string> = {
  equalPrincipalAndInterest: "원리금균등",
  equalPrincipal: "원금균등",
  bulletRepayment: "만기일시",
};

export const taxTypeLabels: Record<TaxType, string> = {
  normal: "일반과세 (15.4%)",
  taxFree: "비과세",
  taxReduced: "세금우대 (9.5%)",
};

export const interestTypeLabels: Record<InterestType, string> = {
  simple: "단리",
  monthlyCompound: "월복리",
};
