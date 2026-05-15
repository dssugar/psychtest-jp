/**
 * POST /uranai/chat
 * Body: {
 *   messages: Array<{ role: "user" | "assistant", content: string }>,
 *   divinationContext: {
 *     tarot:      Array<{ name_ja, orientation, upright_meaning, reversed_meaning }>,
 *     numerology: { lifePath, lifePathMeaning, personalDay, personalDayMeaning },
 *     kyusei:     { honmeisho: {...}, todayStar: {...}, fortune, fortuneKeyword }
 *   }
 * }
 * Returns: { reply: string } or { error: string }
 *
 * Phase 1.7 wedge: 専属占い師として継続対話する stateless chat endpoint.
 *
 * - messages が空の時は LLM が初回挨拶 + 3 流派統合解釈を生成する
 * - messages が空でない時は会話継続、divinationContext を毎回 system prompt に injection
 * - 会話履歴は client 側で保持、毎リクエストで全送 (stateless / no DB)
 * - vLLM 認証は既存の Cloudflare Access service token + Bearer api-key 2 段認証を踏襲
 */

interface Env {
  LLM_BASE_URL: string;
  LLM_MODEL: string;
  VLLM_API_KEY: string;
  CF_ACCESS_CLIENT_ID: string;
  CF_ACCESS_CLIENT_SECRET: string;
}

type Role = "user" | "assistant";

interface ChatMessage {
  role: Role;
  content: string;
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

interface DivinationContext {
  tarot: CardInput[];
  numerology: NumerologyInput;
  kyusei: KyuseiInput;
}

interface RequestBody {
  messages?: ChatMessage[];
  divinationContext?: DivinationContext;
}

const MAX_HISTORY = 80; // 安全弁: 暴走時の token 爆発を防ぐ

function buildSystemPrompt(ctx: DivinationContext): string {
  const positions = ["過去", "現在", "未来"];
  const tarotLines = ctx.tarot.map((c, i) => {
    const meaning = c.orientation === "upright" ? c.upright_meaning : c.reversed_meaning;
    const posLabel = c.orientation === "upright" ? "正位置" : "逆位置";
    return `  ${positions[i]} — ${c.name_ja}・${posLabel}: ${meaning}`;
  }).join("\n");

  return `あなたは "専属占い師" です。クライアントの生年月日からタロット 3 枚引き・数秘術・九星気学の 3 流派を pre-compute した結果を以下に保持しています。これらを統合的に踏まえ、クライアントと自然な会話を続けてください。

【今回のクライアントの占術結果】

タロット 3 枚引き:
${tarotLines}

数秘術:
  ライフパスナンバー: ${ctx.numerology.lifePath} — ${ctx.numerology.lifePathMeaning}
  今日のパーソナルデイ: ${ctx.numerology.personalDay} — ${ctx.numerology.personalDayMeaning}

九星気学:
  本命星: ${ctx.kyusei.honmeisho.name} (五行: ${ctx.kyusei.honmeisho.element}) — ${ctx.kyusei.honmeisho.symbol}
  今日の日盤: ${ctx.kyusei.todayStar.name} (五行: ${ctx.kyusei.todayStar.element}) — ${ctx.kyusei.todayStar.symbol}
  本命星 ↔ 日盤の五行関係: ${ctx.kyusei.fortune} — ${ctx.kyusei.fortuneKeyword}

【会話のルール】
- 会話履歴がまだ空の時 (= これが最初のターン) は、占い師として自己紹介をしつつ 3 流派の共通項を 1 つの物語として統合した解釈をクライアントに伝え、最後に「他に気になっていることがあれば聞かせてください」と促してください。文字数は 400-600 字を目安。
- 会話履歴がある時は、占い師として自然に応答してください。クライアントの相談内容に対し、必要に応じて上の 3 流派結果を引用・参照しながら答えてください。
- 「タロットでは〇〇、数秘術では〇〇」と機械的に並べない。共通項やテーマで紡ぐ。
- クライアントが「カードを引き直してほしい」「他の占いをしてほしい」と言った場合、現 wedge では実際の再引き API はないため、物語上で「では新たに引いてみましょう…」と仮想的に引いた結果を語って構いません (ただし上の 3 枚の象徴と整合的に)。
- 「あなた」に向けて語りかける親しみやすい文体。
- 断定しすぎず、希望と注意のバランスを取る。
- メンタルヘルスの重い相談 (自傷念慮 / 強い抑うつ / 自殺念慮など) が出てきた場合は、占いの言葉と並行して必ず「専門家への相談を強く勧める」旨を伝えてください。
- 1 回の応答は 200-500 字を目安。長すぎず、対話のリズムを保つ。`;
}

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

  const messages = body.messages ?? [];
  const ctx = body.divinationContext;
  if (!ctx || !Array.isArray(ctx.tarot) || ctx.tarot.length !== 3) {
    return json({ error: "divinationContext.tarot must contain 3 cards" }, 400);
  }
  if (!ctx.numerology || typeof ctx.numerology.lifePath !== "number") {
    return json({ error: "divinationContext.numerology malformed" }, 400);
  }
  if (!ctx.kyusei?.honmeisho?.name || !ctx.kyusei?.fortune) {
    return json({ error: "divinationContext.kyusei malformed" }, 400);
  }

  // role の安全 sanitize: assistant か user 以外は弾く. content も最低限の空チェック
  const cleanedMessages: ChatMessage[] = messages
    .filter((m): m is ChatMessage => {
      return (m?.role === "user" || m?.role === "assistant") && typeof m?.content === "string" && m.content.length > 0;
    })
    .slice(-MAX_HISTORY);

  const systemPrompt = buildSystemPrompt(ctx);

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
          { role: "system", content: systemPrompt },
          ...cleanedMessages,
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
    const reply = data.choices?.[0]?.message?.content?.trim() ?? "";

    if (!reply) {
      return json({ error: "Empty response from LLM" }, 502);
    }

    return json({ reply }, 200);
  } catch (e) {
    return json({ error: `Fetch failed: ${e instanceof Error ? e.message : String(e)}` }, 502);
  }
};

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
