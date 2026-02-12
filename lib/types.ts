/** 상환 방식 */
export type RepaymentMethod = "equalPrincipalAndInterest" | "equalPrincipal" | "bulletRepayment";

/** 이자 과세 유형 */
export type TaxType = "normal" | "taxFree" | "taxReduced";

/** 이자 계산 방식 */
export type InterestType = "simple" | "monthlyCompound";

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
  interestType: InterestType; // 이자 계산 방식 (단리/월복리)
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

/** 중도상환 분석 결과 */
export interface PrepaymentResult {
  originalLoan: LoanResult;       // 기존 대출
  prepaidLoan: LoanResult;        // 중도상환 후 대출
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
  difference: number;             // 중도상환 순이익 - 정기예금 순이익 (양수면 중도상환 유리)
  recommendation: "prepayment" | "savings";
}

/** 대환대출 입력 값 */
export interface RefinanceInput {
  // 기존 대출
  currentBalance: number;         // 현재 대출 잔액
  currentRate: number;            // 현재 연 금리 (%)
  currentMonths: number;          // 현재 잔여 기간 (개월)
  currentMethod: RepaymentMethod; // 현재 상환 방식

  // 새 대출
  newRate: number;                // 새 대출 연 금리 (%)
  newMonths: number;              // 새 대출 기간 (개월)
  newMethod: RepaymentMethod;     // 새 대출 상환 방식

  // 대환 비용
  prepaymentFeeRate: number;      // 중도상환 수수료율 (%)
  stampTax: number;               // 인지세 (원)
  guaranteeFee: number;           // 보증료 등 기타 비용 (원)
}

/** 대환대출 비교 결과 */
export interface RefinanceResult {
  currentLoan: LoanResult;        // 기존 대출
  newLoan: LoanResult;            // 새 대출
  totalCost: number;              // 총 대환 비용 (수수료 + 인지세 + 보증료)
  interestSaved: number;          // 이자 절감액
  monthlyPaymentDiff: number;     // 월 납부액 차이 (음수면 감소)
  netBenefit: number;             // 순이익 (이자절감 - 대환비용)
  breakEvenMonth: number;         // 손익분기월 (몇 개월 후 이득인지)
}
