import { RefinanceInput, RepaymentMethod, SimulatorInput, TaxType, InterestType } from "./types";
import {
  isInRange,
  isPositiveIntegerInRange,
  VALIDATION_RULES,
} from "./validationRules";

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNumberInRange(value: unknown, range: { min: number; max?: number }): value is number {
  return typeof value === "number" && isInRange(value, range);
}

function isRepaymentMethod(value: unknown): value is RepaymentMethod {
  return (
    value === "equalPrincipalAndInterest" ||
    value === "equalPrincipal" ||
    value === "bulletRepayment"
  );
}

function isTaxType(value: unknown): value is TaxType {
  return value === "normal" || value === "taxFree" || value === "taxReduced";
}

function isInterestType(value: unknown): value is InterestType {
  return value === "simple" || value === "monthlyCompound";
}

export function isTabType(value: unknown): value is "prepayment" | "refinance" {
  return value === "prepayment" || value === "refinance";
}

export function isSimulatorInput(value: unknown): value is SimulatorInput {
  if (!isObjectRecord(value)) return false;

  return (
    isNumberInRange(value.loanBalance, VALIDATION_RULES.loanBalance) &&
    isNumberInRange(value.loanRate, VALIDATION_RULES.rate) &&
    isPositiveIntegerInRange(value.remainingMonths, VALIDATION_RULES.months) &&
    isRepaymentMethod(value.repaymentMethod) &&
    isNumberInRange(value.prepaymentFeeRate, VALIDATION_RULES.prepaymentFeeRate) &&
    isNumberInRange(value.extraFunds, VALIDATION_RULES.loanBalance) &&
    isNumberInRange(value.savingsRate, VALIDATION_RULES.savingsRate) &&
    isTaxType(value.taxType) &&
    isInterestType(value.interestType)
  );
}

export function isRefinanceInput(value: unknown): value is RefinanceInput {
  if (!isObjectRecord(value)) return false;

  return (
    isNumberInRange(value.currentBalance, VALIDATION_RULES.loanBalance) &&
    isNumberInRange(value.currentRate, VALIDATION_RULES.rate) &&
    isPositiveIntegerInRange(value.currentMonths, VALIDATION_RULES.months) &&
    isRepaymentMethod(value.currentMethod) &&
    isNumberInRange(value.newRate, VALIDATION_RULES.rate) &&
    isPositiveIntegerInRange(value.newMonths, VALIDATION_RULES.months) &&
    isRepaymentMethod(value.newMethod) &&
    isNumberInRange(value.prepaymentFeeRate, VALIDATION_RULES.prepaymentFeeRate) &&
    isNumberInRange(value.stampTax, VALIDATION_RULES.cost) &&
    isNumberInRange(value.guaranteeFee, VALIDATION_RULES.cost)
  );
}
