"use client";

import { useMemo } from "react";
import { SimulatorInput, ComparisonResult } from "@/lib/types";
import { simulatePrepayment } from "@/lib/loanCalculator";
import { calculateSavings } from "@/lib/savingsCalculator";
import SimulatorForm from "@/components/SimulatorForm";
import ResultDashboard from "@/components/ResultDashboard";
import RecommendationBanner from "@/components/RecommendationBanner";
import AmortizationTable from "@/components/AmortizationTable";
import RefinanceSimulator from "@/components/RefinanceSimulator";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { getComparisonRecommendation } from "@/lib/recommendation";
import { toUserFacingErrorMessage } from "@/lib/errorMessage";
import { isSimulatorInput, isTabType } from "@/lib/inputValidators";

type TabType = "prepayment" | "refinance";

const defaultInput: SimulatorInput = {
  loanBalance: 10_000_000,
  loanRate: 4.5,
  remainingMonths: 36,
  repaymentMethod: "equalPrincipalAndInterest",
  prepaymentFeeRate: 1.4,
  extraFunds: 10_000_000,
  savingsRate: 3.5,
  taxType: "normal",
  interestType: "monthlyCompound",
};

export default function Home() {
  const [activeTab, setActiveTab, isLoadingTab] = useLocalStorage<TabType>(
    "loan-simulator:active-tab",
    "prepayment",
    isTabType
  );
  const [input, setInput, isLoadingInput] = useLocalStorage<SimulatorInput>(
    "loan-simulator:prepayment-input",
    defaultInput,
    isSimulatorInput
  );

  const isLoading = isLoadingTab || isLoadingInput;

  const { result, errorMessage } = useMemo<{
    result: ComparisonResult | null;
    errorMessage: string | null;
  }>(() => {
    try {
      const prepayment = simulatePrepayment(
        input.loanBalance,
        input.loanRate,
        input.remainingMonths,
        input.repaymentMethod,
        input.extraFunds,
        input.prepaymentFeeRate
      );

      const savings = calculateSavings(
        input.extraFunds,
        input.savingsRate,
        input.remainingMonths,
        input.taxType,
        input.interestType
      );

      const difference = prepayment.netBenefit - savings.netInterest;
      const recommendation = getComparisonRecommendation(difference);

      return {
        result: {
          prepayment,
          savings,
          difference,
          recommendation,
        },
        errorMessage: null,
      };
    } catch (error) {
      return {
        result: null,
        errorMessage: toUserFacingErrorMessage(error),
      };
    }
  }, [input]);

  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">대출 관리 시뮬레이터</h1>
          <p className="mt-2 text-gray-600">
            최적의 대출 관리 전략을 찾아보세요.
          </p>

          {/* 탭 네비게이션 */}
          <div className="mt-6 flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("prepayment")}
              className={`px-4 py-2 font-medium text-sm transition-colors relative ${
                activeTab === "prepayment"
                  ? "text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              중도상환 vs 정기예금
              {activeTab === "prepayment" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("refinance")}
              className={`px-4 py-2 font-medium text-sm transition-colors relative ${
                activeTab === "refinance"
                  ? "text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              대환대출
              {activeTab === "refinance" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 mt-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">데이터를 불러오는 중...</p>
            </div>
          </div>
        ) : activeTab === "prepayment" ? (
          <div className="space-y-8">
            {/* 입력 폼 */}
            <SimulatorForm input={input} onChange={setInput} />

            {errorMessage ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {errorMessage}
              </div>
            ) : result ? (
              <>
                {/* 추천 배너 */}
                <RecommendationBanner result={result} />

                {/* 결과 대시보드 */}
                <ResultDashboard result={result} />

                {/* 상환 스케줄 */}
                <AmortizationTable prepayment={result.prepayment} />
              </>
            ) : null}
          </div>
        ) : (
          <RefinanceSimulator />
        )}
      </div>
    </main>
  );
}
