"use client";

import { RefinanceResult } from "@/lib/types";
import { formatKRW } from "@/lib/formatter";

interface RefinanceRecommendationBannerProps {
  result: RefinanceResult;
}

export default function RefinanceRecommendationBanner({ result }: RefinanceRecommendationBannerProps) {
  const isRecommended = result.netBenefit > 0;

  return (
    <div className={`rounded-xl p-6 ${
      isRecommended
        ? "bg-blue-600 text-white"
        : "bg-orange-500 text-white"
    }`}>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">{isRecommended ? "✅" : "⚠️"}</span>
        <h3 className="text-xl font-bold">
          {isRecommended
            ? "대환대출을 추천합니다"
            : "대환대출을 권장하지 않습니다"}
        </h3>
      </div>
      <p className="text-white/90 text-base">
        {isRecommended
          ? `대환대출로 전환하면 기존 대출 대비 ${formatKRW(result.netBenefit)} 절감할 수 있습니다.`
          : `대환 비용을 고려하면 기존 대출을 유지하는 것이 ${formatKRW(Math.abs(result.netBenefit))} 더 유리합니다.`}
      </p>
      {isRecommended && result.breakEvenMonth > 0 && (
        <p className="mt-2 text-white/90 text-sm">
          💡 약 <strong>{result.breakEvenMonth}개월 후</strong>부터 이득을 볼 수 있습니다.
        </p>
      )}
      <div className="mt-4 bg-white/15 rounded-lg p-3 text-sm text-white/90">
        <p className="font-medium mb-1">참고사항</p>
        <ul className="list-disc list-inside space-y-0.5">
          <li>중도상환 수수료는 대출 상품 및 경과 기간에 따라 다를 수 있습니다.</li>
          <li>신규 대출 시 신용평가 및 소득 증빙이 필요할 수 있습니다.</li>
          <li>대환대출 금리는 시장 상황과 개인 신용도에 따라 달라질 수 있습니다.</li>
        </ul>
      </div>
    </div>
  );
}
