# AI Chat機能 実装計画（2026年版）

## リサーチサマリー

### 📊 LLM API比較（2026年1月時点）

| Provider | モデル | Input/1M tokens | Output/1M tokens | Context | 特徴 |
|----------|--------|-----------------|------------------|---------|------|
| **Gemini** | Flash-Lite | $0.10 | $0.40 | 2M | 最安値、無料枠1000req/day |
| **Gemini** | 2.5 Pro | $1.25 | $10.00 | 2M | バランス型 |
| **Claude** | Haiku 4.5 | $1.00 | $5.00 | 200K | 高速 |
| **Claude** | Sonnet 4.5 | $3.00 | $15.00 | 1M | バランス型 |
| **Claude** | Opus 4.5 | $5.00 | $25.00 | 1M | 最高性能 |
| **Cloudflare** | Workers AI | $0.011/1000 Neurons → Token課金に移行中 | - | - | エッジで実行 |

**コスト削減テクニック**:
- Claude: Batch API（50%割引）、Prompt Caching（90%削減）
- Gemini: 無料枠が豊富（1000req/day）

**Sources**:
- [AI API Pricing Comparison 2026](https://intuitionlabs.ai/articles/ai-api-pricing-comparison-grok-gemini-openai-claude)
- [Gemini API Pricing](https://www.aifreeapi.com/en/posts/gemini-api-pricing-2026)
- [Claude Pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- [Cloudflare Workers AI Pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)

---

## 🔐 BYOK（Bring Your Own Key）ベストプラクティス

### セキュリティの課題

**❌ 避けるべき実装**:
```typescript
// 危険：平文でlocalStorageに保存
localStorage.setItem('apiKey', userApiKey); // XSS攻撃に脆弱
```

**✅ 推奨される実装**:

#### Option A: クライアント暗号化 + localStorage
```typescript
// Mozilla.ai any-llm方式
import { encrypt, decrypt } from 'crypto-js/aes';

// ユーザーのマスターパスワードで暗号化
const encryptedKey = encrypt(apiKey, userPassword);
localStorage.setItem('encryptedApiKey', encryptedKey);

// 使用時に復号化
const apiKey = decrypt(encryptedKey, userPassword);
```

**特徴**:
- ✅ Zero-knowledge（サーバーが鍵を知らない）
- ✅ プライバシー最優先
- ⚠️ ユーザーがパスワードを忘れたら復元不可

#### Option B: BFF（Backend for Frontend）パターン
```typescript
// バックエンドで鍵を管理
// POST /api/chat
export async function POST(request: Request) {
  const { message } = await request.json();
  const session = await getSession(request);
  const apiKey = await getEncryptedApiKey(session.userId);

  // バックエンドからLLM APIを叩く
  const response = await callLLM(apiKey, message);
  return Response.json(response);
}
```

**特徴**:
- ✅ APIキーが完全にブラウザから隠蔽
- ✅ レート制限・監視が容易
- ⚠️ サーバーコストが発生
- ⚠️ Cloudflare Pages（静的サイト）では制約

#### Option C: Cloudflare Pages Functions（ハイブリッド）
```typescript
// functions/api/chat.ts
export async function onRequestPost(context) {
  const { message, encryptedApiKey } = await context.request.json();

  // Cloudflare KV/D1でユーザーごとの暗号化鍵を管理
  const apiKey = await decryptApiKey(encryptedApiKey, context.env.ENCRYPTION_KEY);

  // Workers AI または外部APIを呼び出し
  const ai = new Ai(context.env.AI);
  const response = await ai.run('@cf/meta/llama-3-8b-instruct', {
    messages: [{ role: 'user', content: message }],
    stream: true
  });

  return new Response(response, {
    headers: { 'content-type': 'text/event-stream' }
  });
}
```

**特徴**:
- ✅ 静的サイトでもBFFパターンが使える
- ✅ Cloudflare Workers AIと統合可能
- ✅ エッジで実行（低レイテンシ）
- ✅ 無料枠が豊富

**Sources**:
- [GitHub Copilot BYOK Enhancements](https://github.blog/changelog/2026-01-15-github-copilot-bring-your-own-key-byok-enhancements/)
- [Mozilla.ai any-llm Platform](https://blog.mozilla.ai/secure-your-keys-track-your-costs-any-llm-managed-platform-enters-open-beta/)
- [Stop Leaking API Keys: BFF Pattern](https://blog.gitguardian.com/stop-leaking-api-keys-the-backend-for-frontend-bff-pattern-explained/)

---

## 🏗️ 実装アーキテクチャ（推奨案）

### Architecture: Cloudflare-First ハイブリッド

```
psychtest.jp (Next.js Static + Cloudflare Pages)
    ↓
/chat ページ（クライアント）
    ↓
Cloudflare Pages Functions（Edge BFF）
    ↓
┌─────────────────────┬─────────────────────┐
│ Cloudflare Workers AI│ 外部API (BYOK)      │
│ (無料/安価)          │ (Gemini/Claude)     │
└─────────────────────┴─────────────────────┘
    ↓
IndexedDB（会話履歴をブラウザに保存）
```

**なぜこのアーキテクチャ？**

1. **Cloudflare Pagesと親和性が高い**
   - 既にCloudflare Pagesでホスティング
   - Functions（Edge BFF）が無料枠で使える
   - Workers AIと統合可能

2. **コストが最小**
   - Workers AI: 無料枠10,000 Neurons/day
   - BYOK: ユーザーが自分のAPIキー持ち込み可能
   - Pages Functions: 無料枠100,000 req/day

3. **プライバシー重視**
   - 会話履歴はブラウザのIndexedDBのみ
   - サーバーにデータ送信なし（ログも残らない）
   - BYOK対応でAPIキーも自己管理

4. **段階的拡張が可能**
   - Phase 1: Workers AI（無料）のみ
   - Phase 2: BYOK追加（Gemini/Claude）
   - Phase 3: 複数エージェント管理

---

## 📋 実装計画（3 Phase）

### Phase 1: MVP（1-2日）

**目標**: 「あなた専用AIライフコーチ」の基本機能

**実装内容**:
- `/chat` ページの追加
- Cloudflare Workers AI統合（無料枠のみ）
- 心理プロファイル自動読み込み
- IndexedDBで会話履歴保存
- ストリーミングUI

**技術スタック**:
```typescript
// app/chat/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { getProfile } from '@/lib/storage';
import { generateCustomInstructions } from '@/lib/export/custom-instructions';
import { useIndexedDB } from '@/lib/hooks/useIndexedDB';

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [systemPrompt, setSystemPrompt] = useState('');

  useEffect(() => {
    // 心理プロファイルを自動読み込み
    const profile = getProfile();
    if (profile) {
      const instructions = generateCustomInstructions(profile, {
        format: 'claude',
        includeBigFive: true,
        includeCommunicationStyle: true,
        language: 'ja',
      });
      setSystemPrompt(instructions);
    }
  }, []);

  async function sendMessage(content: string) {
    // Cloudflare Pages Functionsにリクエスト
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: content, systemPrompt }),
    });

    // ストリーミングレスポンスを処理
    const reader = response.body.getReader();
    // ... streaming処理
  }
}
```

```typescript
// functions/api/chat.ts
import { Ai } from '@cloudflare/ai';

export async function onRequestPost(context) {
  const { message, systemPrompt } = await context.request.json();

  const ai = new Ai(context.env.AI);
  const stream = await ai.run('@cf/meta/llama-3-8b-instruct', {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ],
    stream: true,
  });

  return new Response(stream, {
    headers: { 'content-type': 'text/event-stream' },
  });
}
```

**成果物**:
- ✅ `/chat` ページが動作
- ✅ 心理プロファイル連携
- ✅ 無料で使える（Workers AI）
- ✅ 会話履歴保存（IndexedDB）

**Sources**:
- [Cloudflare Workers AI Streaming](https://blog.cloudflare.com/workers-ai-streaming/)
- [Workers AI Tutorials](https://developers.cloudflare.com/workers-ai/guides/tutorials/)
- [faster-next-chat (local-first)](https://github.com/1337hero/faster-next-chat)

---

### Phase 2: BYOK対応（1-2日）

**目標**: Gemini/Claude APIキーの持ち込み対応

**実装内容**:
- 設定ページ（`/settings`）でAPIキー登録
- クライアント暗号化（AES-256）
- Cloudflare KVでユーザーごとの設定管理
- フォールバック（BYOK失敗時はWorkers AIに）

**セキュリティ実装**:
```typescript
// lib/crypto/apikey.ts
import CryptoJS from 'crypto-js';

export function encryptApiKey(apiKey: string, userPassword: string): string {
  return CryptoJS.AES.encrypt(apiKey, userPassword).toString();
}

export function decryptApiKey(encrypted: string, userPassword: string): string {
  const bytes = CryptoJS.AES.decrypt(encrypted, userPassword);
  return bytes.toString(CryptoJS.enc.Utf8);
}
```

```typescript
// functions/api/chat.ts（拡張版）
export async function onRequestPost(context) {
  const { message, systemPrompt, encryptedApiKey, provider } = await context.request.json();

  if (provider === 'gemini' && encryptedApiKey) {
    // BYOK: Gemini API
    const apiKey = await decryptInServer(encryptedApiKey, context.env.ENCRYPTION_KEY);
    const response = await callGeminiAPI(apiKey, message, systemPrompt);
    return new Response(response);
  } else if (provider === 'claude' && encryptedApiKey) {
    // BYOK: Claude API
    // ... 同様の処理
  } else {
    // フォールバック: Workers AI（無料）
    const ai = new Ai(context.env.AI);
    // ... Phase 1と同じ
  }
}
```

**成果物**:
- ✅ Gemini/Claude APIキー持ち込み可能
- ✅ 暗号化されて保存
- ✅ フォールバック機能

---

### Phase 3: マルチエージェント（2-3日）

**目標**: 複数のAIキャラクター（エージェント）と対話

**実装内容**:
- エージェントプリセット（厳しいトレーナー、優しいカウンセラー、論理的な参謀）
- 心理プロファイルに応じた自動推奨
- エージェント切り替えUI
- 会話履歴のエージェント別管理

**エージェント定義**:
```typescript
// lib/agents/presets.ts
interface AgentPreset {
  id: string;
  name: string;
  description: string;
  systemPromptTemplate: (profile: UserProfile) => string;
  recommendedFor: (profile: UserProfile) => boolean;
}

export const agentPresets: AgentPreset[] = [
  {
    id: 'coach',
    name: 'あなた専用コーチ',
    description: '心理プロファイルを完全理解した万能アシスタント',
    systemPromptTemplate: (profile) => generateCustomInstructions(profile, {...}),
    recommendedFor: () => true, // 全員におすすめ
  },
  {
    id: 'strict-trainer',
    name: '厳しいトレーナー',
    description: '目標達成に向けて厳しく励ます',
    systemPromptTemplate: (profile) => `
      ${generateCustomInstructions(profile, {...})}

      あなたは厳格なトレーナーです。
      - 甘えを許さない
      - 具体的なアクションプランを要求
      - 達成できない言い訳を受け入れない
    `,
    recommendedFor: (profile) => {
      // 誠実性が高い人におすすめ
      return profile.tests.bigfive?.result.conscientiousness > 84;
    },
  },
  {
    id: 'gentle-counselor',
    name: '優しいカウンセラー',
    description: '共感的に寄り添う',
    systemPromptTemplate: (profile) => `
      ${generateCustomInstructions(profile, {...})}

      あなたは優しいカウンセラーです。
      - 常に共感的に聞く
      - 否定やジャッジをしない
      - 感情を言語化する手伝いをする
    `,
    recommendedFor: (profile) => {
      // 神経症傾向が高い人におすすめ
      return profile.tests.bigfive?.result.neuroticism > 84;
    },
  },
  // ... 他のエージェント
];
```

**成果物**:
- ✅ 複数エージェント管理
- ✅ 心理プロファイルベースの推奨
- ✅ エージェント別会話履歴

---

## 🎯 最終的なユーザー体験

### ユーザーフロー

```
1. psychtest.jpで診断完了（Big Five, Rosenberg等）
   ↓
2. ダッシュボードに「🤖 AIライフコーチと対話」ボタン
   ↓
3. /chatページ
   ├─ 自動的に心理プロファイルを読み込み済み
   ├─ 初回は無料（Workers AI）ですぐ使える
   └─ 設定から自分のAPIキー追加可能（より高性能）
   ↓
4. AIが性格を完全理解して対話
   「開放性が高く知的好奇心旺盛なあなたには...」
   「不安を感じやすいが怒りは低く穏やかなので...」
   ↓
5. エージェント切り替え（Phase 3）
   「今日は厳しいトレーナーに切り替えますか？」
```

### 競合との差別化

| 機能 | psychtest.jp | 16personalities | ChatGPT | Claude |
|------|--------------|-----------------|---------|--------|
| 学術的診断 | ✅ Big Five 30ファセット | ❌ 疑似科学 | ❌ | ❌ |
| AI統合 | ✅ 診断結果自動連携 | ❌ | ⚠️ 手動コピペ | ⚠️ 手動コピペ |
| プライバシー | ✅ ブラウザ内完結 | - | ❌ サーバー保存 | ❌ サーバー保存 |
| BYOK | ✅ | ❌ | ❌ | ❌ |
| 無料枠 | ✅ Workers AI | - | ⚠️ 制限あり | ⚠️ 制限あり |

---

## 💰 マネタイズ戦略

### 無料ティア
- 心理テスト（全機能）
- AIチャット（Workers AI、制限あり）
- カスタムインストラクションエクスポート

### 有料ティア（月額500円）
- AIチャット無制限（Workers AI）
- 複数エージェント管理
- 会話履歴クラウド同期（オプション）

### プレミアムティア（BYOK）
- 自分のAPIキー持ち込み
- Gemini/Claude等の高性能モデル利用
- コスト完全管理

---

## 🚀 推奨実装順序

### Week 1: Phase 1 MVP
- [ ] `/chat` ページUI
- [ ] Cloudflare Pages Functions setup
- [ ] Workers AI統合
- [ ] 心理プロファイル自動読み込み
- [ ] IndexedDB会話履歴

### Week 2: Phase 2 BYOK
- [ ] 設定ページ
- [ ] APIキー暗号化
- [ ] Gemini API統合
- [ ] Claude API統合
- [ ] フォールバック機能

### Week 3: Phase 3 Multi-Agent（オプション）
- [ ] エージェントプリセット
- [ ] エージェント推奨ロジック
- [ ] エージェント切り替えUI

---

## 📚 技術スタック

### Frontend
- Next.js 16 (App Router)
- React 19
- Dexie.js (IndexedDB wrapper)
- TailwindCSS v4

### Backend（Edge）
- Cloudflare Pages Functions
- Cloudflare Workers AI
- Cloudflare KV（設定保存）

### API統合
- Gemini API (Google AI Studio)
- Claude API (Anthropic)
- Vercel AI SDK（ストリーミング統一）

### セキュリティ
- CryptoJS (AES-256 encryption)
- クライアント暗号化
- Zero-knowledge design

---

## ⚠️ 注意事項

### 1. AdSenseポリシー
- `/chat` ページではAdSenseを表示しない
- 診断ページとは明確に分離

### 2. プライバシーポリシー更新
- AI機能の追加を明記
- BYOK使用時のデータフロー説明
- IndexedDB使用の説明

### 3. 免責事項
```
⚠️ AIライフコーチは医療・心理カウンセリングの代替ではありません。
深刻な問題がある場合は、必ず専門家にご相談ください。
```

---

## 🎓 参考資料

### BYOK & Security
- [GitHub Copilot BYOK Enhancements](https://github.blog/changelog/2026-01-15-github-copilot-bring-your-own-key-byok-enhancements/)
- [Mozilla.ai any-llm Platform](https://blog.mozilla.ai/secure-your-keys-track-your-costs-any-llm-managed-platform-enters-open-beta/)
- [BFF Pattern Explained](https://blog.gitguardian.com/stop-leaking-api-keys-the-backend-for-frontend-bff-pattern-explained/)

### API Pricing
- [AI API Pricing Comparison](https://intuitionlabs.ai/articles/ai-api-pricing-comparison-grok-gemini-openai-claude)
- [Gemini API Pricing 2026](https://www.aifreeapi.com/en/posts/gemini-api-pricing-2026)
- [Claude Pricing](https://platform.claude.com/docs/en/about-claude/pricing)

### Implementation
- [Cloudflare Workers AI Streaming](https://blog.cloudflare.com/workers-ai-streaming/)
- [faster-next-chat (local-first)](https://github.com/1337hero/faster-next-chat)
- [Cloudflare Chat Demo](https://github.com/cloudflare/workers-chat-demo)

---

**次のステップ**: Phase 1 MVP実装を開始しますか？
