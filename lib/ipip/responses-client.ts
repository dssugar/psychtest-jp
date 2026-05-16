/**
 * Client-side helper: scale テスト完走時に raw answer を IPIP 統一 DB に二重書きする (Phase 2.1).
 *
 * 既存 localStorage 保存は維持 (= regression 0). 失敗時は console.warn で silent log.
 *
 * Phase 2.1 では bigfive のみ対応. Phase 2.2 で Industriousness / Self-Concept を追加予定
 * (= 各 question データ source の hxxx フィールドを参照して同じ shape に変換すれば良い).
 *
 * spec: docs/specs/ipip-unified-db-wedge-2026-05.md §"Step 4"
 */

import { bigFiveQuestions } from "@/data/bigfive-questions";
import { getOrCreateDeviceId } from "@/lib/uranai/device-id";
import type { TestType } from "@/lib/storage";

/**
 * 対応 scale 一覧. 将来 Industriousness 等を追加するときはここに 1 エントリ.
 * 各エントリは「answers[i] (raw 1-5) → { itemId, value } 配列」への変換を担う.
 */
const IPIP_SCALE_ADAPTERS: Partial<
  Record<TestType, (answers: number[]) => Array<{ itemId: string; value: number }>>
> = {
  // INVARIANT: bigFiveQuestions の配列順 = テスト UI の表示順 = answers 配列の index 順.
  // calculateBigFiveScore も同じ配列 index で対応付けるので、ここでも index 突合.
  // hxxx 欠落の項目は silently skip (= 現状 120/120 マッチ済、Phase 2.2 で他 scale 追加時も同方針).
  bigfive: (answers) => {
    if (answers.length !== bigFiveQuestions.length) return [];
    const out: Array<{ itemId: string; value: number }> = [];
    for (let i = 0; i < answers.length; i++) {
      const hxxx = bigFiveQuestions[i].hxxx;
      const value = answers[i];
      if (!hxxx || typeof value !== "number" || value < 1) continue;
      out.push({ itemId: hxxx, value });
    }
    return out;
  },
};

/**
 * scale 完走時に呼ぶ. IPIP 統合対象でない scale なら何もしない.
 * D1 書き込み失敗は console.warn で silent log (= UX 維持優先、localStorage 経路は別途維持).
 */
export async function submitIpipResponses(
  testType: TestType,
  answers: number[],
): Promise<void> {
  const adapter = IPIP_SCALE_ADAPTERS[testType];
  if (!adapter) return; // 統合対象外 (= no-op)

  const responses = adapter(answers);
  if (responses.length === 0) return;

  const deviceId = getOrCreateDeviceId();
  if (!deviceId) return; // SSR or 取得失敗

  try {
    const res = await fetch("/ipip/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deviceId,
        scaleId: testType,
        source: `scale:${testType}`,
        answers: responses,
      }),
    });
    // UX 維持優先: D1 書き込み失敗は silent log (spec §"Open Questions" 7).
    // 既存 localStorage 経路で結果ページ表示は成立するので、ここでは throw しない.
    if (!res.ok) {
      console.warn(`[ipip] POST /ipip/responses failed: ${res.status}`);
    }
  } catch (err) {
    console.warn("[ipip] POST /ipip/responses error:", err);
  }
}
