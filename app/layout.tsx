import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "17の戦略分野 × 契約学科",
  description:
    "政府「17の戦略分野」の官民投資額（想定）と、2026年7月にNEDOが採択した契約学科5件の対応関係。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
