import { RefinanceInput, RepaymentMethod, SimulatorInput, TaxType, InterestType } from "./types";

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && !Number.isNaN(value);
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) > 0;
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
    isFiniteNumber(value.loanBalance) &&
    isFiniteNumber(value.loanRate) &&
    isPositiveInteger(value.remainingMonths) &&
    isRepaymentMethod(value.repaymentMethod) &&
    isFiniteNumber(value.prepaymentFeeRate) &&
    isFiniteNumber(value.extraFunds) &&
    isFiniteNumber(value.savingsRate) &&
    isTaxType(value.taxType) &&
    isInterestType(value.interestType)
  );
}

export function isRefinanceInput(value: unknown): value is RefinanceInput {
  if (!isObjectRecord(value)) return false;

  return (
    isFiniteNumber(value.currentBalance) &&
    isFiniteNumber(value.currentRate) &&
    isPositiveInteger(value.currentMonths) &&
    isRepaymentMethod(value.currentMethod) &&
    isFiniteNumber(value.newRate) &&
    isPositiveInteger(value.newMonths) &&
    isRepaymentMethod(value.newMethod) &&
    isFiniteNumber(value.prepaymentFeeRate) &&
    isFiniteNumber(value.stampTax) &&
    isFiniteNumber(value.guaranteeFee)
  );
}
