"use client";

import { SimulatorInput, RepaymentMethod, TaxType, InterestType } from "@/lib/types";
import { repaymentMethodLabels, taxTypeLabels, interestTypeLabels } from "@/lib/constants";
import NumberInput from "@/components/ui/NumberInput";
import { formatKRW } from "@/lib/formatter";
import { VALIDATION_RULES } from "@/lib/validationRules";

interface SimulatorFormProps {
  input: SimulatorInput;
  onChange: (input: SimulatorInput) => void;
}

export default function SimulatorForm({ input, onChange }: SimulatorFormProps) {
  const update = <K extends keyof SimulatorInput>(key: K, value: SimulatorInput[K]) => {
    if (key === "loanBalance") {
      const nextLoanBalance = value as number;
      onChange({
        ...input,
        loanBalance: nextLoanBalance,
        // 여유 자금은 대출 잔액 한도를 넘지 않도록 동기화
        extraFunds: Math.min(input.extraFunds, nextLoanBalance),
      });
      return;
    }

    if (key === "extraFunds") {
      const nextExtraFunds = Math.min(value as number, input.loanBalance);
      onChange({ ...input, extraFunds: nextExtraFunds });
      return;
    }

    onChange({ ...input, [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* 대출 정보 */}
      <section className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">대출 정보</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NumberInput
            label="대출 잔액"
            value={input.loanBalance}
            onChange={(v) => update("loanBalance", v)}
            suffix="원"
            step={1000000}
            min={VALIDATION_RULES.loanBalance.min}
          />
          <NumberInput
            label="연 금리"
            value={input.loanRate}
            onChange={(v) => update("loanRate", v)}
            suffix="%"
            step={0.1}
            min={VALIDATION_RULES.rate.min}
            max={VALIDATION_RULES.rate.max}
          />
          <NumberInput
            label="잔여 기간"
            value={input.remainingMonths}
            onChange={(v) => update("remainingMonths", v)}
            suffix="개월"
            step={1}
            min={VALIDATION_RULES.months.min}
            max={VALIDATION_RULES.months.max}
            integerOnly
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">상환 방식</label>
            <select
              value={input.repaymentMethod}
              onChange={(e) => update("repaymentMethod", e.target.value as RepaymentMethod)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            >
              {(Object.entries(repaymentMethodLabels) as [RepaymentMethod, string][]).map(
                ([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                )
              )}
            </select>
          </div>
        </div>
      </section>

      {/* 중도상환 & 여유 자금 */}
      <section className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">중도상환</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NumberInput
            label="자금"
            value={input.extraFunds}
            onChange={(v) => update("extraFunds", v)}
            suffix="원"
            step={1000000}
            min={VALIDATION_RULES.loanBalance.min}
            max={input.loanBalance}
          />
          <NumberInput
            label="중도상환 수수료율"
            value={input.prepaymentFeeRate}
            onChange={(v) => update("prepaymentFeeRate", v)}
            suffix="%"
            step={0.1}
            min={VALIDATION_RULES.prepaymentFeeRate.min}
            max={VALIDATION_RULES.prepaymentFeeRate.max}
          />
        </div>
      </section>

      {/* 정기예금 비교 */}
      <section className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">정기예금 비교</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">정기예금 자금</label>
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-600">
              {formatKRW(input.extraFunds)} (중도상환 자금과 동일)
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">정기예금 기간</label>
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-600">
              {input.remainingMonths}개월 (대출 잔여 기간과 동일)
            </div>
          </div>
          <NumberInput
            label="정기예금 연 금리"
            value={input.savingsRate}
            onChange={(v) => update("savingsRate", v)}
            suffix="%"
            step={0.1}
            min={VALIDATION_RULES.savingsRate.min}
            max={VALIDATION_RULES.savingsRate.max}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이자 계산 방식</label>
            <select
              value={input.interestType}
              onChange={(e) => update("interestType", e.target.value as InterestType)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            >
              {(Object.entries(interestTypeLabels) as [InterestType, string][]).map(
                ([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                )
              )}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이자 과세</label>
            <select
              value={input.taxType}
              onChange={(e) => update("taxType", e.target.value as TaxType)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            >
              {(Object.entries(taxTypeLabels) as [TaxType, string][]).map(
                ([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                )
              )}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              기본 계산은 선택한 과세유형 기준이며,
              <br />
              2000만원 초과 이자소득의 실제 과세는 다를 수 있습니다.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
