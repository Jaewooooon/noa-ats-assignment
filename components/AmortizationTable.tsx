"use client";

import { PrepaymentResult } from "@/lib/types";
import { formatKRW } from "@/lib/formatter";

interface AmortizationTableProps {
  prepayment: PrepaymentResult;
}

export default function AmortizationTable({ prepayment }: AmortizationTableProps) {
  const { originalLoan, prepaidLoan } = prepayment;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h4 className="text-base font-semibold text-gray-900 mb-4">상환 스케줄 상세 비교</h4>
      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th rowSpan={2} className="py-2 px-2 text-center text-gray-500 font-medium">월</th>
                <th colSpan={3} className="py-2 px-2 text-center text-blue-600 font-medium border-l border-gray-200">
                  기존 상환
                </th>
                <th colSpan={3} className="py-2 px-2 text-center text-green-600 font-medium border-l border-gray-200">
                  중도상환 후
                </th>
                <th rowSpan={2} className="py-2 px-2 text-center text-gray-500 font-medium border-l border-gray-200">
                  월 절감액
                </th>
              </tr>
              <tr className="border-b border-gray-300">
                <th className="py-1 px-2 text-center text-gray-500 font-normal text-xs border-l border-gray-200">원금</th>
                <th className="py-1 px-2 text-center text-gray-500 font-normal text-xs">이자</th>
                <th className="py-1 px-2 text-center text-gray-500 font-normal text-xs">잔액</th>
                <th className="py-1 px-2 text-center text-gray-500 font-normal text-xs border-l border-gray-200">원금</th>
                <th className="py-1 px-2 text-center text-gray-500 font-normal text-xs">이자</th>
                <th className="py-1 px-2 text-center text-gray-500 font-normal text-xs">잔액</th>
              </tr>
            </thead>
            <tbody>
              {originalLoan.schedule.map((orig, i) => {
                const prep = prepaidLoan.schedule[i];
                const interestDiff = orig.interestPayment - (prep?.interestPayment ?? 0);
                return (
                  <tr key={orig.month} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-1.5 px-2 text-center text-gray-600">{orig.month}</td>
                    <td className="py-1.5 px-2 text-right text-gray-700 border-l border-gray-200">
                      {formatKRW(orig.principalPayment)}
                    </td>
                    <td className="py-1.5 px-2 text-right text-gray-700">
                      {formatKRW(orig.interestPayment)}
                    </td>
                    <td className="py-1.5 px-2 text-right text-gray-700">
                      {formatKRW(orig.remainingBalance)}
                    </td>
                    <td className="py-1.5 px-2 text-right text-gray-700 border-l border-gray-200">
                      {prepaidLoan.schedule.length === 0 && i === 0 ? "-" : prep ? formatKRW(prep.principalPayment) : "-"}
                    </td>
                    <td className="py-1.5 px-2 text-right text-gray-700">
                      {prepaidLoan.schedule.length === 0 && i === 0 ? "-" : prep ? formatKRW(prep.interestPayment) : "-"}
                    </td>
                    <td className="py-1.5 px-2 text-right text-gray-700">
                      {prepaidLoan.schedule.length === 0 && i === 0 ? "완납" : prep ? formatKRW(prep.remainingBalance) : "-"}
                    </td>
                    <td className="py-1.5 px-2 text-right font-medium text-blue-600 border-l border-gray-200">
                      {formatKRW(interestDiff)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-300 font-semibold">
                <td className="py-2 px-2 text-center text-gray-700">합계</td>
                <td className="py-2 px-2 text-right text-gray-700 border-l border-gray-200" colSpan={2}>
                  이자: {formatKRW(originalLoan.totalInterest)}
                </td>
                <td className="py-2 px-2" />
                <td className="py-2 px-2 text-right text-gray-700 border-l border-gray-200" colSpan={2}>
                  이자: {formatKRW(prepaidLoan.totalInterest)}
                </td>
                <td className="py-2 px-2" />
                <td className="py-2 px-2 text-right text-blue-700 border-l border-gray-200">
                  {formatKRW(prepayment.interestSaved)}
                </td>
              </tr>
            </tfoot>
        </table>
      </div>
    </div>
  );
}
