"use client";

import { ComparisonResult } from "@/lib/types";
import { formatKRW } from "@/lib/formatter";
import { COMPARISON_SIMILARITY_THRESHOLD } from "@/lib/constants";

interface RecommendationBannerProps {
  result: ComparisonResult;
}

export default function RecommendationBanner({ result }: RecommendationBannerProps) {
  const { difference, recommendation } = result;
  const absDiff = Math.abs(difference);

  const isPrepayment = recommendation === "prepayment";
  const isSimilar = recommendation === "similar";

  return (
    <div className={`rounded-xl p-6 ${
      isSimilar
        ? "bg-gray-700 text-white"
        : isPrepayment
        ? "bg-blue-600 text-white"
        : "bg-green-600 text-white"
    }`}>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">
          {isSimilar ? "⚖️" : isPrepayment ? "🏦" : "💰"}
        </span>
        <h3 className="text-xl font-bold">
          {isSimilar
            ? "두 선택지의 수익이 비슷합니다"
            : isPrepayment
            ? "대출 중도상환을 추천합니다"
            : "정기예금을 추천합니다"}
        </h3>
      </div>
      <p className="text-white/90 text-base">
        {isSimilar
          ? `중도상환과 정기예금의 차이가 ${formatKRW(absDiff)}로 ${formatKRW(COMPARISON_SIMILARITY_THRESHOLD)} 이하여서 수익이 거의 비슷합니다.`
          : isPrepayment
          ? `여유 자금을 대출 중도상환에 사용하면 정기예금 대비 ${formatKRW(absDiff)} 더 이득입니다.`
          : `여유 자금을 정기예금에 넣으면 중도상환 대비 ${formatKRW(absDiff)} 더 이득입니다.`}
      </p>
      <div className="mt-4 bg-white/15 rounded-lg p-3 text-sm text-white/90">
        <p className="font-medium mb-1">참고사항</p>
        <ul className="list-disc list-inside space-y-0.5">
          <li>실제 금융 상품의 조건에 따라 결과가 달라질 수 있습니다.</li>
          <li>중도상환 수수료는 대출 상품에 따라 다를 수 있으며, 경과 기간에 따라 감면될 수 있습니다.</li>
          <li>정기예금 금리는 가입 시점에 따라 변동될 수 있습니다.</li>
        </ul>
      </div>
    </div>
  );
}
