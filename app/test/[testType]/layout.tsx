/**
 * 動的テストルートのレイアウト
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

export default function TestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
