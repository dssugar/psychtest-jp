import { DataBadge } from "@/components/viz/DataBadge";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/viz/StatCard";
import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-12 text-center">
          <DataBadge color="green" size="lg">ABOUT</DataBadge>
          <h1 className="text-4xl md:text-5xl lg:text-7xl text-brutal-black mt-6 mb-4 animate-slide-in-up" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 900 }}>
            心理測定ラボについて
          </h1>
          <p className="text-lg md:text-xl text-brutal-gray-800 font-mono animate-slide-in-up" style={{ animationDelay: "0.1s" }}>
            学術的に裏付けのある心理テストで、心を科学的に測る
          </p>
        </div>

        {/* Mission Statement */}
        <div className="max-w-6xl mx-auto mb-16">
          <Card variant="white" padding="lg">
            <h2 className="text-3xl md:text-4xl text-brutal-black mb-6 text-center" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 700 }}>
              私たちのミッション
            </h2>
            <p className="text-lg text-brutal-gray-900 leading-relaxed text-center max-w-3xl mx-auto">
              「当たる診断」ではなく「<strong>測れる診断</strong>」を提供します。
              全ての診断は学術論文で検証された心理尺度に基づき、
              信頼性係数（Cronbach's α）、再テスト信頼性、引用論文数を明示します。
              エンターテイメントではなく、科学です。
            </p>
          </Card>
        </div>

        {/* Framework Explanation - 4層構造 */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl text-brutal-black mb-8 text-center" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 700 }}>
            心理測定の4層構造
          </h2>
          <p className="text-center text-brutal-gray-800 mb-6 max-w-3xl mx-auto">
            心理測定ラボは、心理学の<strong>Trait-State-Outcome-Skillモデル</strong>に基づいて構築されています。
            潜在状態特性理論（LST Theory: Steyer et al., 1999）とパーソナリティの機能的階層（McAdams Model）を統合した、
            心理測定の科学的分類フレームワークです。
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Trait */}
            <Card variant="white" padding="lg" className="border-l-brutal-thick border-l-viz-green">
              <DataBadge color="green" size="lg">LAYER I: TRAIT (気質的特性)</DataBadge>
              <h3 className="text-2xl md:text-3xl text-brutal-black mt-4 mb-3" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 700 }}>
                比較的安定した個人差
              </h3>
              <p className="text-brutal-gray-800 mb-3 leading-relaxed">
                文脈に依存しない、永続的な行動・感情の傾向。生物学的基盤が強く、成人期を通じて安定。
                短期間では変化しにくく、あなたらしさの「核」となる部分です。
              </p>
              <div className="mb-4 p-3 bg-brutal-gray-50 border-brutal border-brutal-gray-300">
                <p className="text-xs text-brutal-gray-700">
                  <strong>理論的背景:</strong> McAdams第1層「社会的俳優」、LST理論における高一貫性係数
                </p>
              </div>
              <div className="space-y-2">
                <div className="p-3 bg-brutal-gray-50 card-brutal">
                  <div className="font-bold text-sm mb-1">性格特性 (Big Five) ✅</div>
                  <div className="text-xs text-brutal-gray-800">IPIP-NEO-120: 外向性、協調性、誠実性、神経症傾向、開放性（30ファセット）</div>
                </div>
                <div className="p-3 bg-brutal-gray-50 card-brutal">
                  <div className="font-bold text-sm mb-1">勤勉性 / やり抜く力 (Industriousness / Grit) ✅</div>
                  <div className="text-xs text-brutal-gray-800">
                    IPIP-300 C4+C5: 達成動機と自己鍛錬の2軸測定（20項目）<br />
                    ※ Grit Scale (Duckworth et al., 2007) の概念をカバー
                  </div>
                </div>
                <div className="p-3 bg-brutal-gray-50 card-brutal">
                  <div className="font-bold text-sm mb-1">愛着スタイル (Attachment) *</div>
                  <div className="text-xs text-brutal-gray-800">
                    元: ECR-R (Fraley et al., 2000)<br />
                    代替: IPIP Attachment（不安・回避の2軸、4タイプ分類）
                  </div>
                </div>
                <div className="p-3 bg-brutal-gray-50 card-brutal">
                  <div className="font-bold text-sm mb-1">自己効力感 (Self-Efficacy) *</div>
                  <div className="text-xs text-brutal-gray-800">
                    元: GSE (Schwarzer & Jerusalem, 1995)<br />
                    代替: IPIP Self-Efficacy Facet（誠実性ドメイン）
                  </div>
                </div>
              </div>
            </Card>

            {/* Skill */}
            <Card variant="white" padding="lg" className="border-l-brutal-thick border-l-viz-orange">
              <DataBadge color="orange" size="lg">LAYER II: SKILL (心理的スキル)</DataBadge>
              <h3 className="text-2xl md:text-3xl text-brutal-black mt-4 mb-3" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 700 }}>
                育成可能な能力
              </h3>
              <p className="text-brutal-gray-800 mb-3 leading-relaxed">
                特定の文脈や課題に対処するために獲得された、訓練可能な能力や方略。
                トレーニングや介入によって向上させることができ、最も変化させやすい領域です。
              </p>
              <div className="mb-4 p-3 bg-brutal-gray-50 border-brutal border-brutal-gray-300">
                <p className="text-xs text-brutal-gray-700">
                  <strong>理論的背景:</strong> McAdams第2層「特性的適応」、プロセスベース治療（PBT）における変化プロセス
                </p>
              </div>
              <div className="space-y-2">
                <div className="p-3 bg-brutal-gray-50 card-brutal">
                  <div className="font-bold text-sm mb-1">レジリエンス (Hardiness) *</div>
                  <div className="text-xs text-brutal-gray-800">
                    元: CD-RISC (Connor & Davidson, 2003)<br />
                    代替: IPIP Hardiness（逆境に対する強さ、情緒安定性ドメイン）
                  </div>
                </div>
                <div className="p-3 bg-brutal-gray-50 card-brutal">
                  <div className="font-bold text-sm mb-1">マインドフルネス (MAAS)</div>
                  <div className="text-xs text-brutal-gray-800">Mindful Attention Awareness Scale（Brown & Ryan, 2003、15項目）</div>
                </div>
                <div className="p-3 bg-brutal-gray-50 card-brutal">
                  <div className="font-bold text-sm mb-1">対処スタイル (Coping) *</div>
                  <div className="text-xs text-brutal-gray-800">
                    元: Brief COPE (Carver, 1997)<br />
                    代替: IPIP Coping Proxy（ストレス対処、適応性尺度）
                  </div>
                </div>
              </div>
            </Card>

            {/* State */}
            <Card variant="white" padding="lg" className="border-l-brutal-thick border-l-viz-blue">
              <DataBadge color="blue" size="lg">LAYER III: STATE (状態)</DataBadge>
              <h3 className="text-2xl md:text-3xl text-brutal-black mt-4 mb-3" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 700 }}>
                現在の心理状態
              </h3>
              <p className="text-brutal-gray-800 mb-3 leading-relaxed">
                特定の時点・状況における心理的機能の一時的な発現。
                時間とともに変化しうる、現在のあなたの心理的状態です。環境やライフイベントの影響を受けやすく、介入可能な領域です。
              </p>
              <div className="mb-4 p-3 bg-brutal-gray-50 border-brutal border-brutal-gray-300">
                <p className="text-xs text-brutal-gray-700">
                  <strong>理論的背景:</strong> LST理論における状態残差(ζ)、状況特殊性
                </p>
              </div>
              <div className="space-y-2">
                <div className="p-3 bg-brutal-gray-50 card-brutal">
                  <div className="font-bold text-sm mb-1">うつ病スクリーニング (PHQ-9)</div>
                  <div className="text-xs text-brutal-gray-800">Patient Health Questionnaire-9（Kroenke et al., 2001、Pfizer、9項目、Tier S）</div>
                </div>
                <div className="p-3 bg-brutal-gray-50 card-brutal">
                  <div className="font-bold text-sm mb-1">不安症スクリーニング (GAD-7)</div>
                  <div className="text-xs text-brutal-gray-800">Generalized Anxiety Disorder-7（Spitzer et al., 2006、Pfizer、7項目、Tier S）</div>
                </div>
                <div className="p-3 bg-brutal-gray-50 card-brutal">
                  <div className="font-bold text-sm mb-1">ストレス (DASS-21) *</div>
                  <div className="text-xs text-brutal-gray-800">
                    元: PSS-10 (Cohen & Williamson, 1988)<br />
                    代替: DASS-21 Stress Subscale（Lovibond & Lovibond, 1995、パブリックドメイン、7項目）
                  </div>
                </div>
                <div className="p-3 bg-brutal-gray-50 card-brutal">
                  <div className="font-bold text-sm mb-1">自己概念明確性 (Self-Concept) *</div>
                  <div className="text-xs text-brutal-gray-800">
                    元: SCCS (Campbell et al., 1996)<br />
                    代替: IPIP Self-Consciousness Scale（自己理解の明確さ）
                  </div>
                </div>
              </div>
            </Card>

            {/* Outcome */}
            <Card variant="white" padding="lg" className="border-l-brutal-thick border-l-viz-pink">
              <DataBadge color="pink" size="lg">LAYER IV: OUTCOME (成果・ウェルビーイング)</DataBadge>
              <h3 className="text-2xl md:text-3xl text-brutal-black mt-4 mb-3" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 700 }}>
                成果・ウェルビーイング
              </h3>
              <p className="text-brutal-gray-800 mb-3 leading-relaxed">
                特性・スキル・状態と環境との相互作用の結果として生じる、主観的幸福感や生活機能。
                治療効果判定の指標となる、最も実感しやすい領域です。
              </p>
              <div className="mb-4 p-3 bg-brutal-gray-50 border-brutal border-brutal-gray-300">
                <p className="text-xs text-brutal-gray-700">
                  <strong>理論的背景:</strong> Patient-Reported Outcomes（PRO）、変化への感度
                </p>
              </div>
              <div className="space-y-2">
                <div className="p-3 bg-brutal-gray-50 card-brutal">
                  <div className="font-bold text-sm mb-1">自尊心 (Self-Esteem) ✅</div>
                  <div className="text-xs text-brutal-gray-800">Rosenberg Self-Esteem Scale（Rosenberg, 1965、パブリックドメイン、10項目）</div>
                </div>
                <div className="p-3 bg-brutal-gray-50 card-brutal">
                  <div className="font-bold text-sm mb-1">人生満足度 (Life Satisfaction) *</div>
                  <div className="text-xs text-brutal-gray-800">
                    元: SWLS (Diener et al., 1985)<br />
                    代替: Riverside Life Satisfaction Scale（Margolis et al., 2019、CCライセンス、8項目）
                  </div>
                </div>
                <div className="p-3 bg-brutal-gray-50 card-brutal">
                  <div className="font-bold text-sm mb-1">キャリア適性 (Career Fit)</div>
                  <div className="text-xs text-brutal-gray-800">RIASEC Interest Profiler（Holland, 1997、O*NET、政府作成、60項目）</div>
                </div>
                <div className="p-3 bg-brutal-gray-50 card-brutal">
                  <div className="font-bold text-sm mb-1">孤独感 (Loneliness)</div>
                  <div className="text-xs text-brutal-gray-800">UCLA Loneliness Scale-3（Russell, 1996、20項目）</div>
                </div>
              </div>
            </Card>
          </div>

          {/* 学術的代替尺度の説明 */}
          <div className="mt-6">
            <Card variant="white" padding="md" className="border-brutal-yellow" style={{ background: '#ffd700' }}>
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">📋</span>
                <div>
                  <h4 className="font-bold text-sm mb-2">学術的代替尺度の使用について</h4>
                  <p className="text-xs leading-relaxed text-brutal-gray-800 mb-3">
                    著作権の関係上、一部の構成概念（グリット、ストレス、自己概念明確性など）については、
                    原著尺度と<strong>統計的に有意な高い相関（r &gt; .70）</strong>を持つ
                    学術的に検証された代替尺度を使用しています。
                    全ての尺度は査読付き学術論文で信頼性・妥当性が確認されたものです。
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs">
                    <div>
                      <span className="font-bold">✅</span> = 現在実装済み
                    </div>
                    <div>
                      <span className="font-bold">*</span> = 学術的代替尺度を使用（原著との相関 r &gt; .70）
                    </div>
                    <div>
                      <span className="font-bold">無印</span> = 商用利用が明示的に許可された尺度
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* 理論的支柱の詳細説明 */}
          <div className="mt-6 space-y-4">
            <Card variant="white" padding="md" className="bg-brutal-gray-50">
              <h4 className="font-bold text-sm uppercase tracking-wide text-brutal-gray-800 mb-3">
                📚 学術的根拠：3つの理論的支柱
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-brutal-gray-800 leading-relaxed">
                <div>
                  <p className="font-semibold mb-1">1. LST理論（数学的分解）</p>
                  <p>
                    Steyerらによる潜在状態特性理論。心理測定値を「安定した特性(ξ)」と「状況依存的な状態残差(ζ)」に分解する数学的フレームワーク。
                    <br /><span className="font-mono text-brutal-gray-600">→ Steyer et al., 1999; 2015</span>
                  </p>
                </div>
                <div>
                  <p className="font-semibold mb-1">2. McAdamsモデル（機能的階層）</p>
                  <p>
                    パーソナリティの3層構造：第1層（気質的特性）、第2層（特性的適応・スキル）、第3層（ナラティブ・アイデンティティ）。人間の可塑性を説明。
                    <br /><span className="font-mono text-brutal-gray-600">→ McAdams & Pals, 2006</span>
                  </p>
                </div>
                <div>
                  <p className="font-semibold mb-1">3. HiTOP × PBT（臨床視座）</p>
                  <p>
                    精神病理の階層的分類（HiTOP）は「症状vs特性=時間枠の違い」を示し、プロセスベース治療（PBT）は介入可能なスキルをターゲットとする。
                    <br /><span className="font-mono text-brutal-gray-600">→ Kotov et al., 2017; Hayes et al., 2020</span>
                  </p>
                </div>
              </div>
            </Card>

            <Card variant="white" padding="md" className="border-brutal border-viz-blue" style={{ background: '#e6f2ff' }}>
              <p className="text-xs text-brutal-gray-800 leading-relaxed">
                <strong>💡 なぜこの分類が重要か：</strong>
                「特性（Trait）」は変えにくいが受容すべき素質、「スキル（Skill）」は訓練で伸ばせる能力、「状態（State）」は一時的で環境に依存、「成果（Outcome）」は介入の効果を測る指標です。
                この区別により、「何を変えられるか、何を受け入れるべきか」が明確になり、科学的根拠に基づいた自己理解と成長戦略が可能になります。
              </p>
            </Card>

            <Card variant="white" padding="md" className="border-brutal border-viz-green" style={{ background: '#f0fff4' }}>
              <h4 className="font-bold text-sm uppercase tracking-wide text-brutal-gray-800 mb-3">
                💡 因果関係の解釈
              </h4>
              <div className="space-y-2 text-xs text-brutal-gray-800 leading-relaxed">
                <p><strong>TRAIT → SKILL:</strong> 性格特性が、スキル習得の容易さに影響</p>
                <p><strong>SKILL → STATE:</strong> 心理的スキルが、ストレス状態を緩和</p>
                <p><strong>STATE → OUTCOME:</strong> 一時的な状態が、臨床症状の重症度として測定される</p>
              </div>
              <div className="mt-4 pt-4 border-t border-brutal-gray-300">
                <p className="text-xs text-brutal-gray-800 leading-relaxed">
                  <strong>📚 学術的根拠：</strong>
                  この4層構造は、Latent State-Trait (LST) 理論（Steyer et al., 1999）とMcAdamsの3層モデルを統合したものです。
                  TRAITとSTATEは心理測定の数学的分解、SKILLは訓練可能な適応、
                  OUTCOMEは特性・スキル・状態の相互作用の結果として生じる臨床症状や生活機能を表します（治療効果判定の指標）。
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* Why Academic Scales */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl text-brutal-black mb-8 text-center" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 700 }}>
            なぜ学術的心理尺度なのか
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card variant="white" padding="md">
              <div className="text-4xl mb-4 text-center">📊</div>
              <h3 className="text-xl text-brutal-black mb-3 text-center" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 700 }}>
                信頼性
              </h3>
              <p className="text-sm text-brutal-gray-800 leading-relaxed">
                全ての尺度は<strong>Cronbach's α（内的一貫性）</strong>と
                <strong>再テスト信頼性</strong>が検証済み。
                何度測っても同じ結果が得られます。
              </p>
            </Card>

            <Card variant="white" padding="md">
              <div className="text-4xl mb-4 text-center">🔬</div>
              <h3 className="text-xl text-brutal-black mb-3 text-center" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 700 }}>
                妥当性
              </h3>
              <p className="text-sm text-brutal-gray-800 leading-relaxed">
                数千〜数万人のデータで検証され、
                <strong>実際に測りたいものを測れている</strong>ことが
                学術的に証明されています。
              </p>
            </Card>

            <Card variant="white" padding="md">
              <div className="text-4xl mb-4 text-center">🌍</div>
              <h3 className="text-xl text-brutal-black mb-3 text-center" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 700 }}>
                再現性
              </h3>
              <p className="text-sm text-brutal-gray-800 leading-relaxed">
                世界中の研究者が<strong>同じ尺度を使用</strong>し、
                結果を比較・蓄積できます。
                これが科学の力です。
              </p>
            </Card>
          </div>

          <Card variant="white" padding="lg" className="bg-viz-yellow border-brutal-black">
            <h3 className="text-2xl text-brutal-black mb-4" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 700 }}>
              ⚠️ MBTIや動物診断との違い
            </h3>
            <div className="space-y-3 text-sm text-brutal-black">
              <p>
                <strong>MBTI/16Personalities:</strong> 再テスト信頼性 r = 0.50程度。
                半数の人が数週間後に別のタイプになります（コイン投げレベル）。
              </p>
              <p>
                <strong>動物診断（血液型診断など）:</strong> 学術的根拠なし。
                エンターテイメントとしては楽しいですが、自己理解には使えません。
              </p>
              <p className="pt-2 border-t border-brutal-black">
                <strong>心理測定ラボ:</strong> 全ての尺度で r &gt; 0.70、α &gt; 0.70の
                ゴールドスタンダードをクリア。再現性のある科学的測定です。
              </p>
            </div>
          </Card>
        </div>

        {/* Our Standards */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl text-brutal-black mb-8 text-center" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 700 }}>
            私たちの基準
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard
              icon="⭐"
              label="Tier S (Gold Standard)"
              value="Big Five (IPIP), PHQ-9, GAD-7, RSES"
              description="最も広く使用され、商用許諾済み"
              color="green"
            />
            <StatCard
              icon="🔄"
              label="代替尺度戦略"
              value="IPIP, DASS-21, Riverside など"
              description="原著との相関 r > .70、商用利用可能"
              color="blue"
            />
            <StatCard
              icon="❌"
              label="採用しない (Tier C)"
              value="MBTI, 動物診断, 血液型"
              description="信頼性が基準を満たさない (r < 0.60)"
              color="orange"
            />
            <StatCard
              icon="📚"
              label="透明性の原則"
              value="原著論文と代替尺度の両方を明記"
              description="学術的トレーサビリティの確保"
              color="pink"
            />
          </div>
        </div>

        {/* Disclaimer */}
        <div className="max-w-6xl mx-auto mb-12">
          <Card variant="white" padding="lg" className="bg-brutal-gray-50">
            <h3 className="text-xl text-brutal-black mb-4 text-center" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 700 }}>
              ⚕️ 医療診断ではありません
            </h3>
            <p className="text-sm text-brutal-gray-800 leading-relaxed text-center max-w-3xl mx-auto">
              心理測定ラボは、心理学の研究で使用される<strong>スクリーニング尺度</strong>を提供します。
              これらは自己理解や研究目的には有用ですが、<strong>医療診断の代替ではありません</strong>。
              深刻な心理的症状がある場合は、必ず医療専門家にご相談ください。
            </p>
          </Card>
        </div>

        {/* CTA */}
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl text-brutal-black mb-6" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 700 }}>
            診断を始めましょう
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="btn-brutal bg-brutal-black text-brutal-white px-10 py-4 text-center min-h-[44px]"
            >
              マイダッシュボード
            </Link>
            <Link
              href="/"
              className="btn-brutal bg-brutal-white text-brutal-black px-10 py-4 text-center min-h-[44px]"
            >
              トップページへ
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
