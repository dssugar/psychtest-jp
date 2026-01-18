# E2E Testing Guide

## セットアップ

Playwrightは既にインストール済みです。

```bash
npm install  # 依存関係インストール（初回のみ）
npx playwright install chromium  # ブラウザインストール（初回のみ）
```

## テスト実行

### 基本的なテスト
```bash
npm run test:e2e                # 全テスト実行
npm run test:e2e:ui            # UIモードで実行（デバッグ用）
npm run test:e2e:headed        # ブラウザを表示して実行
```

### 特定のテストのみ実行
```bash
npx playwright test e2e/basic.spec.ts           # 基本テストのみ
npx playwright test e2e/homepage.spec.ts        # トップページのみ
npx playwright test e2e/sccs-flow.spec.ts       # 診断フローのみ
```

## テストファイル

### ✅ basic.spec.ts（推奨）
基本的なページレンダリングとナビゲーションをテスト。

**テスト項目:**
- トップページの表示
- SCCS説明ページの表示
- テストページの表示
- ナビゲーションフロー

**実行:**
```bash
npx playwright test e2e/basic.spec.ts
```

**Status:** ✅ All 4 tests pass

### 🚧 homepage.spec.ts
トップページのデザイン要素を詳細にテスト。

**テスト項目:**
- ヒーロータイトル
- DataBadge表示
- StatCard表示
- Brutal Button スタイル
- 免責事項表示

**Status:** ⚠️ 一部テスト要修正（フォント関連）

### 🚧 sccs-flow.spec.ts
完全な診断フローをテスト。

**テスト項目:**
- トップ → 説明 → テスト → 結果の完全フロー
- プログレスバー表示
- 戻るボタン機能

**Status:** ⚠️ 結果ページ遷移の改善が必要

### 🚧 results.spec.ts
結果ページのビジュアライゼーションをテスト。

**テスト項目:**
- ScoreCircle表示
- DataBadge表示
- StatCard表示
- モノスペースフォント
- アクションボタン

**Status:** ⚠️ ヘルパー関数の改善が必要

## テスト戦略

### ✅ 実装済み
1. **基本的なページレンダリング** - すべてのページが正しく表示される
2. **ナビゲーション** - ページ間の遷移が動作する
3. **主要コンポーネント** - DataBadge、StatCardなどが表示される

### 🚧 改善が必要
1. **診断フローの完全テスト** - 12問回答 → 結果表示
2. **フォントのロード確認** - Archivo Black、JetBrains Monoの適用
3. **アニメーションテスト** - CSS animationsの動作確認

### 📋 今後の追加
1. **アクセシビリティテスト** - axe-coreとの統合
2. **ビジュアルリグレッションテスト** - スクリーンショット比較
3. **パフォーマンステスト** - Lighthouseスコア

## CI/CD統合

### GitHub Actions例
```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## デバッグ

### UIモードでデバッグ
```bash
npm run test:e2e:ui
```

### ブラウザを表示して実行
```bash
npm run test:e2e:headed
```

### 特定のテストをデバッグ
```bash
npx playwright test e2e/sccs-flow.spec.ts --debug
```

### レポート表示
```bash
npx playwright show-report
```

## ベストプラクティス

### ✅ Do
- ユーザー視点でテストを書く（getByRole, getByTextを使用）
- 各テストは独立させる（他のテストに依存しない）
- 明示的な待機（waitForSelector, waitForURL）を使用
- 適切なタイムアウトを設定（デフォルト30秒）

### ❌ Don't
- 固定時間の待機（waitForTimeout）を多用しない
- IDやクラス名に依存しすぎない
- テスト間でステートを共有しない
- 長すぎるテストを書かない（1テスト = 1シナリオ）

## 現在のテストカバレッジ

| ページ | レンダリング | インタラクション | ビジュアル |
|--------|-------------|-----------------|-----------|
| トップ | ✅ | ✅ | ⚠️ |
| SCCS説明 | ✅ | ✅ | ⚠️ |
| テスト | ✅ | ⚠️ | - |
| 結果 | ⚠️ | ⚠️ | ⚠️ |

**Legend:**
- ✅ テスト済み・動作確認
- ⚠️ 一部テスト済み・改善が必要
- ❌ テストなし
- \- 該当なし

---

**Last Updated:** 2026-01-18
**Playwright Version:** 1.57.0
**Test Framework:** Playwright Test
