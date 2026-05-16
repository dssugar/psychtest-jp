/**
 * POST /uranai/draw   — 3 流派 one-shot 解釈生成 + D1 save (旧 interpret.ts 後継).
 * GET  /uranai/draw?id=<result_id>  — シェアページ用に保存済 draw を取得.
 *
 * α wedge: 旧 /uranai-proto と同等の機能を新 path に移植 + 結果を D1 に永続化して
 * `/uranai/draw/[resultId]` shareable URL を成立させる. OG 画像生成は β scope へ punt.
 *
 * POST body:
 *   {
 *     deviceId: string,
 *     tarot:      CardInput[3],
 *     numerology: NumerologyInput,
 *     kyusei:     KyuseiInput,
 *   }
 * POST returns: { interpretation: string, resultId: string }
 *
 * GET returns: { resultId, type, inputs, interpretation, createdAt }
 */

import { checkEnv, callVLLM, jsonResponse, type VLLMEnv } from "../_lib/vllm";
import { saveDivinationResult, getDivinationResult } from "../_lib/d1";
import type { DivinationContext } from "../../lib/uranai/types";

interface Env extends VLLMEnv {
  DB: D1Database;
}

const SYSTEM_PROMPT = `あなたは経験豊富な占い師です。クライアントから「タロット 3 枚引き」「数秘術」「九星気学」の 3 つの流派の結果が同時に渡されます。3 流派が共通して指し示しているテーマや象徴を抽出し、それを軸にして 1 つの物語として読み解いてください。

ルール:
- 「タロットでは〇〇、数秘術では〇〇、九星気学では〇〇」と機械的に並べない
- 3 流派それぞれの結果を尊重しつつ、それらが交差する共通項 (キーワード・テーマ・方向性) を見出し、その共通項を物語の核に据える
- 共通項が見えにくいときは、3 流派が互いに補い合う関係性 (例: タロットが現在の感情を、数秘術が魂の方向性を、九星気学が今日の風向きを示している) として統合する
- 日本語で 400〜600 字
- 象徴的・詩的な表現を使ってよいが、占い文として読み応えがあること
- 「あなた」に向けて語りかける文体
- 断定しすぎず、希望と注意のバランスを取る`;

const POSITION_LABELS = ["過去", "現在", "未来"];

export const onRequest: PagesFunction<Env> = async (context) => {
  const method = context.request.method;
  if (method === "GET") return handleGet(context);
  if (method === "POST") return handlePost(context);
  return jsonResponse({ error: "GET or POST only" }, 405);
};

async function handleGet(context: Parameters<PagesFunction<Env>>[0]): Promise<Response> {
  if (!context.env.DB) return jsonResponse({ error: "Missing D1 binding: DB" }, 500);

  const url = new URL(context.request.url);
  const id = url.searchParams.get("id");
  if (!id) return jsonResponse({ error: "id query param required" }, 400);

  const row = await getDivinationResult(context.env.DB, id);
  if (!row) return jsonResponse({ error: "not found" }, 404);

  let inputs: unknown;
  try {
    inputs = JSON.parse(row.inputs);
  } catch {
    inputs = null;
  }

  return jsonResponse(
    {
      resultId: row.result_id,
      type: row.type,
      inputs,
      interpretation: row.interpretation,
      createdAt: row.created_at,
    },
    200,
  );
}

interface PostBody {
  deviceId?: string;
  tarot?: DivinationContext["tarot"];
  numerology?: DivinationContext["numerology"];
  kyusei?: DivinationContext["kyusei"];
}

async function handlePost(context: Parameters<PagesFunction<Env>>[0]): Promise<Response> {
  const missing = checkEnv(context.env);
  if (missing.length > 0) {
    return jsonResponse({ error: `Missing env: ${missing.join(", ")}` }, 500);
  }
  if (!context.env.DB) return jsonResponse({ error: "Missing D1 binding: DB" }, 500);

  let body: PostBody;
  try {
    body = await context.request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const deviceId = typeof body.deviceId === "string" ? body.deviceId.trim() : "";
  if (!deviceId) return jsonResponse({ error: "deviceId required" }, 400);

  const { tarot, numerology, kyusei } = body;
  if (!Array.isArray(tarot) || tarot.length !== 3) {
    return jsonResponse({ error: "tarot must be an array of 3 items" }, 400);
  }
  if (
    !numerology ||
    typeof numerology.lifePath !== "number" ||
    typeof numerology.personalDay !== "number"
  ) {
    return jsonResponse({ error: "numerology payload missing or malformed" }, 400);
  }
  if (!kyusei?.honmeisho?.name || !kyusei?.todayStar?.name || !kyusei?.fortune) {
    return jsonResponse({ error: "kyusei payload missing or malformed" }, 400);
  }

  const userPrompt = buildUserPrompt(tarot, numerology, kyusei);

  const result = await callVLLM(context.env, {
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
  });
  if (!result.ok) return jsonResponse({ error: result.error }, result.status);

  const resultId = crypto.randomUUID();
  await saveDivinationResult(context.env.DB, {
    resultId,
    deviceId,
    type: "3systems",
    inputs: { tarot, numerology, kyusei },
    interpretation: result.reply,
  });

  return jsonResponse({ interpretation: result.reply, resultId }, 200);
}

function buildUserPrompt(
  tarot: DivinationContext["tarot"],
  numerology: DivinationContext["numerology"],
  kyusei: DivinationContext["kyusei"],
): string {
  const tarotLines = tarot
    .map((c, i) => {
      const meaning = c.orientation === "upright" ? c.upright_meaning : c.reversed_meaning;
      const posLabel = c.orientation === "upright" ? "正位置" : "逆位置";
      return `  ${POSITION_LABELS[i]} — ${c.name_ja}・${posLabel}: ${meaning}`;
    })
    .join("\n");

  return `以下、3 流派の占術結果です。共通テーマを抽出し、ひとつの物語として統合解釈してください。

【タロット 3 枚引き】
${tarotLines}

【数秘術】
  ライフパスナンバー: ${numerology.lifePath} — ${numerology.lifePathMeaning}
  今日のパーソナルデイ: ${numerology.personalDay} — ${numerology.personalDayMeaning}

【九星気学】
  本命星: ${kyusei.honmeisho.name} (五行: ${kyusei.honmeisho.element}) — ${kyusei.honmeisho.symbol}
  今日の日盤: ${kyusei.todayStar.name} (五行: ${kyusei.todayStar.element}) — ${kyusei.todayStar.symbol}
  本命星 ↔ 日盤の五行関係: ${kyusei.fortune} — ${kyusei.fortuneKeyword}`;
}
