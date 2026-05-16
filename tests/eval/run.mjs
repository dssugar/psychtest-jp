#!/usr/bin/env node
/**
 * Prompt-injection eval runner.
 *
 * Usage:
 *   node tests/eval/run.mjs
 *   EVAL_CATEGORY=tag-closure node tests/eval/run.mjs
 *   EVAL_TARGET=https://example.com/uranai/chat node tests/eval/run.mjs
 *   EVAL_VERBOSE=1 node tests/eval/run.mjs   # 全 response を表示
 *
 * 前提: 別 terminal で `npm run preview` (wrangler pages dev) を起動済。
 *      .dev.vars に LLM_BASE_URL / VLLM_API_KEY / CF_ACCESS_CLIENT_ID/SECRET 設定済。
 */

import { cases } from "./cases.mjs";
import { divinationContext } from "./fixtures.mjs";
import { ruleBasedJudge } from "./judges.mjs";

const TARGET = process.env.EVAL_TARGET ?? "http://localhost:8788/uranai/chat";
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

async function runCase(testCase) {
  const start = Date.now();
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(TARGET, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        messages: testCase.messages,
        divinationContext,
      }),
      signal: ctrl.signal,
    });
    clearTimeout(t);

    const elapsed = Date.now() - start;

    if (!res.ok) {
      const detail = await res.text();
      return {
        testCase,
        elapsed,
        status: "error",
        failedRules: [`HTTP ${res.status}: ${detail.slice(0, 200)}`],
        response: null,
      };
    }

    const json = await res.json();
    const reply = (json.reply ?? "").trim();
    if (!reply) {
      return {
        testCase,
        elapsed,
        status: "error",
        failedRules: ["empty reply"],
        response: null,
      };
    }

    const judge = ruleBasedJudge(reply, testCase);
    const status = judge.pass ? "pass" : testCase.softFail ? "warn" : "fail";

    return {
      testCase,
      elapsed,
      status,
      failedRules: judge.failedRules,
      response: reply,
    };
  } catch (e) {
    clearTimeout(t);
    return {
      testCase,
      elapsed: Date.now() - start,
      status: "error",
      failedRules: [`exception: ${e instanceof Error ? e.message : String(e)}`],
      response: null,
    };
  }
}

async function main() {
  const filter = process.env.EVAL_CATEGORY;
  const filtered = filter ? cases.filter((tc) => tc.category === filter) : cases;

  console.log(c(`\n=== Prompt Injection Eval ===`, "bold"));
  console.log(c(`Target: ${TARGET}`, "dim"));
  console.log(c(`Cases : ${filtered.length}${filter ? ` (category=${filter})` : ""}\n`, "dim"));

  const results = [];
  for (const tc of filtered) {
    process.stdout.write(
      `${c(`[${tc.id}]`, "dim")} ${tc.category.padEnd(22)} `,
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
