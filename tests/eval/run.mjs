#!/usr/bin/env node
/**
 * Prompt-injection eval runner (α wedge: 月読 + IPIP context 対応).
 *
 * Usage:
 *   node tests/eval/run.mjs
 *   EVAL_CATEGORY=tag-closure node tests/eval/run.mjs
 *   EVAL_TARGET=https://example.com/uranai/chat/tsukuyomi node tests/eval/run.mjs
 *   EVAL_VERBOSE=1 node tests/eval/run.mjs
 *
 * 前提:
 *   - 別 terminal で `npm run preview` (wrangler pages dev) を起動済.
 *   - `.dev.vars` に LLM_BASE_URL / VLLM_API_KEY / CF_ACCESS_CLIENT_ID/SECRET 設定済.
 *   - D1 local DB に migration 適用済 (`npm run db:migrate:local`).
 *
 * 旧 (Phase 1.7 stateless chat) との違い:
 *   - chat.ts は stateful (D1 hydrate). 各 case で fresh deviceId + sessionId を発行.
 *   - case.messages の user turns を順番に POST (assistant turns は server 自動生成).
 *   - 各 case で profile fixture (bigfive facets) を server に PUT して context として注入.
 */

import { cases } from "./cases.mjs";
import { divinationContext, profileFixture } from "./fixtures.mjs";
import { ruleBasedJudge } from "./judges.mjs";
import { randomUUID } from "node:crypto";

const TARGET = process.env.EVAL_TARGET ?? "http://localhost:8788/uranai/chat/tsukuyomi";
const PROFILE_TARGET = TARGET.replace(/\/uranai\/tsukuyomi\/chat$/, "/uranai/profile");
const TIMEOUT_MS = 60_000;
const VERBOSE = process.env.EVAL_VERBOSE === "1";

const COLORS = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
};
const isTTY = process.stdout.isTTY;
const c = (text, name) => (isTTY ? `${COLORS[name]}${text}${COLORS.reset}` : text);

/**
 * Fresh deviceId + sessionId で 1 case を走らせる.
 * - profile fixture を PUT
 * - case.messages の user turns を順番に POST、各 POST で server がアシスタント reply を生成
 * - 最後の assistant reply を judge に渡す
 */
async function runCase(testCase) {
  const start = Date.now();
  const deviceId = randomUUID();
  const sessionId = randomUUID();

  // 1. profile fixture を PUT (= 月読が IPIP context を持つ状態を作る)
  try {
    const pres = await fetch(PROFILE_TARGET, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        deviceId,
        testResults: profileFixture.tests,
        phq9K6Optin: false,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!pres.ok) {
      const detail = await pres.text();
      return {
        testCase,
        elapsed: Date.now() - start,
        status: "error",
        failedRules: [`profile PUT HTTP ${pres.status}: ${detail.slice(0, 200)}`],
        response: null,
      };
    }
  } catch (e) {
    return {
      testCase,
      elapsed: Date.now() - start,
      status: "error",
      failedRules: [`profile PUT exception: ${e instanceof Error ? e.message : String(e)}`],
      response: null,
    };
  }

  // 2. user turns を順番に POST (assistant turns は無視)
  const userTurns = testCase.messages.filter((m) => m.role === "user");
  if (userTurns.length === 0) {
    return {
      testCase,
      elapsed: Date.now() - start,
      status: "error",
      failedRules: ["no user turns in case.messages"],
      response: null,
    };
  }

  let lastReply = "";
  for (let i = 0; i < userTurns.length; i++) {
    const msg = userTurns[i];
    try {
      const res = await fetch(TARGET, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          deviceId,
          sessionId,
          newMessage: msg.content,
          divinationContext,
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!res.ok) {
        const detail = await res.text();
        return {
          testCase,
          elapsed: Date.now() - start,
          status: "error",
          failedRules: [`chat POST[${i}] HTTP ${res.status}: ${detail.slice(0, 200)}`],
          response: lastReply || null,
        };
      }
      const json = await res.json();
      const reply = (json.reply ?? "").trim();
      if (!reply) {
        return {
          testCase,
          elapsed: Date.now() - start,
          status: "error",
          failedRules: [`chat POST[${i}] empty reply`],
          response: null,
        };
      }
      lastReply = reply;
    } catch (e) {
      return {
        testCase,
        elapsed: Date.now() - start,
        status: "error",
        failedRules: [`chat POST[${i}] exception: ${e instanceof Error ? e.message : String(e)}`],
        response: lastReply || null,
      };
    }
  }

  const elapsed = Date.now() - start;
  const judge = ruleBasedJudge(lastReply, testCase);
  const status = judge.pass ? "pass" : testCase.softFail ? "warn" : "fail";

  // 3. eval session の D1 を後片付け (= 次回 case で profile/conversation 残骸が残らない)
  try {
    await fetch(`${PROFILE_TARGET}?deviceId=${encodeURIComponent(deviceId)}`, {
      method: "DELETE",
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    // 後片付け失敗は警告せず無視 (= 次回 D1 に増えるだけ、test 結果に影響なし)
  }

  return {
    testCase,
    elapsed,
    status,
    failedRules: judge.failedRules,
    response: lastReply,
  };
}

async function main() {
  const filter = process.env.EVAL_CATEGORY;
  const filtered = filter ? cases.filter((tc) => tc.category === filter) : cases;

  console.log(c(`\n=== Prompt Injection Eval (α: 月読 + IPIP) ===`, "bold"));
  console.log(c(`Target : ${TARGET}`, "dim"));
  console.log(c(`Profile: ${PROFILE_TARGET}`, "dim"));
  console.log(c(`Cases  : ${filtered.length}${filter ? ` (category=${filter})` : ""}\n`, "dim"));

  const results = [];
  for (const tc of filtered) {
    process.stdout.write(
      `${c(`[${tc.id}]`, "dim")} ${tc.category.padEnd(24)} `,
    );
    const r = await runCase(tc);
    results.push(r);
    const elapsedStr = c(`(${r.elapsed}ms)`, "dim");
    if (r.status === "pass") {
      console.log(`${c("PASS", "green")} ${elapsedStr}`);
    } else if (r.status === "warn") {
      console.log(`${c("WARN", "yellow")} ${elapsedStr} ${c("(soft-fail)", "dim")}`);
      console.log(c(`      └─ ${r.failedRules.join("; ")}`, "yellow"));
    } else if (r.status === "error") {
      console.log(`${c("ERR ", "red")} ${elapsedStr}`);
      console.log(c(`      └─ ${r.failedRules.join("; ")}`, "red"));
    } else {
      console.log(`${c("FAIL", "red")} ${elapsedStr}`);
      console.log(c(`      └─ ${r.failedRules.join("; ")}`, "red"));
    }
    if (r.response && (VERBOSE || r.status === "fail" || r.status === "warn")) {
      const preview = r.response.replace(/\s+/g, " ").slice(0, 240);
      const tail = r.response.length > 240 ? "..." : "";
      console.log(c(`      ↳ ${preview}${tail}`, "dim"));
    }
  }

  // Summary
  const counts = { pass: 0, fail: 0, warn: 0, error: 0 };
  const byCat = {};
  for (const r of results) {
    counts[r.status]++;
    const cat = r.testCase.category;
    byCat[cat] = byCat[cat] ?? { pass: 0, fail: 0, warn: 0, error: 0 };
    byCat[cat][r.status]++;
  }

  console.log(`\n${c("=== Summary ===", "bold")}`);
  console.log(
    `${c("PASS:", "green")} ${counts.pass}  ` +
      `${c("FAIL:", "red")} ${counts.fail}  ` +
      `${c("WARN:", "yellow")} ${counts.warn}  ` +
      `${c("ERR :", "red")} ${counts.error}  ` +
      c(`/ ${filtered.length}`, "dim"),
  );

  console.log(`\n${c("By category:", "bold")}`);
  for (const [cat, s] of Object.entries(byCat)) {
    console.log(
      `  ${cat.padEnd(24)} ` +
        `${c(String(s.pass).padStart(2) + " pass", "green")}  ` +
        `${c(String(s.fail).padStart(2) + " fail", "red")}  ` +
        `${c(String(s.warn).padStart(2) + " warn", "yellow")}  ` +
        `${c(String(s.error).padStart(2) + " err ", "red")}`,
    );
  }

  // Exit code: 非ゼロは fail or error 検出時 (warn は 0)
  const exitCode = counts.fail > 0 || counts.error > 0 ? 1 : 0;
  console.log();
  process.exit(exitCode);
}

main().catch((e) => {
  console.error(c("Runner crashed:", "red"), e);
  process.exit(2);
});
