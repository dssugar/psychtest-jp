/**
 * 動的結果ルートのレイアウト
 * generateStaticParams() を定義して静的パス生成を行う
 */
export function generateStaticParams() {
  return [
    { testType: "rosenberg" },
    { testType: "bigfive" },
    { testType: "selfconcept" },
    { testType: "phq9" },
    { testType: "swls" },
    { testType: "k6" },
    { testType: "industriousness" },
  ];
}

export default function ResultsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
