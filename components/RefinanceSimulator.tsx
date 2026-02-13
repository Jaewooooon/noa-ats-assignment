"use client";

import { useMemo } from "react";
import { RefinanceInput, RefinanceResult, RepaymentMethod } from "@/lib/types";
import { simulateRefinance } from "@/lib/refinanceCalculator";
import { formatKRW } from "@/lib/formatter";
import { repaymentMethodLabels } from "@/lib/constants";
import NumberInput from "@/components/ui/NumberInput";
import RefinanceRecommendationBanner from "@/components/RefinanceRecommendationBanner";
import RefinanceResultDashboard from "@/components/RefinanceResultDashboard";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { toUserFacingErrorMessage } from "@/lib/errorMessage";
import { isRefinanceInput } from "@/lib/inputValidators";

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
  const [input, setInput, isLoading] = useLocalStorage<RefinanceInput>(
    "loan-simulator:refinance-input",
    defaultInput,
    isRefinanceInput
  );

  const { result, errorMessage } = useMemo<{
    result: RefinanceResult | null;
    errorMessage: string | null;
  }>(() => {
    try {
      return {
        result: simulateRefinance(input),
        errorMessage: null,
      };
    } catch (error) {
      return {
        result: null,
        errorMessage: toUserFacingErrorMessage(error),
      };
    }
  }, [input]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

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
              integerOnly
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
              integerOnly
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
        {errorMessage ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : result ? (
          <>
            {/* 추천 배너 */}
            <RefinanceRecommendationBanner result={result} />

            {/* 결과 대시보드 */}
            <RefinanceResultDashboard
              result={result}
              currentMonths={input.currentMonths}
              newMonths={input.newMonths}
            />

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
                    result.monthlyPaymentDiff < 0 ? "text-blue-600" : "text-orange-600"
                  }`}>
                    {result.monthlyPaymentDiff < 0 ? "" : "+"}{formatKRW(result.monthlyPaymentDiff)}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
