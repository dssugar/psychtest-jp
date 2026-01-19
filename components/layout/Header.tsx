import Link from "next/link";

export function Header() {
  return (
    <header className="border-b-brutal border-brutal-black bg-brutal-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left: Site Name */}
          <Link
            href="/"
            className="text-xl md:text-2xl text-brutal-black hover:opacity-70 transition-opacity tracking-wide"
            style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 900 }}
          >
            心理測定ラボ
          </Link>

          {/* Right: Dashboard Link */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 bg-brutal-white border-brutal border-brutal-black hover:bg-brutal-gray-100 transition-colors font-semibold uppercase tracking-wide text-sm"
          >
            <span>📊</span>
            <span className="hidden sm:inline">マイダッシュボード</span>
            <span className="sm:hidden">ダッシュボード</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
