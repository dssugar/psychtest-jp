# OG画像 & SNSシェア実装ガイド

## 概要

このプロジェクトでは、診断結果をSNSでシェアする機能を**OG画像アプローチ**で実装しています。

### なぜOG画像アプローチなのか？

画像のみのシェア（html2canvas等）は視覚的にはインパクトがありますが、**サイトへのトラフィックを生みません**。

- ❌ 画像シェア：画像が表示されるが、リンクなし → トラフィックゼロ
- ✅ OG画像付きリンクシェア：OG画像がSNSに表示 + リンクあり → トラフィック獲得

マネタイゼーション（Google AdSense、アフィリエイト）には**トラフィックが不可欠**です。そのため、OG画像のみに絞り、画像シェア機能は実装していません。

### デザイン統一アーキテクチャ

**重要**: OG画像と結果ページのサマリーカードは**完全に同じビジュアル**です。

```
lib/og-design/constants.ts  ← 🎨 共通デザイン定数
  ├── OG_SIZE (1200×630px)
  ├── OG_COLORS (カラーパレット)
  ├── OG_LAYOUT (レイアウト定数)
  ├── OG_TYPOGRAPHY (タイポグラフィ)
  └── DIMENSION_NAMES (次元名)
      ↓
  ┌───────────────────┬───────────────────┐
  ↓                   ↓                   ↓
components/results/   functions/og/       app/results/
ResultSummaryCard     [test].tsx          bigfive/page.tsx
(Reactコンポーネント) (Satori/OG画像)     (結果ページ)
```

**メリット**:
- デザイン変更が一箇所で完結（constants.tsのみ）
- OG画像と結果ページの一貫性保証
- TypeScriptの型安全性

## アーキテクチャ

### リンクでシェア（OG画像）

```
【結果ページ】(SSG - app/results/bigfive/page.tsx)
  ↓
┌─────────────────────────────────────────────┐
│ ResultSummaryCard (1200×630px)              │
│  - OG画像と完全に同じビジュアル             │
│  - 共通定数（constants.ts）を使用           │
└─────────────────────────────────────────────┘
  ↓
<SocialShareButtons> コンポーネント
  ↓
/share/bigfive?e=75&... のURLを生成
  ↓
SNSシェアダイアログ (Twitter/Facebook/LINE)
  ↓
SNSクローラーがシェアページにアクセス
  ↓
/share/bigfive (Cloudflare Pages Function)
  → OG画像メタデータを含むHTMLを返す
  ↓
/og/bigfive?e=75&... (Cloudflare Pages Function)
  → Satoriで動的にOG画像生成 (1200x630px PNG)
  → 共通定数（constants.ts）を使用
```

## 実装詳細

### 0. 共通デザイン定数（Design System）

**ファイル**: `lib/og-design/constants.ts`, `lib/og-design/types.ts`

OG画像とResultSummaryCardで共有するデザイン定数と型定義です。

**constants.ts**:
- `OG_SIZE`: 画像サイズ（1200×630px）
- `OG_COLORS`: カラーパレット（Neo-Brutalist）
- `OG_LAYOUT`: レイアウト定数（padding, width等）
- `OG_TYPOGRAPHY`: タイポグラフィ（fontSize, fontWeight等）
- `DIMENSION_NAMES`: Big Five次元名（日本語）
- `DIMENSION_ORDER`: 表示順序

**types.ts**:
- `DimensionKey`: 次元キーの型
- `DimensionData`: 次元データの型
- `ResultSummaryProps`: サマリーカードのProps型

### 1. ResultSummaryCard コンポーネント

**ファイル**: `components/results/ResultSummaryCard.tsx`

結果ページの最初に表示される1200×630pxのサマリーカードです。OG画像と**完全に同じビジュアル**を表示します。

**主な機能**:
- OG画像と同じデザイン定数を使用
- 1200×630pxのアスペクト比を維持（レスポンシブ）
- Big Five 5次元のスコアバーを表示

**使い方**:
```tsx
import { ResultSummaryCard } from "@/components/results/ResultSummaryCard";
import { OG_COLORS, DIMENSION_NAMES, DIMENSION_ORDER } from "@/lib/og-design/constants";

const dimensionsForSummary: DimensionData[] = DIMENSION_ORDER.map((key) => ({
  key,
  label: DIMENSION_NAMES[key],
  score: bigFiveResult[key],
  percentage: toPercentage(bigFiveResult[key]),
  color: OG_COLORS.dimensions[key],
}));

<ResultSummaryCard
  dimensions={dimensionsForSummary}
  testName="Big Five 性格診断結果"
  siteName="心理測定ラボ"
/>
```

### 2. SocialShareButtons コンポーネント

**ファイル**: `components/share/SocialShareButtons.tsx`

Twitter/Facebook/LINEのシェアダイアログを開くボタンコンポーネントです。

**主な機能**:
- シェアページURLを生成
- 各SNSのシェアURLスキームで新規ウィンドウを開く
- OG画像はSNSクローラーが自動取得

**使い方**:
```tsx
<SocialShareButtons
  shareUrl={`https://psychtest.jp/share/bigfive?e=${e}&a=${a}&c=${c}&n=${n}&o=${o}`}
  text="Big Five性格診断の結果をシェア！"
/>
```

### 3. Cloudflare Pages Function (OG画像生成エンドポイント)

**ファイル**: `functions/og/[test].tsx`

- `@cloudflare/pages-plugin-vercel-og`を使用
- Satoriライブラリで React/JSXを画像に変換
- **共通定数（constants.ts）を使用**してResultSummaryCardと完全に同じビジュアルを生成
- テストごとに異なるビジュアルを生成可能

**エンドポイント例**:
```
/og/bigfive?e=75&a=85&c=60&n=45&o=90
```

**パラメータ** (Big Five):
- `e`: 外向性スコア (24-120)
- `a`: 協調性スコア (24-120)
- `c`: 誠実性スコア (24-120)
- `n`: 神経症傾向スコア (24-120)
- `o`: 開放性スコア (24-120)

### 4. シェア専用ページ (メタデータ生成)

**ファイル**: `functions/share/bigfive.tsx` (Cloudflare Pages Function)

**重要**: Next.js `output: 'export'` モードでは動的な`searchParams`が使えないため、Cloudflare Pages Functionとして実装しています。

- URLパラメータからスコアを読み取り、OG画像URLを動的生成
- SNSクローラー用のメタデータを設定したHTMLを返す
- 実際のユーザーには結果のプレビューを表示

**URL例**:
```
https://psychtest.jp/share/bigfive?e=75&a=85&c=60&n=45&o=90
```

### 5. 型定義

**ファイル**: `functions/types.d.ts`

- Cloudflare Pages Functions用の型定義
- `PagesFunction`型とEventContext型
- `@cloudflare/workers-types`を参照

## 使い方

### シェアURLの生成

結果ページでシェアボタンをクリックした際に、以下のようなURLを生成します:

```typescript
// 例: Big Five結果ページ内
const shareUrl = new URL(`${window.location.origin}/share/bigfive`);
shareUrl.searchParams.set('e', bigFiveResult.extraversion.toString());
shareUrl.searchParams.set('a', bigFiveResult.agreeableness.toString());
shareUrl.searchParams.set('c', bigFiveResult.conscientiousness.toString());
shareUrl.searchParams.set('n', bigFiveResult.neuroticism.toString());
shareUrl.searchParams.set('o', bigFiveResult.openness.toString());

// Twitter/X
const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl.toString())}&text=${encodeURIComponent('Big Five性格診断の結果！')}`;

// Facebook
const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl.toString())}`;
```

## ローカルテスト

### 1. シェアページのテスト (Next.js開発サーバー)

```bash
npm run dev
```

以下のURLにアクセス:
```
http://localhost:3000/share/bigfive?e=75&a=85&c=60&n=45&o=90
```

- ページが表示されることを確認
- ページソースを表示して`<meta property="og:image">`タグが正しく設定されているか確認

### 2. OG画像生成のテスト (Cloudflare Pages Functions)

**重要**: Cloudflare Pages Functionsはローカル開発サーバーでは動作しません。

テスト方法の選択肢:

#### A. Cloudflare Pagesにデプロイしてテスト (推奨)

```bash
# ビルド
npm run build

# Cloudflare Pagesにデプロイ (Cloudflare CLIまたはダッシュボード経由)
npx wrangler pages deploy out/
```

デプロイ後、以下のURLで画像が表示されることを確認:
```
https://your-project.pages.dev/og/bigfive?e=75&a=85&c=60&n=45&o=90
```

#### B. Wranglerでローカル開発環境をセットアップ

```bash
# Wranglerをインストール
npm install -D wrangler

# ローカルでPages Functionsを実行
npx wrangler pages dev out/ --compatibility-flag=nodejs_compat
```

**注意**: 静的ファイル(`out/`)が必要なので、先に`npm run build`を実行してください。

### 3. SNSシェアのテスト

#### Facebookデバッガー
https://developers.facebook.com/tools/debug/

シェアURLを入力して、OG画像が正しく表示されるか確認

#### Twitterカードバリデーター
https://cards-dev.twitter.com/validator

シェアURLを入力して、Twitter Cardが正しく表示されるか確認

## デプロイ手順

### Cloudflare Pagesへのデプロイ

1. **プロジェクトをビルド**
   ```bash
   npm run build
   ```

2. **Cloudflare Pagesにプロジェクトをデプロイ**

   #### 方法A: Cloudflare Dashboard (推奨)

   1. [Cloudflare Dashboard](https://dash.cloudflare.com/)にログイン
   2. "Pages" → "Create a project" → "Connect to Git"
   3. GitHubリポジトリを接続
   4. ビルド設定:
      - **Build command**: `npm run build`
      - **Build output directory**: `out`
      - **Root directory**: `/`
   5. **Environment variables**: 必要に応じて設定
   6. "Save and Deploy"

   #### 方法B: Wrangler CLI

   ```bash
   # 初回のみ: Cloudflareにログイン
   npx wrangler login

   # デプロイ
   npx wrangler pages deploy out/ --project-name=psychtest-jp
   ```

3. **デプロイ後の確認**

   - シェアページにアクセス: `https://psychtest.jp/share/bigfive?e=75&...`
   - OG画像エンドポイントにアクセス: `https://psychtest.jp/og/bigfive?e=75&...`
   - Facebook/Twitterのデバッガーでテスト

## トラブルシューティング

### Q: OG画像が表示されない

**A**: 以下を確認してください:
1. Cloudflare Pagesに`functions/`ディレクトリがデプロイされているか
2. ブラウザで直接`/og/bigfive?e=75&...`にアクセスして画像が表示されるか
3. SNSキャッシュをクリアする（FacebookデバッガーやTwitterバリデーターで"Scrape again"）

### Q: TypeError: Cannot read property 'searchParams' of undefined

**A**: Cloudflare Pages Functionsの`context.request`が正しく渡されているか確認してください。

### Q: 日本語フォントが表示されない

**A**: Satoriは一部のフォントをサポートしていません。現在はシステムフォント（sans-serif）を使用していますが、カスタムフォントを読み込む必要がある場合は、次のように実装します:

```typescript
// functions/og/[test].tsx
import { ImageResponse } from '@cloudflare/pages-plugin-vercel-og/api';

export const onRequest: PagesFunction = async (context) => {
  // フォントデータをfetch
  const fontData = await fetch('https://fonts.googleapis.com/...').then(res => res.arrayBuffer());

  return new ImageResponse(
    <div>...</div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Noto Sans JP',
          data: fontData,
          weight: 900,
        },
      ],
    }
  );
};
```

### Q: ローカルでFunctionsが動かない

**A**: Next.js開発サーバー (`npm run dev`) ではCloudflare Pages Functionsは動作しません。`wrangler pages dev`を使用するか、Cloudflare Pagesにデプロイしてテストしてください。

## 今後の拡張

### 他のテストへの対応

現在はBig Fiveのみ実装されていますが、他のテストも同様のパターンで実装できます:

1. `functions/og/[test].tsx`に新しいレンダリング関数を追加
   ```typescript
   if (test === 'industriousness') {
     return renderIndustriousnessOG(url);
   }
   ```

2. `app/share/[テスト名]/page.tsx`を作成

3. 結果ページにシェアボタンを追加

### デザインのカスタマイズ

`functions/og/[test].tsx`のJSX部分を編集することで、デザインを自由にカスタマイズできます。

**ガイドライン**:
- サイズ: 1200×630px
- ファイルサイズ: 100KB以下推奨
- 重要な情報は中央に配置（SNSプラットフォームによるクロップ対策）
- Neo-Brutalistスタイルを維持

## 参考資料

- [Cloudflare Pages Functions](https://developers.cloudflare.com/pages/functions/)
- [Generate Dynamic OG Images (Cloudflare公式チュートリアル)](https://developers.cloudflare.com/workers/tutorials/generate-dynamic-og-images-using-workers/)
- [Vercel OG Plugin for Cloudflare](https://developers.cloudflare.com/pages/functions/plugins/vercel-og/)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
