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
import { industriousnessQuestions } from "@/data/industriousness-questions";
import { rosenbergQuestions } from "@/data/rosenberg-questions";
import { phq9Questions } from "@/data/phq9-questions";
import { questions as k6Questions } from "@/data/k6-questions";
import { swlsQuestions } from "@/data/swls-questions";
import { getOrCreateDeviceId } from "@/lib/uranai/device-id";
import type { TestType } from "@/lib/storage";

/**
 * 対応 scale 一覧. 各エントリは「answers[i] (raw value) → { itemId, value } 配列」への変換を担う.
 *
 * INVARIANT (全 adapter 共通): questions 配列順 = テスト UI 表示順 = answers index 順.
 * 各 calculateScore も同じ配列 index で対応付ける.
 *
 * value range: IPIP 系 1-5、非 IPIP 系は raw 値そのまま (Phase 2.3 で D1 CHECK を 0-7 に緩和済).
 *   Rosenberg: 1-4 / PHQ-9: 0-3 / K6: 0-4 / SWLS: 1-7
 *
 * item_id field:
 *   - bigfive / industriousness: `hxxx` (= IPIP master Hxxx)
 *   - rosenberg / phq9 / k6 / swls: `itemId` (= supplement RSE-/PHQ9-/K6-/SWLS-)
 */
function buildResponses<Q extends { itemId?: string; hxxx?: string }>(
  questions: readonly Q[],
  answers: number[],
  validValue: (v: number) => boolean,
): Array<{ itemId: string; value: number }> {
  if (answers.length !== questions.length) return [];
  const out: Array<{ itemId: string; value: number }> = [];
  for (let i = 0; i < answers.length; i++) {
    const id = questions[i].itemId ?? questions[i].hxxx;
    const value = answers[i];
    if (!id || typeof value !== "number" || !validValue(value)) continue;
    out.push({ itemId: id, value });
  }
  return out;
}

const valid_1_5 = (v: number) => v >= 1 && v <= 5;
const valid_1_4 = (v: number) => v >= 1 && v <= 4;
const valid_0_3 = (v: number) => v >= 0 && v <= 3;
const valid_0_4 = (v: number) => v >= 0 && v <= 4;
const valid_1_7 = (v: number) => v >= 1 && v <= 7;

const IPIP_SCALE_ADAPTERS: Partial<
  Record<TestType, (answers: number[]) => Array<{ itemId: string; value: number }>>
> = {
  bigfive: (answers) => buildResponses(bigFiveQuestions, answers, valid_1_5),
  industriousness: (answers) => buildResponses(industriousnessQuestions, answers, valid_1_5),
  rosenberg: (answers) => buildResponses(rosenbergQuestions, answers, valid_1_4),
  phq9: (answers) => buildResponses(phq9Questions, answers, valid_0_3),
  k6: (answers) => buildResponses(k6Questions, answers, valid_0_4),
  swls: (answers) => buildResponses(swlsQuestions, answers, valid_1_7),
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
