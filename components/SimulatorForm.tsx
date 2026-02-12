"use client";

import { SimulatorInput, RepaymentMethod, TaxType, InterestType } from "@/lib/types";
import { formatNumberWithCommas } from "@/lib/formatter"; // Import the new formatter

interface SimulatorFormProps {
  input: SimulatorInput;
  onChange: (input: SimulatorInput) => void;
}

const repaymentMethodLabels: Record<RepaymentMethod, string> = {
  equalPrincipalAndInterest: "원리금균등",
  equalPrincipal: "원금균등",
  bulletRepayment: "만기일시",
};

const taxTypeLabels: Record<TaxType, string> = {
  normal: "일반과세 (15.4%)",
  taxFree: "비과세",
  taxReduced: "세금우대 (9.5%)",
};

const interestTypeLabels: Record<InterestType, string> = {
  simple: "단리",
  monthlyCompound: "월복리",
};

function sanitizeNumber(
  raw: number,
  min: number | undefined,
  max: number | undefined,
  fallback: number
): number {
  if (!Number.isFinite(raw) || Number.isNaN(raw)) return fallback;
  let v = raw;
  if (min !== undefined && v < min) v = min;
  if (max !== undefined && v > max) v = max;
  return v;
}

function NumberInput({
  label,
  value,
  onChange,
  suffix,
  step,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  step?: number;
  min?: number;
  max?: number;
}) {
  const fallback = min ?? 0;
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove commas before converting to Number
    const rawValue = e.target.value.replace(/,/g, '');
    const raw = Number(rawValue);
    const sanitized = sanitizeNumber(raw, min, max, fallback);
    onChange(sanitized);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <input
          type="text" // Changed from "number" to "text"
          value={formatNumberWithCommas(value)} // Format the displayed value
          onChange={handleChange}
          step={step} // step, min, max still useful for input validation logic, though type="text"
          min={min}
          max={max}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-12 text-right text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

export default function SimulatorForm({ input, onChange }: SimulatorFormProps) {
  const update = <K extends keyof SimulatorInput>(key: K, value: SimulatorInput[K]) => {
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
            min={0}
          />
          <NumberInput
            label="연 금리"
            value={input.loanRate}
            onChange={(v) => update("loanRate", v)}
            suffix="%"
            step={0.1}
            min={0}
            max={30}
          />
          <NumberInput
            label="잔여 기간"
            value={input.remainingMonths}
            onChange={(v) => update("remainingMonths", v)}
            suffix="개월"
            step={1}
            min={1}
            max={480}
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
            label="여유 자금"
            value={input.extraFunds}
            onChange={(v) => update("extraFunds", v)}
            suffix="원"
            step={1000000}
            min={0}
          />
          <NumberInput
            label="중도상환 수수료율"
            value={input.prepaymentFeeRate}
            onChange={(v) => update("prepaymentFeeRate", v)}
            suffix="%"
            step={0.1}
            min={0}
            max={5}
          />
        </div>
      </section>

      {/* 정기예금 비교 */}
      <section className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">정기예금 비교</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NumberInput
            label="정기예금 연 금리"
            value={input.savingsRate}
            onChange={(v) => update("savingsRate", v)}
            suffix="%"
            step={0.1}
            min={0}
            max={15}
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
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">정기예금 기간</label>
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-600">
              {input.remainingMonths}개월 (대출 잔여 기간과 동일)
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
