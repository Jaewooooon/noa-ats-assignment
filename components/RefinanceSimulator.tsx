"use client";

import { useState, useMemo } from "react";
import { RefinanceInput, RefinanceResult, RepaymentMethod } from "@/lib/types";
import { simulateRefinance } from "@/lib/refinanceCalculator";
import { formatKRW } from "@/lib/formatter";
import { repaymentMethodLabels } from "@/lib/constants";
import NumberInput from "@/components/ui/NumberInput";

const defaultInput: RefinanceInput = {
  currentBalance: 10_000_000,
  currentRate: 4.5,
  currentMonths: 36,
  currentMethod: "equalPrincipalAndInterest",
  newRate: 3.5,
  newMonths: 36,
  newMethod: "equalPrincipalAndInterest",
  prepaymentFeeRate: 1.4,
  stampTax: 150_000,
  guaranteeFee: 0,
};

export default function RefinanceSimulator() {
  const [input, setInput] = useState<RefinanceInput>(defaultInput);

  const result = useMemo<RefinanceResult>(() => {
    return simulateRefinance(input);
  }, [input]);

  const update = <K extends keyof RefinanceInput>(key: K, value: RefinanceInput[K]) => {
    setInput({ ...input, [key]: value });
  };

  return (
    <div className="space-y-8">
      {/* 입력 폼 */}
      <div className="space-y-6">
        {/* 기존 대출 */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">기존 대출 정보</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NumberInput
              label="대출 잔액"
              value={input.currentBalance}
              onChange={(v) => update("currentBalance", v)}
              suffix="원"
              step={1000000}
              min={0}
            />
            <NumberInput
              label="연 금리"
              value={input.currentRate}
              onChange={(v) => update("currentRate", v)}
              suffix="%"
              step={0.1}
              min={0}
              max={30}
            />
            <NumberInput
              label="잔여 기간"
              value={input.currentMonths}
              onChange={(v) => update("currentMonths", v)}
              suffix="개월"
              step={1}
              min={1}
              max={480}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">상환 방식</label>
              <select
                value={input.currentMethod}
                onChange={(e) => update("currentMethod", e.target.value as RepaymentMethod)}
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

        {/* 새 대출 */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">새 대출 조건</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NumberInput
              label="연 금리"
              value={input.newRate}
              onChange={(v) => update("newRate", v)}
              suffix="%"
              step={0.1}
              min={0}
              max={30}
            />
            <NumberInput
              label="대출 기간"
              value={input.newMonths}
              onChange={(v) => update("newMonths", v)}
              suffix="개월"
              step={1}
              min={1}
              max={480}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">상환 방식</label>
              <select
                value={input.newMethod}
                onChange={(e) => update("newMethod", e.target.value as RepaymentMethod)}
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

        {/* 대환 비용 */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">대환 비용</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NumberInput
              label="중도상환 수수료율"
              value={input.prepaymentFeeRate}
              onChange={(v) => update("prepaymentFeeRate", v)}
              suffix="%"
              step={0.1}
              min={0}
              max={5}
            />
            <NumberInput
              label="인지세"
              value={input.stampTax}
              onChange={(v) => update("stampTax", v)}
              suffix="원"
              step={10000}
              min={0}
            />
            <NumberInput
              label="보증료 및 기타 비용"
              value={input.guaranteeFee}
              onChange={(v) => update("guaranteeFee", v)}
              suffix="원"
              step={10000}
              min={0}
            />
          </div>
        </section>
      </div>

      {/* 결과 */}
      <div className="space-y-6">
        {/* 추천 배너 */}
        <div className={`rounded-xl p-6 text-center ${
          result.netBenefit > 0
            ? "bg-blue-50 border-2 border-blue-500"
            : "bg-red-50 border-2 border-red-500"
        }`}>
          <div className="text-2xl font-bold mb-2">
            {result.netBenefit > 0 ? "✅ 대환 추천" : "❌ 대환 비추천"}
          </div>
          <div className={`text-3xl font-bold ${
            result.netBenefit > 0 ? "text-blue-700" : "text-red-700"
          }`}>
            {result.netBenefit > 0 ? "+" : ""}{formatKRW(result.netBenefit)} 절감
          </div>
          {result.netBenefit > 0 && result.breakEvenMonth > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              {result.breakEvenMonth}개월 후부터 이득
            </div>
          )}
        </div>

        {/* 상세 비교 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 기존 대출 */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h4 className="text-sm font-medium text-gray-500 mb-1">기존 대출 총 이자</h4>
            <p className="text-2xl font-bold text-gray-700">
              {formatKRW(result.currentLoan.totalInterest)}
            </p>
            <div className="mt-3 text-sm text-gray-600">
              <div>총 상환액: {formatKRW(result.currentLoan.totalPayment)}</div>
            </div>
          </div>

          {/* 새 대출 */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h4 className="text-sm font-medium text-gray-500 mb-1">새 대출 총 이자</h4>
            <p className="text-2xl font-bold text-green-600">
              {formatKRW(result.newLoan.totalInterest)}
            </p>
            <div className="mt-3 text-sm text-gray-600">
              <div>총 상환액: {formatKRW(result.newLoan.totalPayment)}</div>
            </div>
          </div>

          {/* 이자 절감 */}
          <div className="bg-blue-50 rounded-xl border-2 border-blue-500 p-5">
            <h4 className="text-sm font-medium text-gray-500 mb-1">이자 절감액</h4>
            <p className="text-2xl font-bold text-blue-700">
              {formatKRW(result.interestSaved)}
            </p>
            <div className="mt-3 text-sm text-gray-600">
              <div className="text-red-600">대환 비용: -{formatKRW(result.totalCost)}</div>
            </div>
          </div>
        </div>

        {/* 월 납부액 비교 */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h4 className="text-base font-semibold text-gray-900 mb-4">월 납부액 변화</h4>
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-500">기존 (평균)</div>
              <div className="text-xl font-bold text-gray-700">
                {formatKRW(result.currentLoan.totalPayment / input.currentMonths)}
              </div>
            </div>
            <div className="text-2xl text-gray-400">→</div>
            <div className="text-center">
              <div className="text-sm text-gray-500">새 대출 (평균)</div>
              <div className="text-xl font-bold text-green-600">
                {formatKRW(result.newLoan.totalPayment / input.newMonths)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500">차이</div>
              <div className={`text-xl font-bold ${
                result.monthlyPaymentDiff < 0 ? "text-blue-600" : "text-red-600"
              }`}>
                {result.monthlyPaymentDiff < 0 ? "" : "+"}{formatKRW(result.monthlyPaymentDiff)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
