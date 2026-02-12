"use client";

import { RefinanceResult } from "@/lib/types";
import { formatKRW } from "@/lib/formatter";

interface RefinanceResultDashboardProps {
  result: RefinanceResult;
  currentMonths: number;
  newMonths: number;
}

export default function RefinanceResultDashboard({
  result,
  currentMonths,
  newMonths
}: RefinanceResultDashboardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 카드 A: 기존 대출 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h4 className="text-sm font-medium text-gray-500 mb-1">기존 대출 총 이자</h4>
        <p className="text-2xl font-bold text-gray-700">
          {formatKRW(result.currentLoan.totalInterest)}
        </p>
        <div className="mt-3 space-y-1 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>총 상환액</span>
            <span className="font-medium">{formatKRW(result.currentLoan.totalPayment)}</span>
          </div>
          <div className="flex justify-between">
            <span>월 평균</span>
            <span className="font-medium">
              {formatKRW(result.currentLoan.totalPayment / currentMonths)}
            </span>
          </div>
        </div>
      </div>

      {/* 카드 B: 새 대출 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h4 className="text-sm font-medium text-gray-500 mb-1">새 대출 총 이자</h4>
        <p className="text-2xl font-bold text-green-600">
          {formatKRW(result.newLoan.totalInterest)}
        </p>
        <div className="mt-3 space-y-1 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>총 상환액</span>
            <span className="font-medium">{formatKRW(result.newLoan.totalPayment)}</span>
          </div>
          <div className="flex justify-between">
            <span>월 평균</span>
            <span className="font-medium">
              {formatKRW(result.newLoan.totalPayment / newMonths)}
            </span>
          </div>
        </div>
      </div>

      {/* 카드 C: 순이익 */}
      <div className={`rounded-xl border-2 p-5 ${
        result.netBenefit > 0
          ? "border-blue-500 bg-blue-50"
          : "border-orange-400 bg-orange-50"
      }`}>
        <h4 className="text-sm font-medium text-gray-500 mb-1">순이익</h4>
        <p className={`text-2xl font-bold ${
          result.netBenefit > 0 ? "text-blue-700" : "text-orange-700"
        }`}>
          {result.netBenefit > 0 ? "+" : ""}{formatKRW(result.netBenefit)}
        </p>
        <div className="mt-3 space-y-1 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>이자 절감</span>
            <span className="font-medium text-green-600">+{formatKRW(result.interestSaved)}</span>
          </div>
          <div className="flex justify-between">
            <span>대환 비용</span>
            <span className="font-medium text-orange-600">-{formatKRW(result.totalCost)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
