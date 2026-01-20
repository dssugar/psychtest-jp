import { Card } from "@/components/ui/Card";
import { DataBadge } from "@/components/viz/DataBadge";

export default function ReferencesPage() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-[1200px]">
      <h1 className="font-display text-4xl md:text-5xl mb-4 brutal-shadow">
        参考文献・学術的根拠
      </h1>
      <p className="text-lg text-brutal-gray-800 mb-8 leading-relaxed">
        当サイトで使用している全ての心理尺度の原著論文と信頼性指標を掲載しています。
        透明性と追跡可能性を重視し、全ての測定手法の学術的根拠を明示します。
      </p>

      {/* Introduction: Alternative Scale Strategy */}
      <Card variant="white" padding="lg" className="mb-12 bg-brutal-yellow border-brutal-yellow" style={{ background: '#ffd700' }}>
        <h2 className="font-display text-2xl mb-4">📋 学術的代替尺度戦略について</h2>
        <div className="space-y-3 text-sm leading-relaxed">
          <p>
            当サイトは、学術的信頼性と法的安全性を両立するため、<strong>IPIP（International Personality Item Pool）</strong>を中核とした代替尺度戦略を採用しています。
          </p>
          <p>
            一部の著名な心理尺度（Grit Scale、PSS-10、CD-RISCなど）は商用利用に制限があるため、
            原著尺度と<strong>統計的に高い相関（r &gt; .70）</strong>を持つ、学術的に検証された代替尺度を使用しています。
          </p>
          <p className="font-semibold">
            全ての代替尺度は、原著論文で信頼性・妥当性が確認されたパブリックドメインまたは商用利用許諾済みの尺度です。
          </p>
        </div>
      </Card>

      {/* Framework */}
      <Card variant="white" padding="lg" className="mb-12">
        <h2 className="font-display text-3xl mb-6">理論的フレームワーク</h2>

        {/* LST Theory */}
        <div className="mb-8 p-6 bg-brutal-gray-50 border-brutal border-brutal-black">
          <h3 className="font-display text-xl mb-3">
            1. LST理論（Latent State-Trait Theory）
          </h3>
          <div className="mb-4">
            <p className="text-sm mb-2 leading-relaxed">
              <strong>Steyer, R., Schmitt, M., & Eid, M. (1999).</strong>{" "}
              Latent state-trait theory and research in personality and individual differences.
              <br />
              <em>European Journal of Personality, 13</em>(5), 389-408.
            </p>
          </div>
          <p className="text-sm text-brutal-gray-800 leading-relaxed">
            心理測定値を「安定した特性（Trait: ξ）」と「状況依存的な状態残差（State: ζ）」に<strong>数学的に分解</strong>する理論。
            心理尺度の分散構造を定量化し、何が変わらない素質で、何が変化しうる状態かを明確にします。
          </p>
        </div>

        {/* McAdams Model */}
        <div className="mb-8 p-6 bg-brutal-gray-50 border-brutal border-brutal-black">
          <h3 className="font-display text-xl mb-3">
            2. McAdamsモデル（Three-Layer Framework）
          </h3>
          <div className="mb-4">
            <p className="text-sm mb-2 leading-relaxed">
              <strong>McAdams, D. P., & Pals, J. L. (2006).</strong>{" "}
              A new Big Five: Fundamental principles for an integrative science of personality.
              <br />
              <em>American Psychologist, 61</em>(3), 204-217.
            </p>
          </div>
          <p className="text-sm text-brutal-gray-800 leading-relaxed">
            パーソナリティの<strong>機能的階層</strong>を示すモデル。
            第1層（気質的特性）、第2層（特性的適応・スキル）、第3層（ナラティブ・アイデンティティ）の3層で人間性を記述します。
            「変えられるもの」と「受け入れるべきもの」の区別を可能にします。
          </p>
        </div>

        {/* HiTOP x PBT */}
        <div className="p-6 bg-brutal-gray-50 border-brutal border-brutal-black">
          <h3 className="font-display text-xl mb-3">
            3. HiTOP × PBT（臨床視座）
          </h3>
          <div className="mb-4">
            <p className="text-sm mb-2 leading-relaxed">
              <strong>Kotov, R., et al. (2017).</strong> The Hierarchical Taxonomy of Psychopathology (HiTOP).
              <br />
              <em>Journal of Abnormal Psychology, 126</em>(4), 454-477.
            </p>
            <p className="text-sm mb-2 leading-relaxed">
              <strong>Hayes, S. C., et al. (2020).</strong> A Process-Based Approach to Psychological Diagnosis and Treatment.
              <br />
              <em>Clinical Psychology Review, 82</em>, 101918.
            </p>
          </div>
          <p className="text-sm text-brutal-gray-800 leading-relaxed">
            HiTOPは「症状vs特性=<strong>時間枠の違い</strong>」という原理を示し、
            PBTは介入可能な<strong>心理的スキル（変化プロセス）</strong>をターゲットとする治療法です。
            これらの視点により、第2層（スキル）と第3層（状態）、第4層（成果）の区別が明確化されます。
          </p>
        </div>
      </Card>

      {/* Trait Layer */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <DataBadge color="green" size="lg">LAYER I: TRAIT</DataBadge>
          <h2 className="font-display text-3xl">気質的特性尺度</h2>
        </div>

        {/* Big Five */}
        <Card variant="white" padding="lg" className="mb-6 border-l-brutal-thick border-l-viz-green">
          <h3 className="font-display text-2xl mb-4">
            Big Five Personality (IPIP-NEO-120) ✅
          </h3>

          <div className="mb-4">
            <h4 className="font-bold text-sm mb-2 uppercase tracking-wide">📚 原著論文</h4>
            <div className="bg-brutal-gray-50 p-4 border-brutal border-brutal-black text-sm leading-relaxed">
              <p className="mb-3">
                <strong>Goldberg, L. R. (1992).</strong> The development of markers for the Big-Five factor structure.
                <br />
                <em>Psychological Assessment, 4</em>(1), 26-42.
                <br />
                <a
                  href="https://doi.org/10.1037/1040-3590.4.1.26"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 underline hover:text-blue-900"
                >
                  https://doi.org/10.1037/1040-3590.4.1.26
                </a>
              </p>
              <p>
                <strong>Goldberg, L. R. (1999).</strong> A broad-bandwidth, public-domain, personality inventory measuring the lower-level facets of several five-factor models.
                <br />
                <em>Personality Psychology in Europe, 7</em>, 7-28.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-brutal-gray-50 p-4 card-brutal">
              <div className="font-bold text-sm mb-1">📊 信頼性係数</div>
              <div className="text-2xl font-mono">α = 0.77 - 0.90</div>
              <div className="text-xs text-brutal-gray-600 mt-1">
                （5因子平均）
              </div>
            </div>
            <div className="bg-brutal-gray-50 p-4 card-brutal">
              <div className="font-bold text-sm mb-1">🔄 再テスト信頼性</div>
              <div className="text-2xl font-mono">r = 0.70 - 0.85</div>
              <div className="text-xs text-brutal-gray-600 mt-1">
                （因子ごと）
              </div>
            </div>
            <div className="bg-brutal-gray-50 p-4 card-brutal">
              <div className="font-bold text-sm mb-1">📖 引用数</div>
              <div className="text-2xl font-mono">10,000+</div>
            </div>
          </div>

          <div className="bg-viz-green bg-opacity-10 p-4 border-brutal border-brutal-black">
            <div className="font-bold text-sm mb-2">✅ 採用理由</div>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li><strong>パブリックドメイン:</strong> 完全無料、商用利用制限なし</li>
              <li><strong>商用NEO-PI-Rとの相関:</strong> r &gt; .90（減衰補正後）</li>
              <li><strong>多言語検証:</strong> 日本語版IPIP-J含む、50言語以上</li>
              <li><strong>30ファセット測定:</strong> 詳細なプロファイル提供可能</li>
            </ul>
          </div>

          <div className="mt-4 p-3 bg-brutal-gray-50 border-brutal border-brutal-black text-sm">
            <span className="font-bold">ライセンス:</span> Public Domain（IPIP公式サイトに明記）
          </div>
        </Card>

        {/* Grit (IPIP Alternative) */}
        <Card variant="white" padding="lg" className="mb-6 border-l-brutal-thick border-l-viz-green">
          <h3 className="font-display text-2xl mb-4">
            勤勉性 / やり抜く力 (Industriousness / Grit) ✅
          </h3>

          <div className="mb-4 p-4 bg-viz-green text-brutal-white border-brutal border-brutal-black">
            <div className="font-bold text-sm mb-2">✅ 実装済み（代替尺度使用）</div>
            <p className="text-sm leading-relaxed">
              <strong>元の尺度:</strong> Grit Scale (Duckworth et al., 2007)<br />
              <strong>代替:</strong> IPIP-300 C4 (Achievement Striving) + C5 (Self-Discipline)<br />
              <strong>理由:</strong> 原著は商用利用不可（©️Angela Duckworth Lab）<br />
              <strong>相関:</strong> r &gt; .75（誠実性ファセットとして妥当性確認済み）
            </p>
          </div>

          <div className="bg-brutal-gray-50 p-4 card-brutal text-sm mb-4">
            <p className="mb-2">
              <strong>学術的根拠:</strong> グリットの概念は、Big Fiveの誠実性（Conscientiousness）ドメインに含まれる
              「勤勉性（Industriousness）」や「忍耐力（Perseverance）」と心理測定学的にほぼ区別がつかないことが複数の研究で示されています。
            </p>
            <p className="text-xs text-brutal-gray-600">
              Credé, M., Tynan, M. C., & Harms, P. D. (2017). Much ado about grit: A meta-analytic synthesis. <em>Journal of Personality and Social Psychology, 113</em>(3), 492-511.
            </p>
          </div>

          <div className="p-3 bg-brutal-gray-50 border-brutal border-brutal-black text-sm">
            <span className="font-bold">ライセンス:</span> Public Domain (IPIP)
          </div>
        </Card>

        {/* Self-Efficacy (IPIP Alternative) */}
        <Card variant="white" padding="lg" className="mb-6 border-l-brutal-thick border-l-viz-green">
          <h3 className="font-display text-2xl mb-4">
            Self-Efficacy (自己効力感) *
          </h3>

          <div className="mb-4 p-4 bg-brutal-yellow border-brutal border-brutal-black">
            <div className="font-bold text-sm mb-2">📌 代替尺度を使用</div>
            <p className="text-sm leading-relaxed">
              <strong>元の尺度:</strong> GSE (Schwarzer & Jerusalem, 1995)<br />
              <strong>代替:</strong> IPIP Self-Efficacy Facet<br />
              <strong>理由:</strong> 原著は研究目的のみ許可、商用利用は制限あり<br />
              <strong>信頼性:</strong> α = .78 - .82
            </p>
          </div>

          <div className="p-3 bg-brutal-gray-50 border-brutal border-brutal-black text-sm">
            <span className="font-bold">ライセンス:</span> Public Domain (IPIP)
          </div>
        </Card>
      </div>

      {/* Skill Layer */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <DataBadge color="orange" size="lg">LAYER II: SKILL</DataBadge>
          <h2 className="font-display text-3xl">心理的スキル尺度</h2>
        </div>

        {/* Resilience (IPIP Alternative) */}
        <Card variant="white" padding="lg" className="mb-6 border-l-brutal-thick border-l-viz-orange">
          <h3 className="font-display text-2xl mb-4">
            Resilience (レジリエンス) *
          </h3>

          <div className="mb-4 p-4 bg-brutal-yellow border-brutal border-brutal-black">
            <div className="font-bold text-sm mb-2">📌 代替尺度を使用</div>
            <p className="text-sm leading-relaxed">
              <strong>元の尺度:</strong> CD-RISC (Connor & Davidson, 2003)<br />
              <strong>代替:</strong> IPIP Hardiness Scale<br />
              <strong>理由:</strong> 原著は商用ライセンス必須（有料）<br />
              <strong>構成概念:</strong> 情緒安定性ドメインの逆境耐性項目
            </p>
          </div>

          <div className="bg-brutal-gray-50 p-4 card-brutal text-sm mb-4">
            <p>
              <strong>理論的位置づけ:</strong> レジリエンスは「変化可能な能力（Skill）」として定義されます（McAdams第2層）。
              マインドフルネスやCBTなどの介入によってスコアが向上することが複数のメタ分析で確認されています。
            </p>
          </div>

          <div className="p-3 bg-brutal-gray-50 border-brutal border-brutal-black text-sm">
            <span className="font-bold">ライセンス:</span> Public Domain (IPIP)
          </div>
        </Card>

        {/* Mindfulness (MAAS) */}
        <Card variant="white" padding="lg" className="mb-6 border-l-brutal-thick border-l-viz-orange">
          <h3 className="font-display text-2xl mb-4">
            Mindfulness (MAAS)
          </h3>

          <div className="mb-4">
            <h4 className="font-bold text-sm mb-2 uppercase tracking-wide">📚 原著論文</h4>
            <div className="bg-brutal-gray-50 p-4 border-brutal border-brutal-black text-sm leading-relaxed">
              <p>
                <strong>Brown, K. W., & Ryan, R. M. (2003).</strong> The benefits of being present: Mindfulness and its role in psychological well-being.
                <br />
                <em>Journal of Personality and Social Psychology, 84</em>(4), 822-848.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-brutal-gray-50 p-4 card-brutal">
              <div className="font-bold text-sm mb-1">📊 信頼性係数</div>
              <div className="text-2xl font-mono">α = 0.82 - 0.87</div>
            </div>
            <div className="bg-brutal-gray-50 p-4 card-brutal">
              <div className="font-bold text-sm mb-1">📄 項目数</div>
              <div className="text-2xl font-mono">15項目</div>
            </div>
          </div>

          <div className="p-3 bg-brutal-gray-50 border-brutal border-brutal-black text-sm">
            <span className="font-bold">ライセンス:</span> Public Domain（公式サイトに"special permission is not required"と明記）
          </div>
        </Card>

        {/* Coping (IPIP Alternative) */}
        <Card variant="white" padding="lg" className="mb-6 border-l-brutal-thick border-l-viz-orange">
          <h3 className="font-display text-2xl mb-4">
            Coping (対処スタイル) *
          </h3>

          <div className="mb-4 p-4 bg-brutal-yellow border-brutal border-brutal-black">
            <div className="font-bold text-sm mb-2">📌 代替尺度を使用</div>
            <p className="text-sm leading-relaxed">
              <strong>元の尺度:</strong> Brief COPE (Carver, 1997)<br />
              <strong>代替:</strong> IPIP Stress Reaction / Adaptability Scales<br />
              <strong>理由:</strong> Brief COPEは商用利用の可否がグレーゾーン<br />
            </p>
          </div>

          <div className="p-3 bg-brutal-gray-50 border-brutal border-brutal-black text-sm">
            <span className="font-bold">ライセンス:</span> Public Domain (IPIP)
          </div>
        </Card>
      </div>

      {/* State Layer */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <DataBadge color="blue" size="lg">LAYER III: STATE</DataBadge>
          <h2 className="font-display text-3xl">状態尺度</h2>
        </div>

        {/* PHQ-9 */}
        <Card variant="white" padding="lg" className="mb-6 border-l-brutal-thick border-l-viz-blue">
          <h3 className="font-display text-2xl mb-4">
            PHQ-9 (うつ病スクリーニング)
          </h3>

          <div className="mb-4">
            <h4 className="font-bold text-sm mb-2 uppercase tracking-wide">📚 原著論文</h4>
            <div className="bg-brutal-gray-50 p-4 border-brutal border-brutal-black text-sm leading-relaxed">
              <p>
                <strong>Kroenke, K., Spitzer, R. L., & Williams, J. B. (2001).</strong> The PHQ-9: Validity of a brief depression severity measure.
                <br />
                <em>Journal of General Internal Medicine, 16</em>(9), 606-613.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-brutal-gray-50 p-4 card-brutal">
              <div className="font-bold text-sm mb-1">📊 信頼性係数</div>
              <div className="text-2xl font-mono">α = 0.86 - 0.89</div>
            </div>
            <div className="bg-brutal-gray-50 p-4 card-brutal">
              <div className="font-bold text-sm mb-1">🎯 感度・特異度</div>
              <div className="text-2xl font-mono">88% / 88%</div>
            </div>
            <div className="bg-brutal-gray-50 p-4 card-brutal">
              <div className="font-bold text-sm mb-1">📖 引用数</div>
              <div className="text-2xl font-mono">11,000+</div>
            </div>
          </div>

          <div className="bg-brutal-yellow bg-opacity-50 p-4 border-brutal border-brutal-black mb-4">
            <div className="font-bold text-sm mb-2">⚠️ スクリーニング目的</div>
            <p className="text-sm">
              PHQ-9は<strong>うつ症状のスクリーニング尺度</strong>であり、診断ツールではありません。
              高得点の場合は、医療専門家にご相談ください。
            </p>
          </div>

          <div className="p-3 bg-brutal-gray-50 border-brutal border-brutal-black text-sm">
            <span className="font-bold">ライセンス:</span> Pfizer Inc. 提供。"No permission required to reproduce, translate, display or distribute"（許可不要）と明記
          </div>
        </Card>

        {/* GAD-7 */}
        <Card variant="white" padding="lg" className="mb-6 border-l-brutal-thick border-l-viz-blue">
          <h3 className="font-display text-2xl mb-4">
            GAD-7 (不安症スクリーニング)
          </h3>

          <div className="mb-4">
            <h4 className="font-bold text-sm mb-2 uppercase tracking-wide">📚 原著論文</h4>
            <div className="bg-brutal-gray-50 p-4 border-brutal border-brutal-black text-sm leading-relaxed">
              <p>
                <strong>Spitzer, R. L., Kroenke, K., Williams, J. B., & Löwe, B. (2006).</strong> A brief measure for assessing generalized anxiety disorder: The GAD-7.
                <br />
                <em>Archives of Internal Medicine, 166</em>(10), 1092-1097.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-brutal-gray-50 p-4 card-brutal">
              <div className="font-bold text-sm mb-1">📊 信頼性係数</div>
              <div className="text-2xl font-mono">α = 0.92</div>
            </div>
            <div className="bg-brutal-gray-50 p-4 card-brutal">
              <div className="font-bold text-sm mb-1">🔄 再テスト信頼性</div>
              <div className="text-2xl font-mono">r = 0.83</div>
            </div>
          </div>

          <div className="p-3 bg-brutal-gray-50 border-brutal border-brutal-black text-sm">
            <span className="font-bold">ライセンス:</span> Pfizer Inc. 提供（PHQ-9と同様に許可不要）
          </div>
        </Card>

        {/* Stress (DASS-21 Alternative) */}
        <Card variant="white" padding="lg" className="mb-6 border-l-brutal-thick border-l-viz-blue">
          <h3 className="font-display text-2xl mb-4">
            Stress (ストレス) *
          </h3>

          <div className="mb-4 p-4 bg-brutal-yellow border-brutal border-brutal-black">
            <div className="font-bold text-sm mb-2">📌 代替尺度を使用</div>
            <p className="text-sm leading-relaxed">
              <strong>元の尺度:</strong> PSS-10 (Cohen & Williamson, 1988)<br />
              <strong>代替:</strong> DASS-21 Stress Subscale (Lovibond & Lovibond, 1995)<br />
              <strong>理由:</strong> PSS-10は商用利用でMind Garden社がライセンス主張<br />
              <strong>信頼性:</strong> α = .87 - .94（ストレスサブスケール）
            </p>
          </div>

          <div className="bg-brutal-gray-50 p-4 card-brutal text-sm mb-4">
            <p>
              DASS-21はうつ・不安・ストレスの3因子構造を持つパブリックドメインの尺度です。
              ストレスサブスケール（7項目）は緊張、動揺、過敏さを測定し、PSS-10と同等の構成概念をカバーしています。
            </p>
          </div>

          <div className="p-3 bg-brutal-gray-50 border-brutal border-brutal-black text-sm">
            <span className="font-bold">ライセンス:</span> Public Domain（UNSW公式サイトに"permission is not needed to use it"と明記）
          </div>
        </Card>

        {/* Self-Concept Clarity (IPIP Alternative) */}
        <Card variant="white" padding="lg" className="mb-6 border-l-brutal-thick border-l-viz-blue">
          <div className="flex items-start justify-between mb-4">
            <h3 className="font-display text-2xl">
              Self-Concept Clarity (自己概念明確性) *
            </h3>
            <span className="text-xs bg-brutal-yellow px-3 py-1 border-brutal border-brutal-black font-bold whitespace-nowrap">
              ⏳ 著作権確認中
            </span>
          </div>

          <div className="mb-4 p-4 bg-brutal-yellow border-brutal border-brutal-black">
            <div className="font-bold text-sm mb-2">📌 代替尺度を使用</div>
            <p className="text-sm leading-relaxed">
              <strong>元の尺度:</strong> SCCS (Campbell et al., 1996)<br />
              <strong>代替:</strong> IPIP Self-Consciousness Scale<br />
              <strong>理由:</strong> SCCS原著はAPA著作権、商用利用の許諾を確認中<br />
              <strong>構成概念:</strong> 自己理解の明確さ（神経症傾向・開放性ファセット）
            </p>
          </div>

          <div className="p-3 bg-brutal-gray-50 border-brutal border-brutal-black text-sm">
            <span className="font-bold">ライセンス:</span> Public Domain (IPIP)
          </div>
        </Card>
      </div>

      {/* Outcome Layer */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <DataBadge color="pink" size="lg">LAYER IV: OUTCOME</DataBadge>
          <h2 className="font-display text-3xl">成果・ウェルビーイング尺度</h2>
        </div>

        {/* Rosenberg */}
        <Card variant="white" padding="lg" className="mb-6 border-l-brutal-thick border-l-viz-pink">
          <h3 className="font-display text-2xl mb-4">
            Rosenberg Self-Esteem Scale ✅
          </h3>

          <div className="mb-4">
            <h4 className="font-bold text-sm mb-2 uppercase tracking-wide">📚 原著論文</h4>
            <div className="bg-brutal-gray-50 p-4 border-brutal border-brutal-black text-sm leading-relaxed">
              <p>
                <strong>Rosenberg, M. (1965).</strong> Society and the adolescent self-image.
                <br />
                <em>Princeton, NJ: Princeton University Press.</em>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-brutal-gray-50 p-4 card-brutal">
              <div className="font-bold text-sm mb-1">📊 信頼性係数</div>
              <div className="text-2xl font-mono">α = 0.77 - 0.88</div>
            </div>
            <div className="bg-brutal-gray-50 p-4 card-brutal">
              <div className="font-bold text-sm mb-1">🔄 再テスト信頼性</div>
              <div className="text-2xl font-mono">r = 0.82 - 0.85</div>
            </div>
            <div className="bg-brutal-gray-50 p-4 card-brutal">
              <div className="font-bold text-sm mb-1">📖 引用数</div>
              <div className="text-2xl font-mono">50,000+</div>
            </div>
          </div>

          <div className="bg-brutal-gray-50 p-4 card-brutal text-sm mb-4">
            <p>
              <strong>理論的位置づけ:</strong> LST分析により、自尊心は安定した特性（40-60%）と状態変動（30-40%）の混合であることが示されています。
              社会的受容をモニタリングする「ソシオメーター」として機能し、環境への透過性が高い構成概念です。
            </p>
          </div>

          <div className="p-3 bg-brutal-gray-50 border-brutal border-brutal-black text-sm">
            <span className="font-bold">ライセンス:</span> Public Domain（クレジット表記を推奨）
          </div>
        </Card>

        {/* Life Satisfaction (Riverside Alternative) */}
        <Card variant="white" padding="lg" className="mb-6 border-l-brutal-thick border-l-viz-pink">
          <h3 className="font-display text-2xl mb-4">
            Life Satisfaction (人生満足度) *
          </h3>

          <div className="mb-4 p-4 bg-brutal-yellow border-brutal border-brutal-black">
            <div className="font-bold text-sm mb-2">📌 代替尺度を使用</div>
            <p className="text-sm leading-relaxed">
              <strong>元の尺度:</strong> SWLS (Diener et al., 1985)<br />
              <strong>代替:</strong> Riverside Life Satisfaction Scale (Margolis et al., 2019)<br />
              <strong>理由:</strong> SWLSは近年"non-commercial purposes only"に変更<br />
              <strong>相関:</strong> r = .90（SWLSとほぼ同一の構成概念）<br />
              <strong>信頼性:</strong> α &gt; .90
            </p>
          </div>

          <div className="p-3 bg-brutal-gray-50 border-brutal border-brutal-black text-sm">
            <span className="font-bold">ライセンス:</span> Open Access（著者ブログで"Free to use!"と明言）
          </div>
        </Card>

        {/* RIASEC */}
        <Card variant="white" padding="lg" className="mb-6 border-l-brutal-thick border-l-viz-pink">
          <h3 className="font-display text-2xl mb-4">
            RIASEC (キャリア適性)
          </h3>

          <div className="mb-4">
            <h4 className="font-bold text-sm mb-2 uppercase tracking-wide">📚 原著論文</h4>
            <div className="bg-brutal-gray-50 p-4 border-brutal border-brutal-black text-sm leading-relaxed">
              <p>
                <strong>Holland, J. L. (1997).</strong> Making vocational choices: A theory of vocational personalities and work environments (3rd ed.).
                <br />
                <em>Odessa, FL: Psychological Assessment Resources.</em>
              </p>
            </div>
          </div>

          <div className="bg-brutal-gray-50 p-4 card-brutal text-sm mb-4">
            <p>
              <strong>O*NET Interest Profiler:</strong> 米国労働省が開発したRIASECモデルに基づくキャリア診断ツール。
              6つの職業興味タイプ（現実的、研究的、芸術的、社会的、企業的、慣習的）を測定します。
            </p>
          </div>

          <div className="p-3 bg-brutal-gray-50 border-brutal border-brutal-black text-sm">
            <span className="font-bold">ライセンス:</span> CC-BY 4.0（米国労働省、商用利用・再配布許可）
          </div>
        </Card>
      </div>

      {/* Tier System */}
      <Card variant="white" padding="lg" className="mb-12">
        <h2 className="font-display text-3xl mb-4">尺度の採用基準</h2>
        <p className="text-sm text-brutal-gray-800 mb-6 leading-relaxed">
          当サイトは、以下の基準で心理尺度をTier分けし、学術的信頼性と法的安全性の両方を満たす尺度のみを採用します。
        </p>

        <div className="space-y-4">
          <div className="bg-viz-green bg-opacity-20 p-4 border-brutal border-brutal-black">
            <h3 className="font-display text-lg mb-2">⭐ Tier S (Gold Standard)</h3>
            <p className="text-sm mb-2">
              <strong>基準:</strong> Cronbach's α &gt; 0.80, 再テストr &gt; 0.75, 引用数10,000+, 商用利用許諾済み
            </p>
            <p className="text-sm font-mono">
              Big Five (IPIP-NEO), PHQ-9, GAD-7, Rosenberg Self-Esteem, DASS-21
            </p>
          </div>

          <div className="bg-viz-blue bg-opacity-20 p-4 border-brutal border-brutal-black">
            <h3 className="font-display text-lg mb-2">🔄 代替尺度戦略</h3>
            <p className="text-sm mb-2">
              <strong>基準:</strong> 原著との相関 r &gt; .70, Cronbach's α &gt; 0.70, パブリックドメイン
            </p>
            <p className="text-sm font-mono">
              IPIP Industriousness (Grit) ✅, IPIP Hardiness (Resilience), Riverside (Life Satisfaction)
            </p>
          </div>

          <div className="bg-brutal-gray-100 p-4 border-brutal border-brutal-black">
            <h3 className="font-display text-lg mb-2">❌ Tier C (不採用)</h3>
            <p className="text-sm mb-2">
              <strong>基準:</strong> 再テスト信頼性 r &lt; 0.60, または学術的根拠が不十分
            </p>
            <p className="text-sm font-mono">
              MBTI/16Personalities (r ≈ 0.50), 動物診断, 血液型診断
            </p>
          </div>
        </div>
      </Card>

      {/* License Summary */}
      <Card variant="white" padding="lg">
        <h2 className="font-display text-3xl mb-4">ライセンス一覧</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3 p-3 bg-brutal-gray-50 card-brutal">
            <span className="font-bold min-w-[180px]">IPIP-NEO:</span>
            <span>✅ Public Domain（商用利用制限なし）</span>
          </div>
          <div className="flex items-start gap-3 p-3 bg-brutal-gray-50 card-brutal">
            <span className="font-bold min-w-[180px]">Rosenberg RSES:</span>
            <span>✅ Public Domain（クレジット表記推奨）</span>
          </div>
          <div className="flex items-start gap-3 p-3 bg-brutal-gray-50 card-brutal">
            <span className="font-bold min-w-[180px]">PHQ-9, GAD-7:</span>
            <span>✅ Pfizer提供（許可不要、無料使用可）</span>
          </div>
          <div className="flex items-start gap-3 p-3 bg-brutal-gray-50 card-brutal">
            <span className="font-bold min-w-[180px]">DASS-21:</span>
            <span>✅ Public Domain（UNSW、商用利用可）</span>
          </div>
          <div className="flex items-start gap-3 p-3 bg-brutal-gray-50 card-brutal">
            <span className="font-bold min-w-[180px]">MAAS:</span>
            <span>✅ Public Domain（許可不要）</span>
          </div>
          <div className="flex items-start gap-3 p-3 bg-brutal-gray-50 card-brutal">
            <span className="font-bold min-w-[180px]">Riverside:</span>
            <span>✅ Open Access（著者が無料使用を明言）</span>
          </div>
          <div className="flex items-start gap-3 p-3 bg-brutal-gray-50 card-brutal">
            <span className="font-bold min-w-[180px]">O*NET RIASEC:</span>
            <span>✅ CC-BY 4.0（米国労働省、商用可）</span>
          </div>
        </div>
        <p className="text-xs text-brutal-gray-600 mt-6 leading-relaxed">
          各尺度の使用にあたっては、原著論文および関連するライセンス条項を遵守しています。
          当サイトは透明性を重視し、全てのライセンス情報と代替尺度の学術的根拠を明示します。
        </p>
      </Card>
    </main>
  );
}
