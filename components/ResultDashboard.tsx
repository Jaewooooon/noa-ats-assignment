"use client";

import { ComparisonResult } from "@/lib/types";
import { formatKRW } from "@/lib/formatter";

interface ResultDashboardProps {
  result: ComparisonResult;
}

export default function ResultDashboard({ result }: ResultDashboardProps) {
  const { prepayment, savings, difference, recommendation } = result;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 카드 A: 중도상환 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h4 className="text-sm font-medium text-gray-500 mb-1">중도상환 순이익</h4>
        <p className={`text-2xl font-bold ${prepayment.netBenefit >= 0 ? "text-blue-600" : "text-red-600"}`}>
          {formatKRW(prepayment.netBenefit)}
        </p>
        <div className="mt-3 space-y-1 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>이자 절감액</span>
            <span className="font-medium">{formatKRW(prepayment.interestSaved)}</span>
          </div>
          <div className="flex justify-between">
            <span>중도상환 수수료</span>
            <span className="font-medium text-red-500">-{formatKRW(prepayment.prepaymentFee)}</span>
          </div>
        </div>
      </div>

      {/* 카드 B: 정기예금 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h4 className="text-sm font-medium text-gray-500 mb-1">정기예금 순이익</h4>
        <p className="text-2xl font-bold text-green-600">
          {formatKRW(savings.netInterest)}
        </p>
        <div className="mt-3 space-y-1 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>세전 이자</span>
            <span className="font-medium">{formatKRW(savings.grossInterest)}</span>
          </div>
          <div className="flex justify-between">
            <span>세금</span>
            <span className="font-medium text-red-500">-{formatKRW(savings.tax)}</span>
          </div>
        </div>
      </div>

      {/* 차액 */}
      <div className={`rounded-xl border-2 p-5 ${
        recommendation === "prepayment"
          ? "border-blue-500 bg-blue-50"
          : "border-green-500 bg-green-50"
      }`}>
        <h4 className="text-sm font-medium text-gray-500 mb-1">차액</h4>
        <p className={`text-2xl font-bold ${
          recommendation === "prepayment" ? "text-blue-700" : "text-green-700"
        }`}>
          {formatKRW(Math.abs(difference))}
        </p>
        <p className="mt-2 text-sm font-medium text-gray-700">
          {recommendation === "prepayment"
            ? "중도상환이 더 이득"
            : "정기예금이 더 이득"}
        </p>
      </div>
    </div>
  );
}
