import { Card } from "@/components/ui/Card";

export default function ContactPage() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="font-display text-4xl md:text-5xl mb-8 brutal-shadow">
        お問い合わせ
      </h1>

      <Card className="mb-8">
        <h2 className="font-display text-2xl mb-4">運営者情報</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="font-bold min-w-[120px]">サイト名:</span>
            <span>心理測定ラボ</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="font-bold min-w-[120px]">URL:</span>
            <a
              href="https://psychtest.jp"
              className="underline hover:text-brutal-black"
            >
              https://psychtest.jp
            </a>
          </div>
          <div className="flex items-start gap-3">
            <span className="font-bold min-w-[120px]">運営開始:</span>
            <span>2026年1月</span>
          </div>
        </div>
      </Card>

      <Card className="mb-8">
        <h2 className="font-display text-2xl mb-4">お問い合わせ方法</h2>
        <p className="leading-relaxed mb-6">
          当サイトに関するご質問、ご意見、ご要望は、
          以下のメールアドレスまでお送りください。
        </p>

        <div className="bg-brutal-gray-50 p-6 border-2 border-brutal-black">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">✉️</span>
            <div>
              <div className="font-bold mb-1">メールアドレス</div>
              <a
                href="mailto:contact@psychtest.jp"
                className="text-lg font-mono underline hover:text-brutal-black"
              >
                contact@psychtest.jp
              </a>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            ※ メールアドレスは変更される可能性があります。
            最新の連絡先は本ページでご確認ください。
          </p>
        </div>
      </Card>

      <Card className="mb-8">
        <h2 className="font-display text-2xl mb-4">お問い合わせの際のお願い</h2>
        <p className="leading-relaxed mb-4">
          より迅速かつ正確に対応するため、以下の情報を含めてお送りいただけると助かります：
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4 text-sm">
          <li>お名前（ニックネーム可）</li>
          <li>お問い合わせの種別（質問、不具合報告、ご要望など）</li>
          <li>お問い合わせ内容の詳細</li>
          <li>不具合報告の場合：使用しているブラウザとOS（例: Chrome 131, Windows 11）</li>
          <li>不具合報告の場合：再現手順（どのページで、どの操作をした時に問題が起きたか）</li>
        </ul>
      </Card>

      <Card className="mb-8">
        <h2 className="font-display text-2xl mb-4">対応時間</h2>
        <p className="leading-relaxed text-sm mb-4">
          お問い合わせへの返信は、通常2〜5営業日以内に行います。
          ただし、以下の場合は返信までにお時間をいただくことがあります：
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4 text-sm">
          <li>土日祝日、年末年始などの休業日</li>
          <li>内容の確認や調査に時間を要する場合</li>
          <li>お問い合わせが集中している場合</li>
        </ul>
        <p className="text-xs text-gray-600 mt-4">
          ※ 緊急性の高い不具合については、優先的に対応いたします。
        </p>
      </Card>

      <Card variant="yellow" className="mb-8">
        <h2 className="font-display text-2xl mb-4">⚠️ ご注意ください</h2>

        <h3 className="font-display text-lg mb-3 mt-6">医療相談には対応できません</h3>
        <p className="leading-relaxed text-sm mb-4">
          当サイトは心理テストを提供するサービスであり、
          医療機関や相談機関ではありません。
          以下のお問い合わせには対応できませんので、ご了承ください：
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4 text-sm mb-4">
          <li>心理的症状に関する医療相談</li>
          <li>診断結果に基づく治療や対処法のアドバイス</li>
          <li>精神疾患の診断や判定</li>
        </ul>

        <div className="bg-brutal-white p-4 border-2 border-brutal-black mt-4">
          <p className="font-bold text-brutal-black mb-2">深刻な症状がある場合は、以下にご相談ください：</p>
          <ul className="space-y-2 text-sm text-brutal-black">
            <li>
              <strong>精神科・心療内科:</strong> 医療機関での診察をお勧めします
            </li>
            <li>
              <strong>こころの健康相談統一ダイヤル:</strong>{" "}
              <a
                href="tel:0570-064-556"
                className="underline hover:text-brutal-black font-mono"
              >
                0570-064-556
              </a>
            </li>
            <li>
              <strong>いのちの電話:</strong>{" "}
              <a
                href="tel:0570-783-556"
                className="underline hover:text-brutal-black font-mono"
              >
                0570-783-556
              </a>
              （ナビダイヤル）
            </li>
            <li>
              <strong>よりそいホットライン:</strong>{" "}
              <a
                href="tel:0120-279-338"
                className="underline hover:text-brutal-black font-mono"
              >
                0120-279-338
              </a>
              （24時間無料）
            </li>
          </ul>
        </div>
      </Card>

      <Card>
        <h2 className="font-display text-2xl mb-4">お問い合わせ内容の取り扱い</h2>
        <p className="leading-relaxed text-sm mb-4">
          お問い合わせいただいた内容は、以下の目的でのみ使用します：
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4 text-sm">
          <li>お問い合わせへの回答</li>
          <li>サービスの改善</li>
          <li>不具合の修正</li>
        </ul>
        <p className="text-sm text-gray-600 mt-4">
          お問い合わせ内容は、
          <a href="/privacy" className="underline hover:text-brutal-black">
            プライバシーポリシー
          </a>
          に基づいて適切に管理します。
          第三者への開示や、他の目的での使用は行いません。
        </p>
      </Card>
    </main>
  );
}
