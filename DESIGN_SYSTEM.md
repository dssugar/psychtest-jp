# Design System - 丸裸診断

ネオブルータリスト × データビジュアライゼーション

---

## 🎨 Design Philosophy

### コンセプト
「学術性とエンタメ性のメリハリ」「測れる診断」を視覚化する。

- **学術部分**: データの信頼性を視覚的に表現（太い枠、モノスペースフォント）
- **エンタメ部分**: 大胆な色使い、インパクトのある数値表示
- **SNSバエ**: シェアしたくなる視覚的な結果

---

## 🎨 Color System

### Monochrome Base
```css
--color-black: #000000         /* メインテキスト、ボーダー */
--color-white: #FFFFFF         /* 背景、反転テキスト */
--color-gray-50: #FAFAFA       /* 明るい背景 */
--color-gray-100: #F5F5F5      /* カード背景 */
--color-gray-200: #E5E5E5      /* ボーダー、区切り */
--color-gray-300: #D4D4D4      /* 非アクティブ */
--color-gray-800: #262626      /* セカンダリテキスト */
--color-gray-900: #171717      /* 濃いテキスト */
```

### Data Visualization Accents
各診断ジャンルごとに色を割り当てる。

```css
--color-viz-blue: #0066FF      /* 自己認識 (SCCS) */
--color-viz-pink: #FF3366      /* 性格特性 (Big Five) */
--color-viz-green: #00CC88     /* 対人スタイル (ECR-R) */
--color-viz-orange: #FF9900    /* メンタル (PHQ-9, GAD-7) */
--color-viz-yellow: #FFD700    /* 警告、免責 */
```

### 使い分けルール
- **学術データ**: モノクロ + 1アクセントカラー
- **診断結果**: データごとに異なるアクセントカラー
- **警告・免責**: Yellow

---

## 📐 Typography

### Font Stack
```css
--font-display: 'Archivo Black', sans-serif;   /* ヘッダー、タイトル */
--font-body: 'Inter', sans-serif;              /* 本文 */
--font-mono: 'JetBrains Mono', monospace;      /* 数値、データ */
```

### Typeface Usage
- **Display (Archivo Black)**:
  - 大見出し（H1, H2）
  - インパクトを与える箇所
  - 太字のみ、斜体なし

- **Body (Inter)**:
  - 本文、説明文
  - ラベル、キャプション
  - Weight: 400-900を使い分け

- **Mono (JetBrains Mono)**:
  - 数値（スコア、統計値）
  - データポイント
  - タイムスタンプ
  - `.data-number`クラスで適用

### Type Scale
```
9xl: 8rem (128px)   - Hero タイトル
7xl: 4.5rem (72px)  - ページタイトル
5xl: 3rem (48px)    - セクションタイトル
3xl: 1.875rem       - サブタイトル
xl: 1.25rem         - 本文大
base: 1rem          - 本文標準
sm: 0.875rem        - キャプション
xs: 0.75rem         - 補助テキスト
```

---

## 🔲 Components

### 1. Brutal Button (`btn-brutal`)
太いボーダー、オフセットシャドウのボタン。

```tsx
<button className="btn-brutal bg-brutal-black text-brutal-white px-8 py-4">
  クリック
</button>
```

**特徴**:
- 3pxのボーダー
- 8px/8pxのオフセットシャドウ
- ホバーで4px/4px（クリック感）
- アクティブで0px/0px（押下感）

### 2. Brutal Card (`card-brutal`)
太いボーダー、オフセットシャドウのカード。

```tsx
<div className="card-brutal p-8 bg-brutal-white">
  コンテンツ
</div>
```

### 3. Data Badge (`<DataBadge>`)
小さなラベル、カテゴリ表示。

```tsx
<DataBadge color="blue" size="md">SCCS</DataBadge>
```

**Props**:
- `color`: "blue" | "pink" | "green" | "orange" | "yellow" | "black"
- `size`: "sm" | "md" | "lg"

### 4. Score Circle (`<ScoreCircle>`)
円形のスコア表示（SVGアニメーション付き）。

```tsx
<ScoreCircle
  score={78}
  size="lg"
  color="blue"
  label="自己概念の明確さ"
/>
```

**Props**:
- `score`: 0-100
- `size`: "sm" | "md" | "lg"
- `color`: "blue" | "pink" | "green" | "orange"
- `label?`: string

### 5. Brutal Progress Bar (`<BrutalProgressBar>`)
角張ったプログレスバー。

```tsx
<BrutalProgressBar
  value={65}
  color="blue"
  label="全体スコア"
  height="lg"
/>
```

### 6. Stat Card (`<StatCard>`)
学術データを表示するカード。

```tsx
<StatCard
  icon="📊"
  label="信頼性係数"
  value="α = 0.86"
  description="高い内的一貫性"
  color="blue"
/>
```

---

## 🎬 Animations

### アニメーション方針
- ページロード時のスタッガードアニメーション
- 数値のカウントアップ（CSS transition）
- ホバー・クリックの即座なフィードバック

### 提供されているアニメーション
```css
animate-slide-in-up     /* 下から上にフェードイン */
animate-slide-in-left   /* 左から右にフェードイン */
animate-scale-in        /* スケールインフェードイン */
animate-number-pop      /* 数値のポップエフェクト */
```

### 遅延スタッガー
```tsx
<div className="animate-slide-in-up" style={{ animationDelay: "0.1s" }}>
  コンテンツ
</div>
```

---

## 🧱 Layout Principles

### グリッド
- 主要コンテナ: `max-w-6xl mx-auto`
- カラムグリッド: `grid grid-cols-1 md:grid-cols-2 gap-6`

### Spacing
- セクション間: `mb-16` (4rem)
- カード間: `gap-6` (1.5rem)
- 要素間: `mb-8` (2rem)

### 非対称レイアウト
- 意図的に左右非対称に配置
- データの重要度で大きさを変える
- オーバーラップは控えめに

---

## 📊 Data Visualization Guidelines

### 原則
1. **数値は常にモノスペースフォント** (`.data-number`)
2. **大きく表示** (最小でも2xl以上)
3. **色でカテゴリを区別**
4. **アニメーションで注目を集める**

### スコア表示のベストプラクティス
```tsx
// Good
<div className="text-6xl font-mono font-bold data-number">
  78
</div>

// Bad (プロポーショナルフォント)
<div className="text-6xl font-bold">
  78
</div>
```

---

## 🚨 Disclaimer & Warnings

免責事項は必ず **Yellow (viz-yellow)** を使用。

```tsx
<div className="card-brutal p-6 bg-viz-yellow border-brutal-black">
  <div className="flex items-start gap-4">
    <div className="text-3xl">⚠️</div>
    <div>
      <div className="font-bold text-brutal-black mb-1 uppercase tracking-wide">
        免責事項
      </div>
      <p className="text-sm text-brutal-black">
        この診断は医療診断ではありません...
      </p>
    </div>
  </div>
</div>
```

---

## 🎯 Future: SNS Share Images

結果ページから画像生成機能を実装する際の方針：

### OG Image (静的)
- 診断名、サイト名
- シンプルなブランディング

### Dynamic Result Image (Canvas/SVG)
- ユーザーのスコアを含む
- ネオブルータリストデザインそのまま
- 太いボーダー、モノクロ + アクセントカラー
- 600×600px または 1200×630px

---

## 📦 Component File Structure

```
components/
├── viz/
│   ├── ScoreCircle.tsx           # 円形スコア表示
│   ├── BrutalProgressBar.tsx     # プログレスバー
│   ├── StatCard.tsx              # 学術データカード
│   └── DataBadge.tsx             # ラベル・バッジ
└── ui/
    └── (shadcn/ui components)
```

---

## ✅ Design Checklist

新しいページ・コンポーネントを作成する際のチェックリスト：

- [ ] Archivo Black for headings
- [ ] JetBrains Mono for numbers (`.data-number`)
- [ ] 3px brutal borders (`border-brutal`)
- [ ] Brutal shadows (`shadow-brutal`)
- [ ] アクセントカラーは診断ジャンルに応じて選択
- [ ] アニメーションはスタッガー（遅延）を使う
- [ ] 免責事項は Yellow
- [ ] 数値は大きく、太く、モノスペースで

---

## 🔮 Next Steps

### Phase 2での拡張
- Big Five (Pink)
- ECR-R (Green)
- それぞれのビジュアライゼーション

### データビジュアライゼーション強化
- レーダーチャート（Big Five用）
- 2Dプロット（ECR-R用）
- 複数診断の統合ダッシュボード

---

**Design System Version**: 1.0
**Last Updated**: 2026-01-18
**Design Direction**: Neo-Brutalist × Data Visualization
