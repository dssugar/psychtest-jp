# スペクトル診断 (psychtest.jp)

学術的に裏付けのある心理テストサイト

## プロジェクト概要

学術論文で検証された信頼性の高い心理尺度を使用し、全ての波長で心を解析する科学的な診断サイトです。
Trait-State-Outcome-Skill フレームワークに基づき、性格特性・自己認識・メンタルヘルス・主観的幸福感を多面的に測定します。

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
│   ├── dashboard/         # 統合ダッシュボード
│   ├── bigfive/           # Big Five 性格診断
│   ├── industriousness/   # 勤勉性 / やり抜く力 (Grit)
│   ├── rosenberg/         # Rosenberg 自尊心尺度
│   ├── phq9/              # PHQ-9 うつ病スクリーニング
│   ├── k6/                # K6 心理的苦痛スクリーニング
│   ├── swls/              # SWLS 人生満足度尺度
│   ├── selfconcept/       # 自己概念の明確さ尺度
│   ├── results/           # 各テストの結果ページ
│   ├── about/             # サイト概要
│   ├── privacy/           # プライバシーポリシー
│   ├── terms/             # 利用規約
│   └── contact/           # お問い合わせ
├── components/            # 再利用可能コンポーネント
│   ├── bigfive/          # Big Five専用コンポーネント
│   ├── dashboard/        # ダッシュボード用コンポーネント
│   ├── layout/           # レイアウトコンポーネント
│   └── viz/              # データビジュアライゼーション
├── lib/
│   ├── storage.ts        # localStorage 抽象化
│   ├── scoring/          # スコアリングロジック
│   │   ├── bigfive.ts
│   │   ├── industriousness.ts
│   │   ├── rosenberg.ts
│   │   ├── phq9.ts
│   │   ├── k6.ts
│   │   ├── swls.ts
│   │   └── selfconcept.ts
│   ├── analysis/         # 統合分析ロジック
│   └── tests/            # テスト設定・レジストリ
├── data/                  # 質問データ
│   ├── bigfive-questions.ts
│   ├── industriousness-questions.ts
│   ├── phq9-questions.ts
│   ├── k6-questions.ts
│   ├── swls-questions.ts
│   └── selfconcept-questions.ts
├── docs/                  # ドキュメント
│   ├── scales/           # 心理尺度の研究・ドキュメント
│   └── translation-workflow.md
└── public/               # 静的ファイル
```

## 実装済み機能

### 診断テスト
- [x] **Big Five (IPIP-NEO-120)** - 性格特性5次元・30ファセット（120問）
- [x] **Industriousness / Grit (IPIP-300 C4+C5)** - 勤勉性・やり抜く力（20問）
- [x] **Rosenberg Self-Esteem Scale** - 自尊心（10問）
- [x] **PHQ-9** - うつ病スクリーニング（9問）
- [x] **K6** - 心理的苦痛スクリーニング（6問）
- [x] **SWLS** - 人生満足度尺度（5問）
- [x] **Self-Concept Clarity Scale** - 自己概念の明確さ（12問）

**総問題数**: 182問

### システム機能
- [x] 統合ダッシュボード（複数テスト結果の統合表示）
- [x] Trait-State-Outcome-Skill フレームワークに基づく心理層分析
- [x] 因果フロー図・層構造マトリクスによる可視化
- [x] Big Five ファセット別レーダーチャート
- [x] localStorage での結果永続化
- [x] 学術的信頼性メタデータの表示
- [x] レスポンシブデザイン（モバイル対応）
- [x] ネオブルータリスト × データビジュアライゼーション デザインシステム
- [x] E2Eテスト (Playwright)

## 今後の拡張

### Phase 2: 診断拡充（進行中）
- [ ] GAD-7 (不安障害スクリーニング 7問)
- [ ] PSS (ストレス認知尺度 10問)
- [ ] ECR-R 短縮版 (愛着スタイル 12問)
- [ ] RIASEC (職業興味検査)
- [ ] MAAS (マインドフルネス尺度)

### Phase 3: AI機能
- [ ] BYOK (Bring Your Own Key) AIチャット
- [ ] 診断結果に基づくパーソナライズされた対話
- [ ] 複数エージェント（カウンセラー・キャリアコーチ等）
- [ ] LLMベースのおすすめ診断機能

### Phase 4: バックエンド
- [ ] Supabase 連携
- [ ] OAuth ログイン (Google/LINE)
- [ ] クラウド同期・履歴管理

### Phase 5: 収益化
- [ ] Google AdSense 統合
- [ ] 書籍アフィリエイト
- [ ] 有料版（app.psychtest.jp）- AI機能サブスクリプション

## ライセンス・学術的根拠

使用している心理尺度：
- **Big Five (IPIP-NEO)**: Public Domain（Goldberg, 1992）
- **Industriousness / Grit (IPIP-300 C4+C5)**: Public Domain（DeYoung et al., 2007）- Grit Scale代替、α = 0.82
- **Rosenberg Self-Esteem Scale**: Rosenberg (1965) - 50,000+引用
- **PHQ-9**: Kroenke et al. (2001) - 無料利用可（Pfizer提供）
- **K6**: Kessler et al. (2002) - 著作権フリー（非商用利用、帰属表示必要）
- **SWLS**: Diener et al. (1985) - Ed Diener博士の許可により利用可
- **Self-Concept Clarity Scale**: Campbell et al. (1996) - 教育・研究目的

本実装は教育・研究目的で使用されています。

### 免責事項

**⚠️ この診断は医療診断ではありません**

このテストはスクリーニング目的の心理尺度です。深刻な症状がある場合は、必ず医療専門家にご相談ください。

**相談窓口**:
- こころの健康相談統一ダイヤル: 0570-064-556
- いのちの電話: 0570-783-556
