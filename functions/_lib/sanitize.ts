/**
 * L0 (Input Delimiting) 防御ヘルパー.
 *
 * 元々 `functions/uranai/chat.ts` 内に inline 定義されていたものを、月読 endpoint に
 * 移行するタイミングで切り出した. Phase 2 Week 1 ([[chat_wedge_validated_2026_05]]) で
 * 投入された delimiter / role 偽装タグ除去 + <user_input> wrapping を提供.
 *
 * 設計参照: docs/references/prompt-injection-defense.md L0 章.
 * 単独防御ではないため、L1 (system prompt 強化, lib/uranai/tsukuyomi-prompt.ts) と
 * 必ず併用する.
 */

const DELIMITER_TAGS_RE = /<\/?(user_input|system|instructions|assistant|developer|tool)\s*>/gi;

export function sanitizeUserContent(content: string): string {
  return content.replace(DELIMITER_TAGS_RE, "");
}

export function wrapUserMessage(content: string): string {
  return `<user_input>\n${sanitizeUserContent(content)}\n</user_input>`;
}
