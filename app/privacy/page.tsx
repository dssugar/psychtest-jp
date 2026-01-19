import { Card } from "@/components/ui/Card";

export default function PrivacyPage() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="font-display text-4xl md:text-5xl mb-4 brutal-shadow">
        プライバシーポリシー
      </h1>
      <p className="text-sm text-gray-600 mb-8">最終更新日: 2026年1月18日</p>

      <Card className="mb-8">
        <h2 className="font-display text-2xl mb-4">1. はじめに</h2>
        <p className="leading-relaxed mb-4">
          心理測定ラボ（以下「当サイト」）は、ユーザーのプライバシーを尊重し、
          個人情報の保護に努めます。本プライバシーポリシーは、当サイトが収集、
          使用、保存する情報について説明します。
        </p>
      </Card>

      <Card className="mb-8">
        <h2 className="font-display text-2xl mb-4">2. 収集する情報</h2>

        <h3 className="font-display text-lg mb-3 mt-6">2.1 診断結果データ</h3>
        <p className="leading-relaxed mb-4">
          当サイトで実施した心理テストの回答と結果は、
          <strong>お使いのブラウザのlocalStorageに保存</strong>されます。
        </p>
        <ul className="list-disc list-inside space-y-2 text-sm mb-4 ml-4">
          <li>これらのデータは<strong>あなたのデバイス内のみ</strong>に保存されます</li>
          <li>当サイトのサーバーには一切送信されません</li>
          <li>他のユーザーや第三者がアクセスすることはできません</li>
          <li>ブラウザのデータを削除すると、診断結果も削除されます</li>
        </ul>

        <h3 className="font-display text-lg mb-3 mt-6">2.2 アクセスログ</h3>
        <p className="leading-relaxed mb-4">
          当サイトは、Cloudflare Pagesでホスティングされています。
          Cloudflareは、サイトの運営・セキュリティ目的で以下の情報を収集する場合があります：
        </p>
        <ul className="list-disc list-inside space-y-2 text-sm mb-4 ml-4">
          <li>IPアドレス</li>
          <li>アクセス日時</li>
          <li>閲覧ページ</li>
          <li>ブラウザの種類</li>
          <li>リファラー情報</li>
        </ul>
        <p className="text-sm text-gray-600">
          詳細は
          <a
            href="https://www.cloudflare.com/privacypolicy/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-brutal-black"
          >
            Cloudflareのプライバシーポリシー
          </a>
          をご確認ください。
        </p>
      </Card>

      <Card className="mb-8">
        <h2 className="font-display text-2xl mb-4">3. Cookieの使用</h2>

        <h3 className="font-display text-lg mb-3 mt-6">3.1 第一者Cookie</h3>
        <p className="leading-relaxed mb-4">
          当サイトは、サイトの機能提供のために最小限のCookieを使用する場合があります。
          これらのCookieは、サイトの動作に必要な技術的情報のみを含みます。
        </p>

        <h3 className="font-display text-lg mb-3 mt-6">3.2 第三者Cookie（広告）</h3>
        <p className="leading-relaxed mb-4">
          当サイトは、Google AdSenseを使用して広告を配信しています。
          Google AdSenseは、Cookieを使用してユーザーの興味に基づいた広告を表示します。
        </p>
        <ul className="list-disc list-inside space-y-2 text-sm mb-4 ml-4">
          <li>Googleは、Cookieを使用してユーザーの当サイトや他のサイトへのアクセス情報に基づいて広告を配信します</li>
          <li>
            ユーザーは、
            <a
              href="https://www.google.com/settings/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-brutal-black"
            >
              広告設定ページ
            </a>
            でパーソナライズ広告を無効にできます
          </li>
          <li>
            詳細は
            <a
              href="https://policies.google.com/technologies/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-brutal-black"
            >
              Googleの広告ポリシー
            </a>
            をご確認ください
          </li>
        </ul>

        <h3 className="font-display text-lg mb-3 mt-6">3.3 Cookieの無効化</h3>
        <p className="leading-relaxed text-sm">
          ブラウザの設定により、Cookieの受け入れを拒否することができます。
          ただし、Cookieを無効にすると、サイトの一部機能が正常に動作しない場合があります。
        </p>
      </Card>

      <Card className="mb-8">
        <h2 className="font-display text-2xl mb-4">4. 情報の利用目的</h2>
        <p className="leading-relaxed mb-4">
          収集した情報は、以下の目的でのみ使用します：
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>サイトの運営・改善</li>
          <li>ユーザー体験の向上</li>
          <li>セキュリティの確保</li>
          <li>関連する広告の配信（Google AdSense経由）</li>
        </ul>
      </Card>

      <Card className="mb-8">
        <h2 className="font-display text-2xl mb-4">5. 第三者への情報提供</h2>
        <p className="leading-relaxed mb-4">
          当サイトは、以下の場合を除き、ユーザーの情報を第三者に提供しません：
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
          <li>ユーザーの同意がある場合</li>
          <li>法令に基づく場合</li>
          <li>サービス提供に必要な範囲で、業務委託先に提供する場合（広告配信など）</li>
        </ul>
        <p className="text-sm text-gray-600">
          第三者サービス（Google AdSense、Cloudflareなど）は、
          それぞれのプライバシーポリシーに従って情報を取り扱います。
        </p>
      </Card>

      <Card className="mb-8">
        <h2 className="font-display text-2xl mb-4">6. データの保存期間</h2>
        <p className="leading-relaxed mb-4">
          診断結果データは、ユーザーがブラウザのlocalStorageから削除するまで保持されます。
          ユーザーはいつでも、ブラウザの設定から診断データを削除できます。
        </p>
      </Card>

      <Card className="mb-8">
        <h2 className="font-display text-2xl mb-4">7. ユーザーの権利</h2>
        <p className="leading-relaxed mb-4">
          ユーザーは、以下の権利を有します：
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>診断データの確認（ブラウザのlocalStorageを通じて）</li>
          <li>診断データの削除（ブラウザの設定から）</li>
          <li>パーソナライズ広告のオプトアウト（Googleの広告設定から）</li>
        </ul>
      </Card>

      <Card className="mb-8">
        <h2 className="font-display text-2xl mb-4">8. セキュリティ</h2>
        <p className="leading-relaxed">
          当サイトは、HTTPS通信を使用し、データの安全性を確保しています。
          ただし、インターネット通信には完全な安全性はないことをご理解ください。
        </p>
      </Card>

      <Card className="mb-8">
        <h2 className="font-display text-2xl mb-4">9. 子どものプライバシー</h2>
        <p className="leading-relaxed">
          当サイトは、13歳未満の子どもから意図的に個人情報を収集しません。
          保護者の方は、お子様のインターネット利用を監督してください。
        </p>
      </Card>

      <Card className="mb-8">
        <h2 className="font-display text-2xl mb-4">10. プライバシーポリシーの変更</h2>
        <p className="leading-relaxed">
          当サイトは、必要に応じて本プライバシーポリシーを変更することがあります。
          変更後のポリシーは、本ページに掲載した時点で効力を生じます。
          重要な変更がある場合は、サイト上で通知します。
        </p>
      </Card>

      <Card className="mb-8">
        <h2 className="font-display text-2xl mb-4">11. お問い合わせ</h2>
        <p className="leading-relaxed mb-4">
          本プライバシーポリシーに関するご質問は、
          <a href="/contact" className="underline hover:text-brutal-black">
            お問い合わせページ
          </a>
          からご連絡ください。
        </p>
      </Card>

      <div className="mt-12 p-6 bg-brutal-gray-50 border-2 border-brutal-black">
        <p className="text-sm text-gray-700 leading-relaxed">
          <strong>要約：</strong>
          当サイトは、診断結果をあなたのブラウザ内（localStorage）にのみ保存し、
          サーバーには送信しません。Google AdSenseによる広告配信のため、
          Cookieが使用されます。詳細は上記をご確認ください。
        </p>
      </div>
    </main>
  );
}
