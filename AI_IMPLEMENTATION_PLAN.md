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

## 🧠 メモリアーキテクチャ（Memory Architecture）

### なぜメモリ設計が重要か？

LLMエージェントの会話品質は、**記憶をどう管理するか**に依存します。

**課題**:
- Context window（200K-2M tokens）には限界がある
- 長期会話では古い情報が押し出される
- 関連性の低い情報で無駄にトークンを消費
- ユーザーが過去の話題に戻ったときに文脈を失う

**解決策**:
- 3層メモリ階層（Working / Contextual / Long-term）
- 意味的検索（Semantic Retrieval）でRAGベースの記憶想起
- プログレッシブ要約（Progressive Summarization）でコンテキスト圧縮
- ブラウザ内ベクトル埋め込み（Transformers.js）で完全プライバシー

---

### メモリ階層（3-Tier Memory Hierarchy）

#### Layer 1: Working Memory（作業記憶）
- **容量**: 直近5-10ターン
- **保持期間**: 現在の会話セッション中のみ
- **用途**: 即座の文脈理解（"それ"、"その話"などの照応解決）
- **実装**: メモリ内配列（React state）

```typescript
interface WorkingMemory {
  messages: Message[];  // 直近10ターン
  currentTopic: string; // "キャリア相談"など
  lastUpdate: Date;
}
```

#### Layer 2: Contextual Memory（文脈記憶）
- **容量**: 現在の会話スレッド全体の要約
- **保持期間**: セッション終了まで（ページリロードで再構築）
- **用途**: 会話全体の流れ把握、主要な話題追跡
- **実装**: 定期的な要約生成（5ターンごと）

```typescript
interface ContextualMemory {
  conversationId: string;
  summary: string;  // "ユーザーは転職を検討中。Big Fiveの開放性が高く..."
  keyTopics: string[]; // ["転職", "キャリア", "強み"]
  emotionalTone: 'positive' | 'neutral' | 'negative';
  createdAt: Date;
  lastSummarizedTurn: number;
}
```

#### Layer 3: Long-term Memory（長期記憶）
- **容量**: 過去すべての会話（IndexedDB）
- **保持期間**: 永続（ユーザーが削除するまで）
- **用途**: セマンティック検索で関連する過去の会話を想起
- **実装**: IndexedDB + ベクトル埋め込み

```typescript
interface LongTermMemory {
  memoryId: string;
  type: 'conversation' | 'insight' | 'fact';
  content: string;
  embedding: number[]; // 768次元ベクトル（all-MiniLM-L6-v2）
  metadata: {
    conversationId: string;
    timestamp: Date;
    agentId: string;
    topics: string[];
    emotionalContext: string;
  };
  importance: number; // 0-1（重要度スコア）
}
```

---

### IndexedDB スキーマ設計

```typescript
// Dexie.js スキーマ
class ChatDatabase extends Dexie {
  conversations!: Table<Conversation>;
  messages!: Table<Message>;
  summaries!: Table<Summary>;
  memories!: Table<Memory>;

  constructor() {
    super('psychtest_chat');
    this.version(1).stores({
      // 会話スレッド
      conversations: '++id, agentId, createdAt, lastMessageAt',

      // メッセージ（全履歴）
      messages: '++id, conversationId, role, timestamp',

      // 要約（5ターンごと）
      summaries: '++id, conversationId, turnRange, createdAt',

      // 長期記憶（セマンティック検索用）
      memories: '++id, conversationId, type, importance, timestamp, *topics',
    });
  }
}

interface Conversation {
  id?: number;
  agentId: string; // 'coach' | 'strict-trainer' | ...
  title: string; // 自動生成 "キャリア相談 2026-01-21"
  createdAt: Date;
  lastMessageAt: Date;
  messageCount: number;
}

interface Message {
  id?: number;
  conversationId: number;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
  tokenCount?: number; // オプション：トークン使用量追跡
}

interface Summary {
  id?: number;
  conversationId: number;
  turnRange: string; // "1-5", "6-10"
  summary: string; // LLMが生成した要約
  keyPoints: string[];
  createdAt: Date;
}

interface Memory {
  id?: number;
  conversationId: number;
  type: 'conversation' | 'insight' | 'fact';
  content: string;
  embedding?: number[]; // ベクトル埋め込み（オプション）
  topics: string[];
  importance: number; // 0-1
  timestamp: Date;
}
```

---

### メモリ操作（Memory Operations）

Agentic Memory（AgeMem）研究に基づき、メモリ操作をLLMが自律的に実行できるツールとして実装：

```typescript
// lib/memory/operations.ts
interface MemoryOperations {
  // 1. Store（保存）
  store(content: string, type: 'insight' | 'fact', importance: number): Promise<void>;

  // 2. Retrieve（想起）
  retrieve(query: string, limit: number): Promise<Memory[]>;

  // 3. Update（更新）
  update(memoryId: number, content: string): Promise<void>;

  // 4. Summarize（要約）
  summarize(conversationId: number, turnRange: string): Promise<Summary>;

  // 5. Discard（削除）
  discard(memoryId: number): Promise<void>;
}

// 使用例: LLMが自律的にメモリ操作を実行
const tools = [
  {
    name: 'store_memory',
    description: 'Store important information for future reference',
    parameters: {
      content: 'string',
      type: 'insight | fact',
      importance: 'number (0-1)',
    },
  },
  {
    name: 'retrieve_memory',
    description: 'Search past conversations for relevant context',
    parameters: {
      query: 'string',
      limit: 'number',
    },
  },
];
```

---

### コンテキストウィンドウ管理

#### プログレッシブ要約（Progressive Summarization）

**戦略**: 5ターンごとに自動要約を生成し、古いメッセージを圧縮

```typescript
// lib/memory/summarization.ts
async function progressiveSummarization(conversationId: number) {
  const messages = await db.messages
    .where('conversationId')
    .equals(conversationId)
    .toArray();

  const TURNS_PER_SUMMARY = 5;
  const unsummarizedMessages = messages.slice(-TURNS_PER_SUMMARY);

  if (unsummarizedMessages.length < TURNS_PER_SUMMARY) {
    return; // まだ要約不要
  }

  // LLMに要約生成を依頼
  const summary = await generateSummary(unsummarizedMessages);

  // 要約を保存
  await db.summaries.add({
    conversationId,
    turnRange: `${messages.length - TURNS_PER_SUMMARY + 1}-${messages.length}`,
    summary: summary.text,
    keyPoints: summary.keyPoints,
    createdAt: new Date(),
  });

  // 重要なメッセージのみMemoriesに昇格
  const importantMessages = unsummarizedMessages.filter(m =>
    summary.keyPoints.some(point => m.content.includes(point))
  );

  for (const msg of importantMessages) {
    await db.memories.add({
      conversationId,
      type: 'conversation',
      content: msg.content,
      topics: extractTopics(msg.content),
      importance: 0.8, // 高重要度
      timestamp: msg.timestamp,
    });
  }
}
```

#### マルチレベル要約（Multi-level Summarization）

```
原メッセージ（10ターン） → 詳細要約（5ターン） → 抽象要約（1ターン）
       ↓                      ↓                      ↓
    500 tokens             100 tokens              20 tokens
```

**実装**:
```typescript
interface SummaryLevel {
  level: 1 | 2 | 3; // 1=詳細, 2=中間, 3=抽象
  turnRange: string;
  content: string;
  tokenCount: number;
}

// レベル1: 5ターンごと
// レベル2: 25ターン（5要約をさらに要約）
// レベル3: 125ターン（5要約をさらに要約）
```

---

### セマンティック検索（Semantic Retrieval）

#### ブラウザ内ベクトル埋め込み

**完全プライバシー**: サーバーにデータ送信せず、ブラウザ内で実行

```bash
npm install @xenova/transformers
```

```typescript
// lib/memory/embeddings.ts
import { pipeline } from '@xenova/transformers';

let embedder: any = null;

export async function initEmbeddings() {
  if (!embedder) {
    // all-MiniLM-L6-v2 (軽量、384次元)
    embedder = await pipeline('feature-extraction',
      'Xenova/all-MiniLM-L6-v2'
    );
  }
  return embedder;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const model = await initEmbeddings();
  const output = await model(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}
```

#### RAGベースの会話履歴検索

```typescript
// lib/memory/retrieval.ts
async function retrieveRelevantMemories(
  query: string,
  limit: number = 5
): Promise<Memory[]> {
  // 1. クエリの埋め込みを生成
  const queryEmbedding = await generateEmbedding(query);

  // 2. 全メモリを取得（TODO: ベクトルインデックス最適化）
  const allMemories = await db.memories.toArray();

  // 3. コサイン類似度で検索
  const scored = allMemories.map(memory => ({
    memory,
    score: memory.embedding
      ? cosineSimilarity(queryEmbedding, memory.embedding)
      : 0,
  }));

  // 4. 重要度 × 類似度でランキング
  scored.sort((a, b) => {
    const scoreA = a.score * a.memory.importance;
    const scoreB = b.score * b.memory.importance;
    return scoreB - scoreA;
  });

  // 5. 上位N件を返す
  return scored.slice(0, limit).map(s => s.memory);
}
```

---

### Claudeネイティブメモリ統合

Claudeの`memory_20250818`ツールを活用（Claude API使用時のみ）：

```typescript
// functions/api/chat.ts（Claude BYOK時）
async function callClaudeWithMemory(
  apiKey: string,
  messages: Message[],
  systemPrompt: string
) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      system: systemPrompt,
      messages,
      tools: [
        {
          type: 'memory',
          // Claudeが自動的にメモリファイルを管理
          memory_config: {
            type: 'indexeddb', // ブラウザ内保存
          },
        },
      ],
    }),
  });

  return response;
}
```

**Claudeのメモリ機能**:
- 24時間ごとに会話履歴から自動メモリ合成
- ユーザーの嗜好、重要な事実を自動抽出
- クロスセッションで永続化

---

### エージェント別メモリ分離

**要件**: 複数エージェント（コーチ、トレーナー、カウンセラー）で会話履歴を分離

```typescript
// lib/memory/agent-context.ts
interface AgentContext {
  agentId: string;
  conversationHistory: Message[];
  summaries: Summary[];
  memories: Memory[];
}

async function loadAgentContext(agentId: string): Promise<AgentContext> {
  const conversations = await db.conversations
    .where('agentId')
    .equals(agentId)
    .toArray();

  const conversationIds = conversations.map(c => c.id!);

  const messages = await db.messages
    .where('conversationId')
    .anyOf(conversationIds)
    .toArray();

  const summaries = await db.summaries
    .where('conversationId')
    .anyOf(conversationIds)
    .toArray();

  const memories = await db.memories
    .where('conversationId')
    .anyOf(conversationIds)
    .toArray();

  return {
    agentId,
    conversationHistory: messages,
    summaries,
    memories,
  };
}
```

**メリット**:
- 厳しいトレーナーとの会話が、優しいカウンセラーに漏れない
- エージェント特性に応じた記憶戦略（トレーナー＝目標達成記録、カウンセラー＝感情記録）

---

### メモリ削除とプライバシー

**GDPR準拠**: ユーザーがいつでもメモリを削除可能

```typescript
// lib/memory/privacy.ts
async function deleteAllMemories() {
  await db.conversations.clear();
  await db.messages.clear();
  await db.summaries.clear();
  await db.memories.clear();
}

async function deleteConversation(conversationId: number) {
  await db.messages.where('conversationId').equals(conversationId).delete();
  await db.summaries.where('conversationId').equals(conversationId).delete();
  await db.memories.where('conversationId').equals(conversationId).delete();
  await db.conversations.delete(conversationId);
}

async function exportMemories(): Promise<string> {
  const data = {
    conversations: await db.conversations.toArray(),
    messages: await db.messages.toArray(),
    summaries: await db.summaries.toArray(),
    memories: await db.memories.toArray(),
  };
  return JSON.stringify(data, null, 2);
}
```

---

### パフォーマンス最適化

#### 1. 遅延読み込み（Lazy Loading）
```typescript
// 初回レンダリング時は直近10件のみ
// スクロール時に追加読み込み
const messages = await db.messages
  .where('conversationId')
  .equals(conversationId)
  .reverse()
  .limit(10)
  .toArray();
```

#### 2. Web Worker でベクトル演算
```typescript
// workers/embeddings.worker.ts
self.onmessage = async (e) => {
  const { text } = e.data;
  const embedding = await generateEmbedding(text);
  self.postMessage({ embedding });
};
```

#### 3. IndexedDB インデックス最適化
```typescript
this.version(1).stores({
  memories: '++id, conversationId, type, importance, timestamp, *topics',
  //                                                           ^^^^^^^ 複合インデックス
});
```

---

### 実装優先度

#### Phase 1: 基本メモリ（MVP必須）
- ✅ IndexedDB スキーマ（conversations, messages）
- ✅ 会話履歴保存・読み込み
- ✅ エージェント別分離

#### Phase 2: 要約とコンテキスト管理
- ⚠️ プログレッシブ要約（5ターンごと）
- ⚠️ コンテキストウィンドウ最適化
- ⚠️ 古いメッセージの自動圧縮

#### Phase 3: セマンティック検索（高度）
- 📋 Transformers.js統合
- 📋 ベクトル埋め込み生成
- 📋 RAGベースの記憶想起
- 📋 Claudeネイティブメモリ統合

---

### 参考文献

- [AgeMem: Agentic Memory for LLMs (2026)](https://arxiv.org/abs/2501.00663) - Unified LTM/STM management
- [RAG for Conversation History Best Practices](https://www.glean.com/blog/building-ai-agents-in-2025-best-practices)
- [Context Window Management](https://community.openai.com/t/managing-long-chat-history-summarization-vs-observation-masking/988148)
- [Transformers.js - Browser ML](https://huggingface.co/docs/transformers.js)
- [Claude Memory Tools Documentation](https://www.anthropic.com/news/extended-context)
- [Dexie.js - IndexedDB Wrapper](https://dexie.org/)

---

## 📋 実装計画（3 Phase）

### Phase 1: MVP（1-2日）

**目標**: 「あなた専用AIライフコーチ」の基本機能

**実装内容**:
- `/chat` ページの追加
- Cloudflare Workers AI統合（無料枠のみ）
- 心理プロファイル自動読み込み
- **メモリシステム基盤**:
  - IndexedDB スキーマ実装（Dexie.js）
  - 会話履歴保存・読み込み（conversations, messages テーブル）
  - エージェント別メモリ分離
  - Working Memory管理（React state）
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
- [ ] `/chat` ページUI（チャット入力、メッセージ表示）
- [ ] Cloudflare Pages Functions setup
- [ ] Workers AI統合（ストリーミング）
- [ ] 心理プロファイル自動読み込み（Custom Instructions連携）
- [ ] **メモリシステム基盤**:
  - [ ] Dexie.js setup + IndexedDB スキーマ定義
  - [ ] `lib/memory/database.ts` - ChatDatabase class
  - [ ] `lib/memory/operations.ts` - 基本的な保存・読み込み関数
  - [ ] エージェント別会話履歴管理

### Week 2: Phase 2 BYOK + Memory Enhancement
- [ ] 設定ページ（`/settings`）
- [ ] APIキー暗号化（CryptoJS AES-256）
- [ ] Gemini API統合
- [ ] Claude API統合
- [ ] フォールバック機能（BYOK失敗時はWorkers AI）
- [ ] **メモリ強化**:
  - [ ] `lib/memory/summarization.ts` - プログレッシブ要約（5ターンごと）
  - [ ] Summariesテーブル活用
  - [ ] コンテキストウィンドウ最適化

### Week 3: Phase 3 Multi-Agent + Semantic Search（オプション）
- [ ] エージェントプリセット（coach, trainer, counselor等）
- [ ] エージェント推奨ロジック（Big Fiveベース）
- [ ] エージェント切り替えUI
- [ ] **高度なメモリ機能**（オプション）:
  - [ ] Transformers.js統合（@xenova/transformers）
  - [ ] `lib/memory/embeddings.ts` - ベクトル埋め込み生成
  - [ ] `lib/memory/retrieval.ts` - RAGベースのセマンティック検索
  - [ ] Memoriesテーブルへの埋め込み保存

---

## 📚 技術スタック

### Frontend
- Next.js 16 (App Router)
- React 19
- Dexie.js (IndexedDB wrapper)
- @xenova/transformers (ブラウザ内ベクトル埋め込み、Phase 3)
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
