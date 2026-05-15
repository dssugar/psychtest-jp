/**
 * POST /uranai/interpret
 * Body: {
 *   tarot:      Array<{ name_ja, orientation, upright_meaning, reversed_meaning }>;
 *   numerology: { lifePath, lifePathMeaning, personalDay, personalDayMeaning };
 *   kyusei:     { honmeisho: { number, name, element, symbol },
 *                 todayStar: { number, name, element, symbol },
 *                 fortune, fortuneKeyword };
 * }
 * Returns: { interpretation: string } or { error: string }
 *
 * Phase 1.5 wedge: タロット 3 枚 + 数秘術 + 九星気学 の 3 流派並列結果を受け取り、
 * 共通テーマを軸に 1 つの物語として統合解釈する.
 *
 * 自宅 vLLM (OpenAI 互換) を Cloudflare Tunnel + Cloudflare Access の service token 経由で呼ぶ.
 * 認証 2 段:
 *   1. CF-Access-Client-Id / CF-Access-Client-Secret で Access policy を通過
 *   2. Authorization: Bearer <VLLM_API_KEY> で vLLM 本体の api-key を通過
 */

interface Env {
  LLM_BASE_URL: string;
  LLM_MODEL: string;
  VLLM_API_KEY: string;
  CF_ACCESS_CLIENT_ID: string;
  CF_ACCESS_CLIENT_SECRET: string;
}

interface CardInput {
  name_ja: string;
  orientation: "upright" | "reversed";
  upright_meaning: string;
  reversed_meaning: string;
}

interface NumerologyInput {
  lifePath: number;
  lifePathMeaning: string;
  personalDay: number;
  personalDayMeaning: string;
}

interface KyuseiStarInput {
  number: number;
  name: string;
  element: string;
  symbol: string;
}

interface KyuseiInput {
  honmeisho: KyuseiStarInput;
  todayStar: KyuseiStarInput;
  fortune: string;
  fortuneKeyword: string;
}

interface RequestBody {
  tarot?: CardInput[];
  numerology?: NumerologyInput;
  kyusei?: KyuseiInput;
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

export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method !== "POST") {
    return json({ error: "POST only" }, 405);
  }

  const baseUrl = context.env.LLM_BASE_URL?.replace(/\/+$/, "");
  const model = context.env.LLM_MODEL;
  const apiKey = context.env.VLLM_API_KEY;
  const accessId = context.env.CF_ACCESS_CLIENT_ID;
  const accessSecret = context.env.CF_ACCESS_CLIENT_SECRET;

  const missing = [
    !baseUrl && "LLM_BASE_URL",
    !model && "LLM_MODEL",
    !apiKey && "VLLM_API_KEY",
    !accessId && "CF_ACCESS_CLIENT_ID",
    !accessSecret && "CF_ACCESS_CLIENT_SECRET",
  ].filter(Boolean);
  if (missing.length > 0) {
    return json({ error: `Missing env: ${missing.join(", ")}` }, 500);
  }

  let body: RequestBody;
  try {
    body = await context.request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const { tarot, numerology, kyusei } = body;
  if (!Array.isArray(tarot) || tarot.length !== 3) {
    return json({ error: "tarot must be an array of 3 items" }, 400);
  }
  if (!numerology || typeof numerology.lifePath !== "number" || typeof numerology.personalDay !== "number") {
    return json({ error: "numerology payload is missing or malformed" }, 400);
  }
  if (!kyusei?.honmeisho?.name || !kyusei?.todayStar?.name || !kyusei?.fortune) {
    return json({ error: "kyusei payload is missing or malformed" }, 400);
  }

  const userPrompt = buildUserPrompt(tarot, numerology, kyusei);

  try {
    const upstream = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "cf-access-client-id": accessId,
        "cf-access-client-secret": accessSecret,
        "authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: 1536,
        temperature: 0.8,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!upstream.ok) {
      const detail = await upstream.text();
      return json({ error: `Upstream ${upstream.status}: ${detail.slice(0, 500)}` }, 502);
    }

    const data = (await upstream.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const interpretation = data.choices?.[0]?.message?.content?.trim() ?? "";

    if (!interpretation) {
      return json({ error: "Empty response from LLM" }, 502);
    }

    return json({ interpretation }, 200);
  } catch (e) {
    return json({ error: `Fetch failed: ${e instanceof Error ? e.message : String(e)}` }, 502);
  }
};

function buildUserPrompt(
  tarot: CardInput[],
  numerology: NumerologyInput,
  kyusei: KyuseiInput,
): string {
  const positions = ["過去", "現在", "未来"];
  const tarotLines = tarot.map((c, i) => {
    const meaning = c.orientation === "upright" ? c.upright_meaning : c.reversed_meaning;
    const posLabel = c.orientation === "upright" ? "正位置" : "逆位置";
    return `  ${positions[i]} — ${c.name_ja}・${posLabel}: ${meaning}`;
  }).join("\n");

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

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
