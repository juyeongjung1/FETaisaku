import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ALGONOTE｜科目Bを、読める力から。",
  description:
    "基本情報技術者試験・科目Bを初心者から段階的に学ぶオリジナル教材のプロトタイプです。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
