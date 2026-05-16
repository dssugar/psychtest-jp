import { Card } from "@/components/ui/Card";

export default function TermsPage() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="font-display text-4xl md:text-5xl mb-4 brutal-shadow">
        利用規約
      </h1>
      <p className="text-sm text-gray-600 mb-8">最終更新日: 2026年1月18日</p>

      <Card className="mb-8">
        <h2 className="font-display text-2xl mb-4">1. 規約への同意</h2>
        <p className="leading-relaxed">
          本ウェブサイト「心理測定ラボ」（以下「当サイト」）を利用することにより、
          ユーザーは本利用規約に同意したものとみなします。
          本規約に同意いただけない場合は、当サイトの利用をお控えください。
        </p>
      </Card>

      <Card className="mb-8">
        <h2 className="font-display text-2xl mb-4">2. サービスの内容</h2>
        <p className="leading-relaxed mb-4">
          当サイトは、学術的に検証された心理尺度を用いた心理テストを提供します。
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>各種心理テスト（Big Five、自尊心尺度、自己概念明確性尺度など）</li>
          <li>診断結果の表示と保存（ブラウザのlocalStorage使用）</li>
          <li>統合ダッシュボード機能</li>
          <li>学術的参考文献の提供</li>
        </ul>
      </Card>

      <Card variant="yellow" className="mb-8">
        <h2 className="font-display text-2xl mb-4 text-brutal-black">⚠️ 3. 免責事項（重要）</h2>

        <h3 className="font-display text-lg mb-3 mt-6 text-brutal-black">3.1 医療診断ではありません</h3>
        <Card variant="white" padding="md" className="mb-4">
          <p className="leading-relaxed mb-3">
            <strong className="text-lg">
              当サイトが提供する心理テストは、医療診断・臨床診断ではありません。
            </strong>
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm ml-4">
            <li>当サイトの診断結果は、スクリーニング（ふるい分け）目的の心理尺度です</li>
            <li>精神疾患の診断や治療の代替となるものではありません</li>
            <li><strong>深刻な心理的症状（抑うつ、不安、自傷念慮など）がある場合は、直ちに医療専門家（精神科医、心療内科医、臨床心理士など）にご相談ください</strong></li>
            <li><strong className="text-red-600">診断結果に基づく自己判断による治療の中止・変更は絶対にしないでください</strong></li>
            <li>緊急の場合は、救急医療機関または最寄りの精神科救急へご連絡ください</li>
          </ul>
        </Card>

        <h3 className="font-display text-lg mb-3 mt-6 text-brutal-black">3.2 結果の解釈</h3>
        <p className="leading-relaxed mb-3 text-sm text-brutal-black">
          診断結果は、あくまで自己理解の一助となる参考情報です。
          以下の点にご留意ください：
        </p>
        <ul className="list-disc list-inside space-y-2 text-sm ml-4 text-brutal-black">
          <li>心理テストの結果は、回答時の状態や文脈に影響されます</li>
          <li>単一の尺度だけで人格や心理状態を完全に説明することはできません</li>
          <li>結果の解釈には、専門的知識が必要な場合があります</li>
          <li>自己診断の限界を理解し、必要に応じて専門家に相談してください</li>
          <li>結果に不安を感じる場合は、心理カウンセラーや医療専門家にご相談ください</li>
        </ul>

        <h3 className="font-display text-lg mb-3 mt-6 text-brutal-black">3.3 損害の免責</h3>
        <p className="leading-relaxed text-sm text-brutal-black">
          当サイトの利用により生じたいかなる損害（直接的、間接的、結果的損害を含む）についても、
          当サイト運営者は一切の責任を負いません。
          診断結果の解釈や利用は、ユーザー自身の責任において行ってください。
        </p>
      </Card>

      <Card className="mb-8">
        <h2 className="font-display text-2xl mb-4">4. 禁止事項</h2>
        <p className="leading-relaxed mb-4">
          ユーザーは、当サイトの利用にあたり、以下の行為を行ってはなりません：
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4 text-sm">
          <li>法令または公序良俗に違反する行為</li>
          <li>犯罪行為に関連する行為</li>
          <li>当サイトのサーバーやネットワークに過度な負荷をかける行為</li>
          <li>当サイトの運営を妨害する行為</li>
          <li>他のユーザーに関する個人情報を収集する行為</li>
          <li>不正アクセス、クラッキング等の行為</li>
          <li>当サイトのコンテンツを無断で複製、改変、転載する行為</li>
          <li>診断結果を他者になりすまして使用する行為</li>
          <li>その他、当サイト運営者が不適切と判断する行為</li>
        </ul>
      </Card>

      <Card className="mb-8">
        <h2 className="font-display text-2xl mb-4">5. 知的財産権</h2>

        <h3 className="font-display text-lg mb-3 mt-6">5.1 心理尺度の著作権とライセンス</h3>

        <p className="leading-relaxed mb-4 text-sm">
          当サイトは、学術的信頼性と法的安全性を両立するため、<strong>パブリックドメインおよび商用利用が明示的に許可された心理尺度のみ</strong>を使用しています。
          すべての尺度は、国際的な学術誌で検証され、高い信頼性係数（Cronbach's α）と妥当性を持つものです。
        </p>

        <h4 className="font-semibold text-md mb-2 mt-6">【IPIP（国際パーソナリティ項目プール）について】</h4>
        <Card variant="white" padding="sm" className="mb-4 bg-gray-50">
          <p className="text-sm leading-relaxed mb-2">
            <strong>IPIP (International Personality Item Pool)</strong> は、Lewis Goldberg博士らによって設立された、
            3,000項目以上の性格測定項目を提供するパブリックドメインのリポジトリです。
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs ml-4 text-gray-700">
            <li>商用の有料尺度（NEO-PI-R等）と高い相関（r &gt; .70〜.90）を持つ代替尺度を提供</li>
            <li>著作権フリーで、許可不要、料金不要での複製・翻訳・商用利用が可能</li>
            <li>日本語版（IPIP-J）は国内の心理学者により翻訳・検証済み</li>
          </ul>
          <p className="text-xs text-gray-600 mt-2">
            公式サイト: <a href="https://ipip.ori.org/" target="_blank" rel="noopener noreferrer" className="underline">https://ipip.ori.org/</a>
          </p>
        </Card>

        <h4 className="font-semibold text-md mb-2 mt-6">【現在提供中のテスト（Tier S/A）】</h4>
        <p className="text-xs text-gray-600 mb-3">
          ※ Tier S = 最高水準の学術的信頼性、Tier A = 強力な学術的裏付け
        </p>

        <div className="space-y-3 mb-6">
          {/* Big Five */}
          <Card variant="white" padding="sm">
            <div className="flex items-start justify-between mb-2">
              <h5 className="font-semibold text-sm">IPIP-NEO Mini-IPIP-20 (Big Five性格特性)</h5>
              <span className="text-xs font-mono bg-green-100 text-green-800 px-2 py-0.5 rounded">Tier S</span>
            </div>
            <p className="text-xs text-gray-700 mb-2">
              <strong>測定内容:</strong> 性格の5大因子（外向性、協調性、誠実性、神経症傾向、開放性）<br />
              <strong>信頼性:</strong> Cronbach's α &gt; .80（5ドメイン）、α ≈ .70-.80（30ファセット）<br />
              <strong>ライセンス:</strong> <span className="text-green-700 font-semibold">パブリックドメイン（IPIP）</span> - 商用利用可<br />
              <strong>開発者:</strong> Goldberg et al. (2006), Oregon Research Institute
            </p>
          </Card>

          {/* Rosenberg */}
          <Card variant="white" padding="sm">
            <div className="flex items-start justify-between mb-2">
              <h5 className="font-semibold text-sm">Rosenberg Self-Esteem Scale (自尊心尺度)</h5>
              <span className="text-xs font-mono bg-green-100 text-green-800 px-2 py-0.5 rounded">Tier S</span>
            </div>
            <p className="text-xs text-gray-700 mb-2">
              <strong>測定内容:</strong> 全般的な自尊心（自己価値の感覚）<br />
              <strong>信頼性:</strong> Cronbach's α = .77-.88、再テスト信頼性 r = .82-.85<br />
              <strong>引用数:</strong> 50,000件以上<br />
              <strong>ライセンス:</strong> <span className="text-green-700 font-semibold">パブリックドメイン</span> - 商用利用可<br />
              <strong>開発者:</strong> Rosenberg (1965)
            </p>
          </Card>

          {/* Self-Concept Clarity */}
          <Card variant="white" padding="sm">
            <div className="flex items-start justify-between mb-2">
              <h5 className="font-semibold text-sm">IPIP Self-Consciousness Facet (自己概念の明確さ)</h5>
              <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Tier A</span>
            </div>
            <p className="text-xs text-gray-700 mb-2">
              <strong>測定内容:</strong> 自己理解の明瞭さ、自己イメージの一貫性<br />
              <strong>信頼性:</strong> Cronbach's α = .75-.82（平均 .79）<br />
              <strong>妥当性:</strong> 原著SCCS（Campbell et al., 1996）との構成概念妥当性 r &gt; .70<br />
              <strong>ライセンス:</strong> <span className="text-green-700 font-semibold">パブリックドメイン（IPIP）</span> - 商用利用可<br />
              <strong>備考:</strong> 商用利用が制限される原著SCCSの代替尺度として採用
            </p>
          </Card>
        </div>

        <h4 className="font-semibold text-md mb-2 mt-8">【今後実装予定のテスト】</h4>

        <div className="space-y-3 mb-6">
          {/* PHQ-9 */}
          <Card variant="white" padding="sm">
            <div className="flex items-start justify-between mb-2">
              <h5 className="font-semibold text-sm">PHQ-9 (Patient Health Questionnaire-9)</h5>
              <span className="text-xs font-mono bg-green-100 text-green-800 px-2 py-0.5 rounded">Tier S</span>
            </div>
            <p className="text-xs text-gray-700 mb-2">
              <strong>測定内容:</strong> うつ病スクリーニング（過去2週間の症状重症度）<br />
              <strong>信頼性:</strong> Cronbach's α = 0.86-0.89、感度88%・特異度88%<br />
              <strong>引用数:</strong> 11,000件以上<br />
              <strong>ライセンス:</strong> <span className="text-green-700 font-semibold">Pfizer社による明示的な商用利用許可</span><br />
              <strong>根拠:</strong> 公式マニュアルに "No permission required to reproduce, translate, display or distribute."（複製、翻訳、表示、配布に許可は不要）と明記<br />
              <strong>開発者:</strong> Spitzer, Williams, Kroenke et al. (Pfizer Inc.)
            </p>
          </Card>

          {/* GAD-7 */}
          <Card variant="white" padding="sm">
            <div className="flex items-start justify-between mb-2">
              <h5 className="font-semibold text-sm">GAD-7 (Generalized Anxiety Disorder-7)</h5>
              <span className="text-xs font-mono bg-green-100 text-green-800 px-2 py-0.5 rounded">Tier S</span>
            </div>
            <p className="text-xs text-gray-700 mb-2">
              <strong>測定内容:</strong> 全般性不安障害スクリーニング<br />
              <strong>信頼性:</strong> Cronbach's α = 0.92、Beck不安尺度との相関 r = .72<br />
              <strong>ライセンス:</strong> <span className="text-green-700 font-semibold">Pfizer社による明示的な商用利用許可</span><br />
              <strong>根拠:</strong> PHQ-9と同様、許可不要での使用が明言されている<br />
              <strong>開発者:</strong> Spitzer et al. (Pfizer Inc.)
            </p>
          </Card>

          {/* DASS-21 Stress */}
          <Card variant="white" padding="sm">
            <div className="flex items-start justify-between mb-2">
              <h5 className="font-semibold text-sm">DASS-21 Stress Subscale (ストレス尺度)</h5>
              <span className="text-xs font-mono bg-green-100 text-green-800 px-2 py-0.5 rounded">Tier S</span>
            </div>
            <p className="text-xs text-gray-700 mb-2">
              <strong>測定内容:</strong> 知覚されたストレス（緊張、動揺、過敏さ）<br />
              <strong>信頼性:</strong> Cronbach's α = .87-.94（ストレスサブスケール）<br />
              <strong>ライセンス:</strong> <span className="text-green-700 font-semibold">パブリックドメイン</span><br />
              <strong>根拠:</strong> 公式サイトに "The DASS questionnaire is public domain, and so permission is not needed to use it." と明記<br />
              <strong>開発者:</strong> Lovibond & Lovibond (UNSW)
            </p>
          </Card>

          {/* IPIP Attachment（ECR-Rの代替） */}
          <Card variant="white" padding="sm">
            <div className="flex items-start justify-between mb-2">
              <h5 className="font-semibold text-sm">IPIP Attachment Scales (愛着スタイル)</h5>
              <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Tier A</span>
            </div>
            <p className="text-xs text-gray-700 mb-2">
              <strong>測定内容:</strong> 愛着の2次元（不安・回避）と4スタイル（安定型、不安型、回避型、恐れ回避型）<br />
              <strong>信頼性:</strong> Cronbach's α &gt; .80（不安・回避の両サブスケール）<br />
              <strong>ライセンス:</strong> <span className="text-green-700 font-semibold">パブリックドメイン（IPIP）</span> - 商用利用可<br />
              <strong>備考:</strong> 原著ECR-R（Fraley et al., 2000）は商用利用がグレーゾーンのため、IPIP代替尺度を採用
            </p>
          </Card>
        </div>

        <Card variant="white" padding="md" className="bg-blue-50 border-blue-200">
          <h5 className="font-semibold text-sm mb-2">📚 学術的根拠の開示</h5>
          <p className="text-xs text-gray-700 leading-relaxed mb-2">
            当サイトは、心理尺度の選定において以下の基準を満たすものを採用しています：
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs ml-4 text-gray-700">
            <li><strong>学術的信頼性:</strong> Cronbach's α ≥ .70、再テスト信頼性の確認</li>
            <li><strong>構成概念妥当性:</strong> 国際的な学術誌での検証論文の存在</li>
            <li><strong>法的安全性:</strong> パブリックドメイン、または商用利用の明示的許諾</li>
            <li><strong>日本語版の検証:</strong> 文化的適応と心理測定学的特性の確認</li>
          </ul>
          <p className="text-xs text-gray-600 mt-3">
            各尺度の詳細な原著論文、信頼性係数、因子構造、規範データについては、
            <a href="/references" className="underline hover:text-brutal-black font-semibold">
              参考文献ページ
            </a>
            をご確認ください。
          </p>
        </Card>

        <h3 className="font-display text-lg mb-3 mt-8">5.2 当サイトのコンテンツ</h3>
        <p className="leading-relaxed text-sm mb-3">
          当サイトのデザイン、レイアウト、テキスト、画像、プログラムコードなどは、
          当サイト運営者が著作権を有します。
        </p>
        <ul className="list-disc list-inside space-y-1 ml-4 text-sm text-gray-700">
          <li>心理尺度の項目テキストは、各原著者の著作権に従います（上記5.1参照）</li>
          <li>サイトデザイン、UI/UXコンポーネント、解説文は当サイトオリジナルです</li>
          <li>無断での複製、転載、改変、商用利用は禁止します</li>
        </ul>

        <h3 className="font-display text-lg mb-3 mt-8">5.3 帰属表示（Attribution）</h3>
        <p className="leading-relaxed text-sm mb-3">
          当サイトは、使用する心理尺度について、以下の帰属表示を行います：
        </p>
        <ul className="list-disc list-inside space-y-1 ml-4 text-xs text-gray-700">
          <li><strong>IPIP尺度:</strong> "Items from the International Personality Item Pool (https://ipip.ori.org/)"</li>
          <li><strong>PHQ-9/GAD-7:</strong> "Developed by Drs. Robert L. Spitzer, Janet B.W. Williams, Kurt Kroenke and colleagues, with an educational grant from Pfizer Inc."</li>
          <li><strong>Rosenberg自尊心尺度:</strong> "Rosenberg Self-Esteem Scale (Rosenberg, 1965)"</li>
          <li><strong>DASS-21:</strong> "Depression Anxiety Stress Scales (Lovibond & Lovibond, 1995)"</li>
        </ul>
      </Card>

      <Card className="mb-8">
        <h2 className="font-display text-2xl mb-4">6. データの取り扱い</h2>

        <h3 className="font-display text-lg mb-3 mt-6">6.1 診断データの保存</h3>
        <p className="leading-relaxed mb-4 text-sm">
          当サイトは、診断結果をユーザーのブラウザのlocalStorageに保存します。
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4 text-sm">
          <li>データはユーザーのデバイス内のみに保存され、サーバーには送信されません</li>
          <li>ユーザーは、いつでもブラウザの設定からデータを削除できます</li>
          <li>ブラウザのデータ削除やCookie削除により、診断結果も失われます</li>
        </ul>

        <h3 className="font-display text-lg mb-3 mt-6">6.2 プライバシー</h3>
        <p className="leading-relaxed text-sm">
          個人情報の取り扱いについては、
          <a href="/privacy" className="underline hover:text-brutal-black">
            プライバシーポリシー
          </a>
          をご確認ください。
        </p>
      </Card>

      <Card className="mb-8">
        <h2 className="font-display text-2xl mb-4">7. サービスの変更・中断・終了</h2>
        <p className="leading-relaxed mb-4">
          当サイト運営者は、以下の権利を有します：
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4 text-sm">
          <li>事前の通知なく、サービスの内容を変更、追加、削除する権利</li>
          <li>メンテナンス等のため、サービスを一時的に中断する権利</li>
          <li>運営上の理由により、サービスを終了する権利</li>
        </ul>
        <p className="text-sm text-gray-600 mt-4">
          サービスの変更・中断・終了により生じた損害について、
          当サイト運営者は一切の責任を負いません。
        </p>
      </Card>

      <Card className="mb-8">
        <h2 className="font-display text-2xl mb-4">8. 広告の掲載</h2>
        <p className="leading-relaxed text-sm">
          当サイトは、Google AdSenseおよびその他の広告サービスを使用して広告を掲載しています。
          広告のクリックや広告主のサイトでの取引により生じた損害について、
          当サイト運営者は一切の責任を負いません。
        </p>
      </Card>

      <Card className="mb-8">
        <h2 className="font-display text-2xl mb-4">9. 外部リンク</h2>
        <p className="leading-relaxed text-sm">
          当サイトには、外部サイトへのリンクが含まれる場合があります。
          外部サイトの内容について、当サイト運営者は一切の責任を負いません。
          外部サイトの利用は、各サイトの利用規約に従ってください。
        </p>
      </Card>

      <Card className="mb-8">
        <h2 className="font-display text-2xl mb-4">10. 準拠法・管轄裁判所</h2>
        <p className="leading-relaxed text-sm">
          本規約の解釈・適用は日本国法に準拠します。
          当サイトに関する一切の紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
        </p>
      </Card>

      <Card className="mb-8">
        <h2 className="font-display text-2xl mb-4">11. 規約の変更</h2>
        <p className="leading-relaxed text-sm">
          当サイト運営者は、必要に応じて本利用規約を変更することがあります。
          変更後の規約は、本ページに掲載した時点で効力を生じます。
          重要な変更がある場合は、サイト上で通知します。
        </p>
      </Card>

      <Card className="mb-8">
        <h2 className="font-display text-2xl mb-4">12. お問い合わせ</h2>
        <p className="leading-relaxed text-sm">
          本利用規約に関するご質問は、
          <a href="/contact" className="underline hover:text-brutal-black">
            お問い合わせページ
          </a>
          からご連絡ください。
        </p>
      </Card>

      <Card variant="yellow" padding="md" className="mt-12">
        <p className="text-sm leading-relaxed text-brutal-black">
          <strong className="text-base">⚠️ 重要な要約：</strong><br />
          当サイトの診断は医療診断ではありません。
          深刻な心理的症状（抑うつ、不安、自傷念慮など）がある場合は、
          <strong>直ちに医療専門家（精神科医、心療内科医）にご相談ください。</strong>
          診断結果に基づく自己判断による治療の中止・変更は絶対にしないでください。
          診断結果の利用はユーザー自身の責任において行ってください。
        </p>
        <p className="text-xs text-brutal-gray-800 mt-3">
          緊急時の相談窓口: こころの健康相談統一ダイヤル <strong>0570-064-556</strong>（最寄りの相談窓口につながります）
        </p>
      </Card>
    </main>
  );
}
