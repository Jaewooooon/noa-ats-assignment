# 대출 관리 시뮬레이터
 

## 프로젝트 소개

금리, 수수료, 세금, 상환방식이 섞인 금융 의사결정은 직관으로 판단하기 어렵습니다.  
이 프로젝트는 다음 상황에 대해 이자, 수수료 등을 계산하여 추천안을 제시합니다.

- `중도상환 vs 정기예금`
- `기존 대출 유지 vs 대환대출`


## 주요 기능

1. 중도상환 vs 정기예금 비교
- 대출 정보(잔액, 금리, 잔여기간, 상환방식) 입력
- 여유 자금/중도상환 수수료율 입력
- 정기예금 금리, 과세유형, 이자 계산 방식(단리/월복리) 선택
- 차액 및 추천 결과(`중도상환`, `정기예금`, `유사`) 출력

2. 대환대출 비교
- 기존 대출 조건과 새 대출 조건 입력
- 대환 비용(중도상환수수료, 인지세, 보증료) 반영
- 총 이자, 순이익, 월 납부액 변화, 손익분기 시점 출력


## 기술 스택

- Framework: `Next.js 15`
- Language: `TypeScript`
- UI: `React`, `Tailwind CSS`
- Test: `Vitest`

## 프로젝트 구조

```text
.
├── app/                # 페이지 및 전역 스타일
├── components/         # 화면 UI 및 공통 입력 컴포넌트
├── lib/                # 계산 로직, 추천 로직, 타입, 검증 규칙
├── hooks/              # localStorage 동기화 훅
└── README.md           # 실행/구조/기능 설명
```

## 실행 방법

요구 사항
- `Node.js 18+`
- `npm`

```bash
# 1) 의존성 설치
npm install

# 2) 개발 서버 실행 (http://localhost:3000)
npm run dev

# 3) 테스트 실행
npm test

# 4) 프로덕션 빌드
npm run build

# 5) 프로덕션 실행
npm run start
```

## 배포 URL

https://noa-ats-assignment.vercel.app/
