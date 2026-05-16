/**
 * uranai α wedge で共有される型. client (app/) と server (functions/) の両方から import する.
 *
 * 既存の `functions/uranai/chat.ts` で定義されていた DivinationContext / CardInput 等の
 * shape をそのまま踏襲. 月読 endpoint 移行後は本ファイルが single source of truth.
 */

export type Role = "user" | "assistant" | "system";

export interface ChatMessage {
  role: Exclude<Role, "system">; // client 側で扱うのは user / assistant のみ. system は server で組む.
  content: string;
}

export interface CardInput {
  name_ja: string;
  orientation: "upright" | "reversed";
  upright_meaning: string;
  reversed_meaning: string;
}

export interface NumerologyInput {
  lifePath: number;
  lifePathMeaning: string;
  personalDay: number;
  personalDayMeaning: string;
}

export interface KyuseiStarInput {
  number: number;
  name: string;
  element: string;
  symbol: string;
}

export interface KyuseiInput {
  honmeisho: KyuseiStarInput;
  todayStar: KyuseiStarInput;
  fortune: string;
  fortuneKeyword: string;
}

export interface DivinationContext {
  tarot: CardInput[]; // 必ず 3 枚.
  numerology: NumerologyInput;
  kyusei: KyuseiInput;
}

/**
 * 月読 chat の入室時に server に送る payload (POST /uranai/chat/tsukuyomi).
 *
 * - deviceId: lib/uranai/device-id.ts で発行された匿名 ID
 * - sessionId: client が継続管理する session UUID (新しい占い師を呼ぶ時のみ再発行)
 * - newMessage: ユーザーの今回 turn (null なら "session start": divinationContext を新規生成して初回挨拶)
 * - divinationContext: session 開始時に毎回付ける (= LLM が必ず参照する)
 *
 * 過去 turn は server 側で D1 から hydrate するので client は送らない.
 */
export interface ChatRequest {
  deviceId: string;
  sessionId: string;
  newMessage: string | null;
  divinationContext: DivinationContext;
}

export interface ChatResponse {
  reply: string;
  turnId: number; // 今回追加された assistant turn の id.
}

/**
 * 履歴 hydrate 用 (GET /uranai/history?deviceId=...&sessionId=...&limit=20).
 */
export interface HistoryTurn {
  turnId: number;
  role: Exclude<Role, "system">;
  content: string;
  createdAt: number;
}

export interface ProfilePayload {
  deviceId: string;
  nickname: string | null;
  testResults: unknown | null; // UserProfile.tests を unknown 化 (server は中身を解釈しない)
  phq9K6Optin: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface DrawSavePayload {
  deviceId: string;
  type: "3systems";
  inputs: DivinationContext;
  interpretation: string;
}

export interface DrawSaveResponse {
  resultId: string;
}

export interface DrawFetchResponse {
  resultId: string;
  type: string;
  inputs: DivinationContext;
  interpretation: string;
  createdAt: number;
}
