"use client";

import { useState, useMemo } from "react";
import { SimulatorInput, ComparisonResult } from "@/lib/types";
import { simulatePrepayment } from "@/lib/loanCalculator";
import { calculateSavings } from "@/lib/savingsCalculator";
import SimulatorForm from "@/components/SimulatorForm";
import ResultDashboard from "@/components/ResultDashboard";
import RecommendationBanner from "@/components/RecommendationBanner";
import AmortizationTable from "@/components/AmortizationTable";

const defaultInput: SimulatorInput = {
  loanBalance: 10_000_000,
  loanRate: 4.5,
  remainingMonths: 36,
  repaymentMethod: "equalPrincipalAndInterest",
  prepaymentFeeRate: 1.4,
  extraFunds: 10_000_000,
  savingsRate: 3.5,
  taxType: "normal",
};

export default function Home() {
  const [input, setInput] = useState<SimulatorInput>(defaultInput);

  const result = useMemo<ComparisonResult>(() => {
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
      input.taxType
    );

    const difference = prepayment.netBenefit - savings.netInterest;

    return {
      prepayment,
      savings,
      difference,
      recommendation: difference >= 0 ? "prepayment" : "savings",
    };
  }, [input]);

  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-gray-900">
            대출 중도상환 vs 정기예금 시뮬레이터
          </h1>
          <p className="mt-2 text-gray-600">
            여유 자금을 대출 중도상환에 쓸지, 정기예금에 넣을지 비교해 보세요.
          </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 mt-8 space-y-8">
        {/* 입력 폼 */}
        <SimulatorForm input={input} onChange={setInput} />

        {/* 추천 배너 */}
        <RecommendationBanner result={result} />

        {/* 결과 대시보드 */}
        <ResultDashboard result={result} />

        {/* 상환 스케줄 */}
        <AmortizationTable prepayment={result.prepayment} />
      </div>
    </main>
  );
}
