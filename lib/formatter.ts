/** 금액을 한국 원화 형식으로 포맷 (예: 1,234,567원) */
export function formatKRW(amount: number): string {
  const rounded = Math.round(amount);
  return rounded.toLocaleString("ko-KR") + "원";
}

/** 금액을 만원 단위로 포맷 (예: 123.5만원) */
export function formatManWon(amount: number): string {
  const manWon = amount / 10000;
  if (manWon >= 10000) {
    const uk = manWon / 10000;
    return uk.toFixed(1).replace(/\.0$/, "") + "억원";
  }
  return manWon.toFixed(1).replace(/\.0$/, "") + "만원";
}

/** 퍼센트 포맷 (예: 4.5%) */
export function formatPercent(value: number): string {
  return value.toFixed(2).replace(/\.?0+$/, "") + "%";
}
