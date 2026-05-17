/**
 * Phase 2.x.H verification: profile-summarizer に completedScales を渡したときの
 * 出力 section が期待形式かを確認する手動 smoke test.
 */
import { summarizeProfile } from "@/lib/uranai/profile-summarizer";

const sample = {
  profile: null,
  phq9K6Optin: false,
  totalIpipResponses: 50,
  completedScales: [
    { scale_id: "neo_anxiety", instrument: "NEO", scale_name: "Neuroticism", facet_name: "Anxiety", display_label_ja: "IPIP-NEO-300 / 神経症傾向 / 不安", band: "high" as const, interpretation_short: "不安傾向 高め (心配しやすい)" },
    { scale_id: "rosenberg", instrument: "Rosenberg1965", scale_name: null, facet_name: null, display_label_ja: "Rosenberg 自尊感情", band: "mid" as const, interpretation_short: "自尊感情 中程度" },
    { scale_id: "swls", instrument: "SWLS", scale_name: null, facet_name: null, display_label_ja: "人生満足度尺度", band: "high" as const, interpretation_short: "人生満足度 高め" },
    { scale_id: "bfas_neuroticism", instrument: "BFAS", scale_name: "Neuroticism", facet_name: null, display_label_ja: "BFAS / 神経症傾向", band: "high" as const, interpretation_short: "Neuroticism 高め" },
    { scale_id: "neo_self_efficacy", instrument: "NEO", scale_name: "Conscientiousness", facet_name: "Self-Efficacy", display_label_ja: "IPIP-NEO-300 / 誠実性 / 自己効力感", band: "low" as const, interpretation_short: "自己効力感 低め" },
  ],
};

const out = summarizeProfile(sample);
console.log("=== profile summary output ===\n");
console.log(out);
console.log("\n=== bytes ===", new TextEncoder().encode(out).length);
