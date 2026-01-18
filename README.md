# スペクトル診断 (psychtest.jp)

学術的に裏付けのある心理テストサイト

## プロジェクト概要

Self-Concept Clarity Scale (SCCS) を実装した心理テストサイト。
学術論文で検証された信頼性の高い尺度を使用し、全ての波長で心を解析する科学的な診断を提供します。

### 技術スタック

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Hosting**: Cloudflare Pages (静的エクスポート)
- **Data Storage**: localStorage

## 開発

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev

# 型チェック
npm run type-check

# 本番ビルド
npm run build

# ビルド後のプレビュー（ローカル）
npx serve out
```

開発サーバーは http://localhost:3000 で起動します。

## テスト

### E2Eテスト (Playwright)

```bash
# E2Eテスト実行
npm run test:e2e

# UIモードで実行（デバッグ用）
npm run test:e2e:ui

# ブラウザを表示して実行
npm run test:e2e:headed

# 基本テストのみ（推奨）
npx playwright test e2e/basic.spec.ts
```

詳細は [E2E_TESTING.md](./E2E_TESTING.md) を参照。

## ビルド

静的サイトとしてエクスポートされ、`out/` ディレクトリに生成されます。

```bash
npm run build
# → out/ ディレクトリに静的ファイルが生成される
```

## デプロイ (Cloudflare Pages)

### 初回セットアップ

1. GitHub にリポジトリを作成してプッシュ
2. Cloudflare Pages にログイン
3. 「Create a project」→ GitHub 連携
4. ビルド設定:
   - **Framework preset**: Next.js
   - **Build command**: `npm run build`
   - **Build output directory**: `out`

### 自動デプロイ

`main` ブランチへの push で自動的にデプロイされます。

## プロジェクト構造

```
psychtest-jp/
├── app/                    # Next.js App Router
│   ├── page.tsx           # トップページ
│   ├── sccs/              # SCCS 診断
│   │   ├── page.tsx       # 診断説明
│   │   └── test/
│   │       └── page.tsx   # 診断テスト (Client Component)
│   └── results/
│       └── sccs/
│           └── page.tsx   # 結果表示 (Client Component)
├── components/             # 再利用可能コンポーネント
├── lib/
│   ├── storage.ts         # localStorage 抽象化
│   └── scoring/
│       └── sccs.ts        # SCCS スコアリングロジック
├── data/
│   └── sccs-questions.ts  # SCCS 質問データ
└── public/                # 静的ファイル
```

## 実装済み機能

- [x] Self-Concept Clarity Scale (SCCS) 12問
- [x] 質問形式のインタラクティブUI
- [x] スコア計算とレベル判定
- [x] 結果の詳細表示（ビジュアライゼーション）
- [x] localStorage での結果保存
- [x] 学術的信頼性の明示
- [x] レスポンシブデザイン
- [x] ネオブルータリスト × データビジュアライゼーション デザインシステム
- [x] E2Eテスト (Playwright)

## 今後の拡張

### Phase 2: 追加診断
- Rosenberg Self-Esteem Scale (10問)
- Big Five 短縮版 (20-25問)
- ECR-R 短縮版 (12問)

### Phase 3: バックエンド
- Supabase 連携
- OAuth ログイン (Google/LINE)
- クラウド同期

### Phase 4: AI Agent Squad
- 別ドメイン (app.psychtest.jp)
- Claude API 統合
- サブスクリプション

## ライセンス

SCCS は Campbell et al. (1996) によって開発された心理尺度です。
本実装は教育・研究目的で使用されています。

**重要**: この診断は医療診断ではありません。スクリーニング目的の心理尺度です。
