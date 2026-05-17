/**
 * Phase 2.x.H/H.1 verification: profile-summarizer の completedScales / lastAssistantTurnAt 動作確認.
 */
import { summarizeProfile } from "@/lib/uranai/profile-summarizer";

console.log("=== Test 1: 少数 scale (3 件) → mid 含めて全部 inject ===\n");
console.log(
  summarizeProfile({
    profile: null,
    phq9K6Optin: false,
    totalIpipResponses: 25,
    completedScales: [
      { scale_id: "rosenberg", instrument: "Rosenberg1965", scale_name: null, facet_name: null, display_label_ja: "Rosenberg 自尊感情", band: "mid" as const, interpretation_short: "自尊感情 中程度" },
      { scale_id: "swls", instrument: "SWLS", scale_name: null, facet_name: null, display_label_ja: "人生満足度", band: "high" as const, interpretation_short: "人生満足度 高め" },
      { scale_id: "neo_anxiety", instrument: "NEO", scale_name: "Neuroticism", facet_name: "Anxiety", display_label_ja: "不安", band: "low" as const, interpretation_short: "不安傾向 低め (落ち着き型)" },
    ],
  }),
);

console.log("\n\n=== Test 2: 多数 scale (12 件) → extreme + domain 上位 10 件 ===\n");
console.log(
  summarizeProfile({
    profile: null,
    phq9K6Optin: false,
    totalIpipResponses: 200,
    completedScales: Array.from({ length: 12 }, (_, i) => ({
      scale_id: `test_${i}`,
      instrument: "TEST",
      scale_name: i % 2 === 0 ? "Domain" + i : null,
      facet_name: i % 2 === 0 ? null : "Facet" + i,
      display_label_ja: `テスト ${i}`,
      band: (i < 3 ? "high" : i < 6 ? "low" : "mid") as "high" | "low" | "mid",
      interpretation_short: `テスト${i} ${i < 3 ? "高め" : i < 6 ? "低め" : "中程度"}`,
    })),
  }),
);

console.log("\n\n=== Test 3: 対話途中の受験 (= lastAssistantTurnAt 指定) ===\n");
const now = Date.now();
console.log(
  summarizeProfile({
    profile: null,
    phq9K6Optin: false,
    totalIpipResponses: 50,
    lastAssistantTurnAt: now - 60 * 60 * 1000, // 1 時間前
    completedScales: [
      // 1 週間前に受けた既存 scale
      { scale_id: "rosenberg", instrument: "Rosenberg1965", scale_name: null, facet_name: null, display_label_ja: "Rosenberg", band: "mid" as const, interpretation_short: "自尊感情 中程度", latest_answered_at: now - 7 * 24 * 60 * 60 * 1000 },
      { scale_id: "swls", instrument: "SWLS", scale_name: null, facet_name: null, display_label_ja: "SWLS", band: "high" as const, interpretation_short: "人生満足度 高め", latest_answered_at: now - 7 * 24 * 60 * 60 * 1000 },
      // 対話の最中に受験した新規 scale (= 30 分前)
      { scale_id: "neo_anxiety", instrument: "NEO", scale_name: "Neuroticism", facet_name: "Anxiety", display_label_ja: "NEO/不安", band: "high" as const, interpretation_short: "不安傾向 高め (心配しやすい)", latest_answered_at: now - 30 * 60 * 1000 },
      { scale_id: "neo_self_efficacy", instrument: "NEO", scale_name: "Conscientiousness", facet_name: "Self-Efficacy", display_label_ja: "NEO/自己効力感", band: "low" as const, interpretation_short: "自己効力感 低め", latest_answered_at: now - 25 * 60 * 1000 },
    ],
  }),
);

console.log("\n\n=== Test 4: ゼロ scale (= 完走 0 件) → section 出ない ===\n");
console.log(
  summarizeProfile({
    profile: null,
    phq9K6Optin: false,
    totalIpipResponses: 5,
    completedScales: [],
  }) || "(empty)",
);
