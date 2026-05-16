/**
 * vLLM client helper (Cloudflare Pages Functions 側).
 *
 * 自宅 vLLM (OpenAI 互換) を Cloudflare Tunnel + Cloudflare Access service token 経由で
 * 叩くための 2 段認証を 1 か所にまとめる. 元は interpret.ts / chat.ts に重複していた.
 *
 * 認証 (順):
 *   1. CF-Access-Client-Id / CF-Access-Client-Secret で Access policy を通過
 *   2. Authorization: Bearer <VLLM_API_KEY> で vLLM 本体の api-key を通過
 */

export interface VLLMEnv {
  LLM_BASE_URL: string;
  LLM_MODEL: string;
  VLLM_API_KEY: string;
  CF_ACCESS_CLIENT_ID: string;
  CF_ACCESS_CLIENT_SECRET: string;
}

export interface ChatMsg {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface CallVLLMOptions {
  messages: ChatMsg[];
  maxTokens?: number; // default 1536
  temperature?: number; // default 0.8
}

export interface CallVLLMResult {
  ok: true;
  reply: string;
}

export interface CallVLLMError {
  ok: false;
  status: number;
  error: string;
}

/**
 * env が揃っているかチェック. 不足を string[] で返す (空配列 = OK).
 */
export function checkEnv(env: Partial<VLLMEnv>): string[] {
  return [
    !env.LLM_BASE_URL && "LLM_BASE_URL",
    !env.LLM_MODEL && "LLM_MODEL",
    !env.VLLM_API_KEY && "VLLM_API_KEY",
    !env.CF_ACCESS_CLIENT_ID && "CF_ACCESS_CLIENT_ID",
    !env.CF_ACCESS_CLIENT_SECRET && "CF_ACCESS_CLIENT_SECRET",
  ].filter(Boolean) as string[];
}

/**
 * vLLM /chat/completions を叩いて 1 文字列を返す. ストリーミングは未対応 (α scope 外).
 */
export async function callVLLM(
  env: VLLMEnv,
  { messages, maxTokens = 1536, temperature = 0.8 }: CallVLLMOptions,
): Promise<CallVLLMResult | CallVLLMError> {
  const baseUrl = env.LLM_BASE_URL.replace(/\/+$/, "");

  let upstream: Response;
  try {
    upstream = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "cf-access-client-id": env.CF_ACCESS_CLIENT_ID,
        "cf-access-client-secret": env.CF_ACCESS_CLIENT_SECRET,
        "authorization": `Bearer ${env.VLLM_API_KEY}`,
      },
      body: JSON.stringify({
        model: env.LLM_MODEL,
        max_tokens: maxTokens,
        temperature,
        messages,
      }),
    });
  } catch (e) {
    return {
      ok: false,
      status: 502,
      error: `Fetch failed: ${e instanceof Error ? e.message : String(e)}`,
    };
  }

  if (!upstream.ok) {
    const detail = await upstream.text();
    return {
      ok: false,
      status: 502,
      error: `Upstream ${upstream.status}: ${detail.slice(0, 500)}`,
    };
  }

  const data = (await upstream.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const reply = data.choices?.[0]?.message?.content?.trim() ?? "";

  if (!reply) {
    return { ok: false, status: 502, error: "Empty response from LLM" };
  }

  return { ok: true, reply };
}

/**
 * JSON Response 組立 helper. 全 endpoint で使う.
 */
export function jsonResponse(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
