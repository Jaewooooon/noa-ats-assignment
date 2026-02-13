export function toUserFacingErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return "입력값을 확인한 뒤 다시 시도해주세요.";
  }

  if (error.message.includes("must be a positive integer")) {
    return "기간은 1개월 이상의 정수로 입력해주세요.";
  }

  if (error.message.includes("must be a non-negative finite number")) {
    return "금액과 금리는 0 이상의 숫자로 입력해주세요.";
  }

  return "입력값을 확인한 뒤 다시 시도해주세요.";
}
