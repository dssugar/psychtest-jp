#!/usr/bin/env node
/**
 * One-shot eval orchestrator.
 *
 * 1. .dev.vars 存在チェック (vLLM secrets が無いと chat.ts が 500 を返す)
 * 2. `npm run preview` を子プロセスグループとして spawn
 * 3. http://localhost:8788/ が応答するまで poll
 * 4. `node tests/eval/run.mjs` を inherit stdio で起動
 * 5. eval の exit code を保持しつつ preview を SIGTERM → SIGKILL で確実に殺す
 *
 * 例外: SIGINT (Ctrl-C) でも teardown を走らせる。
 *
 * env:
 *   EVAL_FULL_VERBOSE=1   preview の stdout/stderr を全部流す (default: tail only on failure)
 *   EVAL_HEALTH_TIMEOUT   preview 起動待ち ms (default: 240000 = 4 min, build 込み余裕)
 *   EVAL_HEALTH_URL       health probe URL (default: http://localhost:8788/)
 *   全 process.env が eval 側にも継承される (EVAL_TARGET, EVAL_CATEGORY 等)
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";

const HEALTH_URL = process.env.EVAL_HEALTH_URL ?? "http://localhost:8788/";
const HEALTH_TIMEOUT_MS = Number(process.env.EVAL_HEALTH_TIMEOUT ?? 240_000);
const POLL_MS = 2000;
const VERBOSE = process.env.EVAL_FULL_VERBOSE === "1";

const log = (m) => console.log(`[eval:full] ${m}`);
const err = (m) => console.error(`[eval:full] ${m}`);

async function waitForHealth() {
  const start = Date.now();
  while (Date.now() - start < HEALTH_TIMEOUT_MS) {
    try {
      const res = await fetch(HEALTH_URL, { signal: AbortSignal.timeout(3000) });
      return { ok: true, status: res.status };
    } catch {
      // not yet
    }
    await new Promise((r) => setTimeout(r, POLL_MS));
  }
  return { ok: false };
}

async function main() {
  if (!existsSync(".dev.vars")) {
    err(".dev.vars が見つかりません。`.dev.vars.example` を参考に作成してください。");
    err("(VLLM_API_KEY / CF_ACCESS_CLIENT_ID / CF_ACCESS_CLIENT_SECRET の 3 つを記入)");
    process.exit(2);
  }

  log("spawning npm run preview ...");
  const preview = spawn("npm", ["run", "preview"], {
    stdio: VERBOSE ? "inherit" : ["ignore", "pipe", "pipe"],
    detached: true, // 新プロセスグループ。kill(-pid) で子孫まとめて殺せる
    env: process.env,
  });

  let recentLog = "";
  if (!VERBOSE) {
    const cap = (chunk) => {
      recentLog = (recentLog + chunk.toString()).slice(-4096);
    };
    preview.stdout?.on("data", cap);
    preview.stderr?.on("data", cap);
  }

  let teardownCalled = false;
  const teardown = (label) => {
    if (teardownCalled) return;
    teardownCalled = true;
    if (preview.pid && !preview.killed) {
      log(`tearing down preview (${label}, pgid=${preview.pid})`);
      try {
        process.kill(-preview.pid, "SIGTERM");
      } catch {}
      setTimeout(() => {
        try {
          process.kill(-preview.pid, "SIGKILL");
        } catch {}
      }, 3000).unref();
    }
  };

  process.on("SIGINT", () => {
    teardown("SIGINT");
    setTimeout(() => process.exit(130), 500).unref();
  });
  process.on("SIGTERM", () => {
    teardown("SIGTERM");
    setTimeout(() => process.exit(143), 500).unref();
  });

  log(`waiting for ${HEALTH_URL} (timeout ${HEALTH_TIMEOUT_MS}ms) ...`);
  const health = await waitForHealth();
  if (!health.ok) {
    err(`preview did not become healthy in ${HEALTH_TIMEOUT_MS}ms`);
    if (!VERBOSE && recentLog) {
      err("--- preview log tail (last 4KB) ---");
      console.error(recentLog);
    }
    teardown("timeout");
    process.exit(2);
  }
  log(`preview up (HTTP ${health.status}) — running eval ...`);

  const evalProc = spawn("node", ["tests/eval/run.mjs"], {
    stdio: "inherit",
    env: process.env,
  });
  const exitCode = await new Promise((r) => evalProc.on("close", (c) => r(c ?? 0)));

  teardown("done");
  await new Promise((r) => setTimeout(r, 500));
  process.exit(exitCode);
}

main().catch((e) => {
  err(`crashed: ${e?.stack ?? e}`);
  process.exit(2);
});
