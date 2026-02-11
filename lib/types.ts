/** 상환 방식 */
export type RepaymentMethod = "equalPrincipalAndInterest" | "equalPrincipal" | "bulletRepayment";

/** 이자 과세 유형 */
export type TaxType = "normal" | "taxFree" | "taxReduced";

/** 시뮬레이터 입력 값 */
export interface SimulatorInput {
  // 대출 정보
  loanBalance: number;       // 대출 잔액 (원)
  loanRate: number;          // 연 금리 (%, 예: 4.5)
  remainingMonths: number;   // 잔여 기간 (개월)
  repaymentMethod: RepaymentMethod;

  // 중도상환
  prepaymentFeeRate: number; // 중도상환 수수료율 (%, 예: 1.4)

  // 여유 자금
  extraFunds: number;        // 여유 자금 (원)

  // 정기예금 비교
  savingsRate: number;       // 정기예금 연 금리 (%)
  taxType: TaxType;          // 이자 과세 유형
}

/** 월별 상환 스케줄 행 */
export interface AmortizationRow {
  month: number;
  principalPayment: number;  // 원금 상환액
  interestPayment: number;   // 이자 납부액
  totalPayment: number;      // 월 납부액 (원금 + 이자)
  remainingBalance: number;  // 남은 잔액
  cumulativeInterest: number; // 누적 이자
}

/** 대출 계산 결과 */
export interface LoanResult {
  schedule: AmortizationRow[];
  totalInterest: number;     // 총 이자
  totalPayment: number;      // 총 납부액 (원금 + 이자)
}

/** 조기상환 분석 결과 */
export interface PrepaymentResult {
  originalLoan: LoanResult;       // 기존 대출
  prepaidLoan: LoanResult;        // 조기상환 후 대출
  prepaymentFee: number;          // 중도상환 수수료
  interestSaved: number;          // 이자 절감액
  netBenefit: number;             // 순이익 (이자절감 - 수수료)
}

/** 정기예금 계산 결과 */
export interface SavingsResult {
  principal: number;              // 원금
  grossInterest: number;          // 세전 이자
  tax: number;                    // 세금
  netInterest: number;            // 세후 이자
  totalAmount: number;            // 만기 수령액
}

/** 최종 비교 결과 */
export interface ComparisonResult {
  prepayment: PrepaymentResult;
  savings: SavingsResult;
  difference: number;             // 조기상환 순이익 - 정기예금 순이익 (양수면 조기상환 유리)
  recommendation: "prepayment" | "savings";
}
