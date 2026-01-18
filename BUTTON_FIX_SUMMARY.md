# テストページボタン修正サマリー

## 問題

ユーザーからの報告: 「テストの選択のボタンが見えなくなってしまっています」

## 原因

複数の問題が重なっていました:

### 1. **CSS @import の順序エラー**
- `app/globals.css`でGoogle Fontsの@importがTailwindの@importより前にあった
- Tailwind CSS v4では`@import "tailwindcss"`が最初に来る必要がある
- これによりCSSパースエラーが発生し、一部のスタイルが適用されない

### 2. **Tailwind CSS v4の設定方法の変更**
- `tailwind.config.ts`で定義したカスタムユーティリティ（`border-brutal`、`bg-brutal-white`など）が適用されない
- Tailwind CSS v4では`@theme`ディレクティブを使用する必要があるが、正しく機能しない
- 結果として、カスタムボーダー幅、カラー、シャドウが適用されない

### 3. **border-solidクラスの欠落**
- ボタンに`border-brutal`（幅）と`border-brutal-black`（色）は指定されていたが、`border-solid`（スタイル）が欠落
- CSS borderプロパティには width/style/color の3つが必要
- `border-solid`がないとボーダーが表示されない

## 解決方法

### 1. フォント読み込みの最適化 (`app/layout.tsx`)
```typescript
import { Archivo_Black, Inter, JetBrains_Mono } from "next/font/google";

// Next.jsのフォント最適化システムを使用
const archivoBlack = Archivo_Black({ ... });
const inter = Inter({ ... });
const jetbrainsMono = JetBrains_Mono({ ... });

<html className={`${archivoBlack.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
```

### 2. globals.cssの修正
- Google Fonts @import を削除
- @import "tailwindcss" を最初に配置
- カスタムテーマ定義を@themeディレクティブで試みた（が完全には機能せず）

### 3. Tailwind標準クラス + 任意値の使用 (`app/sccs/test/page.tsx`)

**Before:**
```tsx
className="border-brutal border-brutal-black bg-brutal-white"
```

**After:**
```tsx
className="border-[3px] border-solid border-black bg-[#ffffff]"
```

変更内容:
- `border-brutal` → `border-[3px]` (任意値で直接指定)
- `border-solid` を追加 ← **重要**
- `border-brutal-black` → `border-black` (標準色)
- `bg-brutal-white` → `bg-[#ffffff]` (任意値で白を指定)
- `shadow-brutal-sm` → `shadow-[4px_4px_0px_#000]` (任意値)

## テスト結果

### E2Eテスト（button visibility）: ✅ 7/7 pass
- ✅ answer buttons should be visible
- ✅ answer buttons should have proper styling (borderWidth: 3px)
- ✅ answer buttons should be clickable and change state
- ✅ clicking answer button should advance to next question automatically
- ✅ radio indicator should be visible in answer buttons
- ✅ all scale labels should be present
- ✅ buttons should have hover effect

### 基本E2Eテスト: ✅ 4/4 pass
- ✅ homepage should render correctly
- ✅ SCCS info page should render correctly
- ✅ SCCS test page should render correctly
- ✅ navigation flow works

### ビルド: ✅ 成功
```
✓ Compiled successfully
Route (app)
├ ○ /
├ ○ /sccs
├ ○ /sccs/test
└ ○ /results/sccs
```

## 学んだこと

### Tailwind CSS v4の制約
1. カスタムユーティリティの定義が`tailwind.config.ts`では完全に機能しない
2. `@theme`ディレクティブも期待通りには動作しない
3. **解決策**: 標準Tailwindクラス + 任意値（arbitrary values）を使用する
   - `border-[3px]`, `bg-[#ffffff]`, `shadow-[4px_4px_0px_#000]` など

### Tailwind CSS borderの基本
CSSボーダーには3つのプロパティが**すべて**必要:
1. **Width**: `border-[3px]` または `border-4`
2. **Style**: `border-solid` ← **必須だが忘れがち**
3. **Color**: `border-black` または `border-[#000]`

この3つが揃って初めてボーダーが表示される！

### Next.jsフォント最適化
- CSS @importよりも`next/font/google`を使う方が良い
- パフォーマンスが向上し、ビルド時にフォントを最適化
- CSS変数として利用可能

## 今後の改善案

1. **デザインシステムの整理**
   - カスタムユーティリティが必要な場合は、Tailwind CSS v3に戻すことを検討
   - または、ブルータルスタイルをCSSクラス（`.btn-brutal`など）として定義し、Tailwindユーティリティと組み合わせる

2. **E2Eテストの拡充**
   - フラッキーテストを防ぐため、より安定したwait戦略を実装
   - ビジュアルリグレッションテストの追加を検討

3. **CSSアーキテクチャ**
   - Tailwind v4の@themeが安定するまで、標準クラス+任意値で運用
   - 繰り返し使用するスタイルはコンポーネントに抽出

## ステータス

✅ **修正完了**
ボタンは正常に表示され、すべてのE2Eテストがpassしています。

---
**修正日**: 2026-01-18
**対応者**: Claude Sonnet 4.5
