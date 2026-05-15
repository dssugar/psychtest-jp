/**
 * POST /uranai/interpret
 * Body: { cards: Array<{ name_ja: string; orientation: "upright" | "reversed"; upright_meaning: string; reversed_meaning: string }> }
 * Returns: { interpretation: string } or { error: string }
 *
 * 自宅 vLLM (OpenAI 互換) を Cloudflare Tunnel + Cloudflare Access の service token 経由で叩いて
 * 3 枚のタロットを統合解釈する wedge.
 *
 * 認証は 2 段:
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

const SYSTEM_PROMPT = `あなたは経験豊富なタロット占い師です。クライアントが引いた 3 枚のカードを「過去・現在・未来」の流れとして読み、ひとつの物語として繋ぎ合わせて解釈してください。

ルール:
- 「1 枚目は〜、2 枚目は〜」と機械的に並べない。3 枚の関係性を物語として紡ぐ
- 日本語で 250〜400 字
- 占いとしての読み応えを重視する。象徴的・詩的な表現を使ってよい
- 各カードの正位置・逆位置の意味を尊重する
- 断定しすぎず、希望と注意のバランスを取る
- 「あなた」に向けて語りかける文体`;

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

  let body: { cards?: CardInput[] };
  try {
    body = await context.request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const cards = body.cards;
  if (!Array.isArray(cards) || cards.length !== 3) {
    return json({ error: "cards must be an array of 3 items" }, 400);
  }

  const userPrompt = buildUserPrompt(cards);

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
        max_tokens: 1024,
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

function buildUserPrompt(cards: CardInput[]): string {
  const positions = ["過去", "現在", "未来"];
  const lines = cards.map((c, i) => {
    const meaning = c.orientation === "upright" ? c.upright_meaning : c.reversed_meaning;
    const posLabel = c.orientation === "upright" ? "正位置" : "逆位置";
    return `${positions[i]}（${c.name_ja}・${posLabel}）: ${meaning}`;
  });
  return `以下 3 枚のタロットカードが引かれました。これらを「過去 → 現在 → 未来」の物語として統合解釈してください。\n\n${lines.join("\n")}`;
}

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
