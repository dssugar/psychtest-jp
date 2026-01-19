import { StatCard } from "@/components/viz/StatCard";
import { DataBadge } from "@/components/viz/DataBadge";
import { Card } from "@/components/ui/Card";
import { scaleInfo as bigFiveScaleInfo } from "@/data/bigfive-questions";
import { scaleInfo as phq9ScaleInfo } from "@/data/phq9-questions";
import { scaleInfo as swlsScaleInfo } from "@/data/swls-questions";
import { scaleInfo as k6ScaleInfo } from "@/data/k6-questions";

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-12 md:py-20">
        {/* Hero Section */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="text-center mb-8 animate-slide-in-up">
            <h1 className="text-5xl md:text-7xl lg:text-9xl text-brutal-black mb-4 leading-none tracking-wider" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 900 }}>
              心理測定ラボ
            </h1>
            <p className="text-lg md:text-xl text-brutal-gray-600 font-mono mb-4 tracking-wide">
              Psychometric Lab
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <DataBadge color="green">LST理論</DataBadge>
              <DataBadge color="orange">McAdamsモデル</DataBadge>
              <DataBadge color="blue">4層構造</DataBadge>
            </div>
          </div>

          <p className="text-center text-lg md:text-xl lg:text-2xl text-brutal-gray-800 max-w-2xl mx-auto mb-8 animate-slide-in-up" style={{ animationDelay: "0.1s", fontFamily: 'var(--font-display-ja)', fontWeight: 500 }}>
            科学的フレームワークで、心を多層的に理解する。<br />
            <span className="text-base md:text-lg text-brutal-gray-700" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 400 }}>Trait・Skill・State・Outcomeの4つの層で、あなたを測定。</span>
          </p>
        </div>

        {/* PSYCHOLOGICAL FRAMEWORK Section */}
        <div className="max-w-6xl mx-auto mb-16">
          <Card variant="white" padding="lg">
            <div className="mb-8 text-center">
              <DataBadge color="four-layer" size="lg">
                PSYCHOLOGICAL FRAMEWORK
              </DataBadge>
              <h2 className="text-3xl md:text-4xl text-brutal-black mt-4 mb-3 tracking-wide" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 900 }}>
                心理測定の4層構造
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Layer I: Trait */}
              <Card variant="white" padding="md" className="border-l-brutal-thick border-l-viz-green">
                <DataBadge color="green" size="sm">LAYER I</DataBadge>
                <h3 className="text-lg text-brutal-black mt-3 mb-1" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 700 }}>
                  気質的特性
                </h3>
                <p className="text-xs font-mono text-brutal-gray-600 mb-3">
                  Dispositional Trait
                </p>
                <p className="text-sm text-brutal-gray-800 mb-3 leading-relaxed">
                  文脈に依存しない、永続的な行動・感情の傾向。生物学的基盤が強く、成人期を通じて安定。
                </p>
                <div className="mb-3 p-2 bg-brutal-gray-50 border-brutal border-brutal-gray-300">
                  <p className="text-xs text-brutal-gray-700">
                    <strong>理論:</strong> McAdams第1層「社会的俳優」、LST高一貫性係数
                  </p>
                </div>
                <ul className="text-xs text-brutal-gray-800 space-y-1">
                  <li>• 性格特性 (Big Five) ✅</li>
                  <li>• やり抜く力 (Grit) * <span className="text-brutal-gray-600">← Grit Scale</span></li>
                  <li>• 愛着スタイル (Attachment) * <span className="text-brutal-gray-600">← ECR-R</span></li>
                  <li>• 自己効力感 (Self-Efficacy) * <span className="text-brutal-gray-600">← GSE</span></li>
                </ul>
              </Card>

              {/* Layer II: Skill */}
              <Card variant="white" padding="md" className="border-l-brutal-thick border-l-viz-orange">
                <DataBadge color="orange" size="sm">LAYER II</DataBadge>
                <h3 className="text-lg text-brutal-black mt-3 mb-1" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 700 }}>
                  心理的スキル
                </h3>
                <p className="text-xs font-mono text-brutal-gray-600 mb-3">
                  Psychological Skill
                </p>
                <p className="text-sm text-brutal-gray-800 mb-3 leading-relaxed">
                  特定の文脈や課題に対処するために獲得された、訓練可能な能力や方略。介入によって変化する。
                </p>
                <div className="mb-3 p-2 bg-brutal-gray-50 border-brutal border-brutal-gray-300">
                  <p className="text-xs text-brutal-gray-700">
                    <strong>理論:</strong> McAdams第2層「特性的適応」、PBT変化プロセス
                  </p>
                </div>
                <ul className="text-xs text-brutal-gray-800 space-y-1">
                  <li>• レジリエンス (Hardiness) * <span className="text-brutal-gray-600">← CD-RISC</span></li>
                  <li>• マインドフルネス (MAAS)</li>
                  <li>• 対処スタイル (Coping) * <span className="text-brutal-gray-600">← Brief COPE</span></li>
                </ul>
              </Card>

              {/* Layer III: State */}
              <Card variant="white" padding="md" className="border-l-brutal-thick border-l-viz-blue">
                <DataBadge color="blue" size="sm">LAYER III</DataBadge>
                <h3 className="text-lg text-brutal-black mt-3 mb-1" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 700 }}>
                  状態
                </h3>
                <p className="text-xs font-mono text-brutal-gray-600 mb-3">
                  State
                </p>
                <p className="text-sm text-brutal-gray-800 mb-3 leading-relaxed">
                  特定の時点・状況における心理的機能の一時的な発現。環境の変化に敏感に反応する。
                </p>
                <div className="mb-3 p-2 bg-brutal-gray-50 border-brutal border-brutal-gray-300">
                  <p className="text-xs text-brutal-gray-700">
                    <strong>理論:</strong> LST状態残差(ζ)、状況特殊性
                  </p>
                </div>
                <ul className="text-xs text-brutal-gray-800 space-y-1">
                  <li>• うつ病スクリーニング (PHQ-9) ✅</li>
                  <li>• 心理的苦痛スクリーニング (K6) ✅</li>
                  <li>• 不安症スクリーニング (GAD-7)</li>
                  <li>• ストレス (DASS-21) * <span className="text-brutal-gray-600">← PSS-10</span></li>
                  <li>• 自己概念明確性 (Self-Concept) ✅ <span className="text-brutal-gray-600">← IPIP Self-Consciousness</span></li>
                </ul>
              </Card>

              {/* Layer IV: Outcome */}
              <Card variant="white" padding="md" className="border-l-brutal-thick border-l-viz-pink">
                <DataBadge color="pink" size="sm">LAYER IV</DataBadge>
                <h3 className="text-lg text-brutal-black mt-3 mb-1" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 700 }}>
                  成果・ウェルビーイング
                </h3>
                <p className="text-xs font-mono text-brutal-gray-600 mb-3">
                  Outcome / Well-being
                </p>
                <p className="text-sm text-brutal-gray-800 mb-3 leading-relaxed">
                  特性・スキル・状態と環境との相互作用の結果として生じる、主観的幸福感や生活機能。治療効果判定の指標。
                </p>
                <div className="mb-3 p-2 bg-brutal-gray-50 border-brutal border-brutal-gray-300">
                  <p className="text-xs text-brutal-gray-700">
                    <strong>理論:</strong> Patient-Reported Outcomes、変化への感度
                  </p>
                </div>
                <ul className="text-xs text-brutal-gray-800 space-y-1">
                  <li>• 自尊心 (Rosenberg) ✅</li>
                  <li>• 人生満足度 (SWLS) ✅</li>
                  <li>• キャリア適性 (RIASEC)</li>
                  <li>• 孤独感 (Loneliness)</li>
                </ul>
              </Card>
            </div>
          </Card>
        </div>

        {/* Available Tests Section */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl text-brutal-black mb-8 text-center tracking-wide" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 900 }}>
            利用可能な診断
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Rosenberg Card */}
          <Card as="a" href="/rosenberg" variant="white" padding="lg" hover className="animate-scale-in" style={{ animationDelay: "0.3s" }}>
            {/* Test Header */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
              <div className="flex-1">
                <div className="inline-block mb-4">
                  <DataBadge color="pink" size="lg">RSES</DataBadge>
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-5xl font-display text-brutal-black mb-4 leading-tight">
                  Rosenberg<br />Self-Esteem Scale
                </h2>
                <p className="text-lg text-brutal-gray-800" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 500 }}>
                  自尊心を測定する10問の心理尺度
                </p>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-col gap-3">
                <Card variant="pink" padding="sm" className="text-center">
                  <div className="text-3xl md:text-4xl font-mono font-bold data-number">10</div>
                  <div className="text-xs font-semibold uppercase tracking-wide">Questions</div>
                </Card>
                <Card variant="black" padding="sm" className="text-center">
                  <div className="text-3xl md:text-4xl font-mono font-bold data-number">~3</div>
                  <div className="text-xs font-semibold uppercase tracking-wide">Minutes</div>
                </Card>
              </div>
            </div>

            {/* Academic Credentials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatCard
                icon="📊"
                label="信頼性係数"
                value="α = 0.77-0.88"
                description="高い内的一貫性"
                color="pink"
              />
              <StatCard
                icon="🔄"
                label="再テスト信頼性"
                value="r = 0.82-0.85"
                description="2週間後も安定"
                color="green"
              />
              <StatCard
                icon="👥"
                label="開発者"
                value="M. Rosenberg"
                description="1965年"
                color="orange"
              />
              <StatCard
                icon="📚"
                label="引用論文数"
                value="50,000+"
                description="最も使用される尺度"
                color="blue"
              />
            </div>
          </Card>

          {/* Big Five Card */}
          <Card as="a" href="/bigfive" variant="white" padding="lg" hover className="animate-scale-in" style={{ animationDelay: "0.4s" }}>
            {/* Test Header */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
              <div className="flex-1">
                <div className="inline-block mb-4">
                  <DataBadge color="green" size="lg">{bigFiveScaleInfo.abbreviation}</DataBadge>
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-5xl font-display text-brutal-black mb-4 leading-tight">
                  Big Five<br />Personality Test
                </h2>
                <p className="text-lg text-brutal-gray-800" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 500 }}>
                  5つの性格特性を30ファセットで測定する{bigFiveScaleInfo.stats.questions}問の心理尺度
                </p>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-col gap-3">
                <Card variant="green" padding="sm" className="text-center">
                  <div className="text-3xl md:text-4xl font-mono font-bold data-number">{bigFiveScaleInfo.stats.questions}</div>
                  <div className="text-xs font-semibold uppercase tracking-wide">Questions</div>
                </Card>
                <Card variant="black" padding="sm" className="text-center">
                  <div className="text-3xl md:text-4xl font-mono font-bold data-number">~{bigFiveScaleInfo.stats.minutes}</div>
                  <div className="text-xs font-semibold uppercase tracking-wide">Minutes</div>
                </Card>
              </div>
            </div>

            {/* Academic Credentials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatCard
                icon="📊"
                label="信頼性係数"
                value={`α = ${bigFiveScaleInfo.reliability.cronbachAlpha}`}
                description="各ファセットで高い一貫性"
                color="green"
              />
              <StatCard
                icon="🔄"
                label="再テスト信頼性"
                value={bigFiveScaleInfo.reliability.testRetest}
                description="安定した測定結果"
                color="pink"
              />
              <StatCard
                icon="👥"
                label="開発者"
                value={bigFiveScaleInfo.developer}
                description="J Res Personality (2014)"
                color="blue"
              />
              <StatCard
                icon="📚"
                label="引用論文数"
                value={bigFiveScaleInfo.citations}
                description="広く使用される尺度"
                color="orange"
              />
            </div>
          </Card>

          {/* Self-Concept Clarity Card */}
          <Card as="a" href="/selfconcept" variant="white" padding="lg" hover className="animate-scale-in" style={{ animationDelay: "0.5s" }}>
            {/* Test Header */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
              <div className="flex-1">
                <div className="inline-block mb-4">
                  <DataBadge color="blue" size="lg">SCC</DataBadge>
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-5xl font-display text-brutal-black mb-4 leading-tight">
                  Self-Concept<br />Clarity
                </h2>
                <p className="text-sm font-mono text-brutal-gray-600 mb-2">
                  IPIP Self-Consciousness Scale
                </p>
                <p className="text-lg text-brutal-gray-800" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 500 }}>
                  自己概念の明確さを測定する8問の心理尺度
                </p>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-col gap-3">
                <Card variant="blue" padding="sm" className="text-center">
                  <div className="text-3xl md:text-4xl font-mono font-bold data-number">8</div>
                  <div className="text-xs font-semibold uppercase tracking-wide">Questions</div>
                </Card>
                <Card variant="black" padding="sm" className="text-center">
                  <div className="text-3xl md:text-4xl font-mono font-bold data-number">~2</div>
                  <div className="text-xs font-semibold uppercase tracking-wide">Minutes</div>
                </Card>
              </div>
            </div>

            {/* Academic Credentials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatCard
                icon="📊"
                label="信頼性係数"
                value="α = 0.79"
                description="高い内的一貫性"
                color="blue"
              />
              <StatCard
                icon="🔄"
                label="再テスト信頼性"
                value="r = 0.75"
                description="4週間後も安定"
                color="green"
              />
              <StatCard
                icon="👥"
                label="開発元"
                value="IPIP (2006)"
                description="パブリックドメイン"
                color="orange"
              />
              <StatCard
                icon="📚"
                label="引用論文数"
                value="2,000+"
                description="広く使用される尺度"
                color="pink"
              />
            </div>
          </Card>

          {/* PHQ-9 Card */}
          <Card as="a" href="/phq9" variant="white" padding="lg" hover className="animate-scale-in" style={{ animationDelay: "0.6s" }}>
            {/* Test Header */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
              <div className="flex-1">
                <div className="inline-block mb-4">
                  <DataBadge color="orange" size="lg">{phq9ScaleInfo.abbreviation}</DataBadge>
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-5xl font-display text-brutal-black mb-4 leading-tight">
                  PHQ-9<br />Depression Screening
                </h2>
                <p className="text-sm font-mono text-brutal-gray-600 mb-2">
                  こころとからだの質問票
                </p>
                <p className="text-lg text-brutal-gray-800" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 500 }}>
                  うつ病の症状を測定する{phq9ScaleInfo.stats.questions}問の国際標準スクリーニングツール
                </p>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-col gap-3">
                <Card variant="orange" padding="sm" className="text-center">
                  <div className="text-3xl md:text-4xl font-mono font-bold data-number">{phq9ScaleInfo.stats.questions}</div>
                  <div className="text-xs font-semibold uppercase tracking-wide">Questions</div>
                </Card>
                <Card variant="black" padding="sm" className="text-center">
                  <div className="text-3xl md:text-4xl font-mono font-bold data-number">~{phq9ScaleInfo.stats.minutes}</div>
                  <div className="text-xs font-semibold uppercase tracking-wide">Minutes</div>
                </Card>
              </div>
            </div>

            {/* Academic Credentials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatCard
                icon="⭐"
                label="学術的ティア"
                value={phq9ScaleInfo.tier}
                description="国際標準ツール"
                color="orange"
              />
              <StatCard
                icon="📊"
                label="信頼性係数"
                value="α = 0.86-0.89"
                description="極めて高い一貫性"
                color="green"
              />
              <StatCard
                icon="🔄"
                label="再テスト信頼性"
                value="r = 0.82-0.84"
                description="安定した測定結果"
                color="pink"
              />
              <StatCard
                icon="📚"
                label="引用論文数"
                value={phq9ScaleInfo.citations}
                description="最も使用される尺度"
                color="blue"
              />
            </div>

            {/* Warning Badge */}
            <div className="mt-6 p-3 bg-viz-orange border-2 border-brutal-black">
              <div className="flex items-start gap-2">
                <div className="text-lg">⚠️</div>
                <p className="text-xs text-brutal-black leading-relaxed">
                  <strong>医療診断ではありません。</strong>スクリーニング目的の心理尺度です。深刻な症状がある場合は専門家にご相談ください。
                </p>
              </div>
            </div>
          </Card>

          {/* SWLS Card */}
          <Card as="a" href="/swls" variant="white" padding="lg" hover className="animate-scale-in" style={{ animationDelay: "0.7s" }}>
            {/* Test Header */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
              <div className="flex-1">
                <div className="inline-block mb-4">
                  <DataBadge color="blue" size="lg">{swlsScaleInfo.abbreviation}</DataBadge>
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-5xl font-display text-brutal-black mb-4 leading-tight">
                  SWLS<br />Life Satisfaction
                </h2>
                <p className="text-sm font-mono text-brutal-gray-600 mb-2">
                  {swlsScaleInfo.nameJa}
                </p>
                <p className="text-lg text-brutal-gray-800" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 500 }}>
                  人生全体への満足度を測定する{swlsScaleInfo.stats.questions}問の世界標準尺度
                </p>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-col gap-3">
                <Card variant="blue" padding="sm" className="text-center">
                  <div className="text-3xl md:text-4xl font-mono font-bold data-number">{swlsScaleInfo.stats.questions}</div>
                  <div className="text-xs font-semibold uppercase tracking-wide">Questions</div>
                </Card>
                <Card variant="black" padding="sm" className="text-center">
                  <div className="text-3xl md:text-4xl font-mono font-bold data-number">~{swlsScaleInfo.stats.minutes}</div>
                  <div className="text-xs font-semibold uppercase tracking-wide">Minutes</div>
                </Card>
              </div>
            </div>

            {/* Academic Credentials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatCard
                icon="⭐"
                label="学術的ティア"
                value={swlsScaleInfo.tier}
                description="世界標準の幸福度尺度"
                color="blue"
              />
              <StatCard
                icon="📊"
                label="信頼性係数"
                value="α = 0.87"
                description="極めて高い一貫性"
                color="green"
              />
              <StatCard
                icon="🔄"
                label="再テスト信頼性"
                value="r = 0.82-0.84"
                description="安定した測定結果"
                color="pink"
              />
              <StatCard
                icon="📚"
                label="引用論文数"
                value={swlsScaleInfo.citations}
                description="最も引用される幸福度尺度"
                color="orange"
              />
            </div>

            {/* Cultural Note */}
            <div className="mt-6 p-3 bg-viz-blue border-2 border-brutal-black">
              <div className="flex items-start gap-2">
                <div className="text-lg">🌏</div>
                <p className="text-xs text-brutal-black leading-relaxed">
                  <strong>文化差について:</strong> 日本人平均18.9点 vs 米国平均23.5点。低スコア = 不幸ではありません。
                </p>
              </div>
            </div>
          </Card>

          {/* K6 Card */}
          <Card as="a" href="/k6" variant="white" padding="lg" hover className="animate-scale-in" style={{ animationDelay: "0.8s" }}>
            {/* Test Header */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
              <div className="flex-1">
                <div className="inline-block mb-4">
                  <DataBadge color="cyan" size="lg">{k6ScaleInfo.abbreviation}</DataBadge>
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-5xl font-display text-brutal-black mb-4 leading-tight">
                  K6<br />Psychological Distress
                </h2>
                <p className="text-sm font-mono text-brutal-gray-600 mb-2">
                  {k6ScaleInfo.nameJa}
                </p>
                <p className="text-lg text-brutal-gray-800" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 500 }}>
                  過去30日間の心理的苦痛を測定する{k6ScaleInfo.stats.questions}問の国際標準スクリーニングツール
                </p>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-col gap-3">
                <Card variant="cyan" padding="sm" className="text-center">
                  <div className="text-3xl md:text-4xl font-mono font-bold data-number">{k6ScaleInfo.stats.questions}</div>
                  <div className="text-xs font-semibold uppercase tracking-wide">Questions</div>
                </Card>
                <Card variant="black" padding="sm" className="text-center">
                  <div className="text-3xl md:text-4xl font-mono font-bold data-number">~2</div>
                  <div className="text-xs font-semibold uppercase tracking-wide">Minutes</div>
                </Card>
              </div>
            </div>

            {/* Academic Credentials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatCard
                icon="⭐"
                label="学術的ティア"
                value={k6ScaleInfo.tier}
                description="国際標準ツール"
                color="cyan"
              />
              <StatCard
                icon="📊"
                label="信頼性係数"
                value={`α = ${k6ScaleInfo.reliability.cronbachAlpha}`}
                description="極めて高い一貫性"
                color="green"
              />
              <StatCard
                icon="🎯"
                label="識別精度"
                value="AUC = 0.94"
                description="94%の精度で精神疾患を識別"
                color="pink"
              />
              <StatCard
                icon="📚"
                label="引用論文数"
                value="数百+"
                description="30カ国以上で使用"
                color="blue"
              />
            </div>

            {/* Warning Badge */}
            <div className="mt-6 p-3 bg-viz-cyan border-2 border-brutal-black">
              <div className="flex items-start gap-2">
                <div className="text-lg">⚠️</div>
                <p className="text-xs text-brutal-black leading-relaxed">
                  <strong>医療診断ではありません。</strong>スクリーニング目的の心理尺度です。深刻な症状がある場合は専門家にご相談ください。
                </p>
              </div>
            </div>
          </Card>
        </div>
        </div>
      </div>
    </main>
  );
}
