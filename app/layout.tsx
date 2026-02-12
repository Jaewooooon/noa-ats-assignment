import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "대출 중도상환 vs 정기예금 시뮬레이터",
  description: "여유 자금을 대출 중도상환에 쓸지, 정기예금에 넣을지 비교하여 최적의 선택을 도와주는 시뮬레이터",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
