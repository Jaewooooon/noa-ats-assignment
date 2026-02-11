"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import { ComparisonResult } from "@/lib/types";
import { calculateMonthlySavingsAccumulation } from "@/lib/savingsCalculator";
import { SimulatorInput } from "@/lib/types";
import { formatKRW } from "@/lib/formatter";

interface ComparisonChartProps {
  result: ComparisonResult;
  input: SimulatorInput;
}

export default function ComparisonChart({ result, input }: ComparisonChartProps) {
  const { prepayment, savings } = result;

  // 막대 차트 데이터
  const barData = [
    {
      name: "중도상환",
      이자절감: Math.round(prepayment.interestSaved),
      수수료: Math.round(prepayment.prepaymentFee),
      순이익: Math.round(prepayment.netBenefit),
    },
    {
      name: "정기예금",
      세전이자: Math.round(savings.grossInterest),
      세금: Math.round(savings.tax),
      순이익: Math.round(savings.netInterest),
    },
  ];

  // 라인 차트 데이터: 월별 누적 비교
  const savingsMonthly = calculateMonthlySavingsAccumulation(
    input.extraFunds,
    input.savingsRate,
    input.remainingMonths,
    input.taxType
  );

  const originalSchedule = prepayment.originalLoan.schedule;
  const prepaidSchedule = prepayment.prepaidLoan.schedule;

  const lineData = Array.from({ length: input.remainingMonths }, (_, i) => {
    const month = i + 1;
    const origCumInterest = originalSchedule[i]?.cumulativeInterest ?? 0;
    const prepCumInterest = prepaidSchedule[i]?.cumulativeInterest ?? 0;
    const cumulativeSaved = origCumInterest - prepCumInterest - prepayment.prepaymentFee;
    const cumulativeSavings = savingsMonthly[i]?.cumulativeNetInterest ?? 0;

    return {
      month: `${month}월`,
      중도상환순이익: Math.round(cumulativeSaved),
      적금순이익: Math.round(cumulativeSavings),
    };
  });

  const formatTooltipValue = (value: number | undefined) => value != null ? formatKRW(value) : "";

  return (
    <div className="space-y-8">
      {/* 막대 차트 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h4 className="text-base font-semibold text-gray-900 mb-4">손익 비교</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`} />
            <Tooltip formatter={formatTooltipValue} />
            <Legend />
            <Bar dataKey="순이익" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 라인 차트 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h4 className="text-base font-semibold text-gray-900 mb-4">월별 누적 순이익 추이</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={lineData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              interval={Math.max(0, Math.floor(input.remainingMonths / 6) - 1)}
            />
            <YAxis tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`} />
            <Tooltip formatter={formatTooltipValue} />
            <Legend />
            <Line type="monotone" dataKey="중도상환순이익" stroke="#3b82f6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="적금순이익" stroke="#22c55e" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
