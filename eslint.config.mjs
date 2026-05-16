// ESLint 9 flat config (= TypeScript + JS minimal lint).
//
// 注: eslint-config-next の next/core-web-vitals は FlatCompat 経由で読むと
// eslint-plugin-react の self-reference で circular structure error が起きる
// (= eslint-config-next の flat config 公式対応待ち). next 固有 rule (no-img-element
// 等) は失うが、core TypeScript lint は維持. 必要になったら next preset 復帰検討.

import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [
      ".next/**",
      "out/**",
      ".wrangler/**",
      "node_modules/**",
      "tests/eval/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // 占い / 心理テストコードで意図的に許容するもの
    rules: {
      // <img> 警告は next preset を入れたら復活させる
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      }],
    },
  },
];
