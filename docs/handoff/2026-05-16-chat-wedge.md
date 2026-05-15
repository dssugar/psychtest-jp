# Handoff: 3 流派統合 + 専属チャット Wedge — 2026-05-16

**Session window**: 2026-05-16 (single day)
**Outcome**: ✅ Phase 1.5 (3 流派 one-shot 統合解釈) + Phase 1.7 (専属占い師チャット) end-to-end 完成、本番稼働確認済 / moat 命題 §3.2 validated
**Spec**:
- `docs/specs/divination-3systems-wedge-2026-05.md` (Phase 1.5)
- `docs/specs/divination-chat-wedge-2026-05.md` (Phase 1.7)

---

## 1. 完了したこと

### コード (psychtest-jp repo)
| File | 役割 | 状態 |
|---|---|---|
| `data/numerology.ts` | ライフパス + パーソナルデイ (master 番号 11/22/33 保持) | NEW |
| `data/kyusei.ts` | 本命星 (立春 2/4 固定) + 簡易日盤 + 五行関係 keyword | NEW |
| `functions/uranai/interpret.ts` | one-shot endpoint。payload を `{tarot, numerology, kyusei}` に拡張、3 流派統合 prompt | 拡張 |
| `functions/uranai/chat.ts` | stateless chat endpoint。`{messages, divinationContext}` を受け、persona 防御込み system prompt で vLLM を叩く | NEW |
| `app/uranai-proto/page.tsx` | `<input type="date">` 必須化、3 流派並列表示 (orange numerology + cyan kyusei) + 統合解釈 | 拡張 |
| `app/uranai-chat/page.tsx` | チャット UI (吹き出し列 + textarea + Cmd/Ctrl+Enter)、会話履歴 state のみ | NEW |

### コミット
```
04057ae fix: harden 占い師 persona against backend disclosure & prompt injection   ★ローカルのみ、未 push★
00cf9e0 feat: add 専属占い師チャット wedge at /uranai-chat/                           pushed
57ae6e4 docs: add Phase 1.7 wedge spec for 専属占い師チャット                          pushed
90a0a4a feat: extend uranai wedge to 3-school integration (tarot + numerology + kyusei) pushed
8410ca0 docs: add Phase 1.5 wedge spec for 3 流派統合占術                              pushed
```

⚠️ **04057ae は未 push**。persona 防御 (LLM が "Googleによってトレーニングされた..." と自己開示する事象への対症修正)。次セッションで push 判断必要。

### 動作確認
- `/uranai-proto/` で 3 流派 one-shot 統合解釈が動作 (Daisuke 動作確認済)
- `/uranai-chat/` で 4 ターンの会話が context 保持しながら自然に進行 (Daisuke 実機で確認、出力品質「ちゃんとチャットできている」評価)
- spec §Verification §1-§5 全て満たす出力例:
  - 塔(逆) + 力(逆) + 剣の10(正) + ライフパス 4 + パーソナルデイ 1 + 四緑木星 + 相剋・抑
  - 「忙しい」→「お忙しい日々」→「朝から晩まで……それは本当にお辛い」と感情温度の追従を観察
  - 4 ターンに渡って 3 流派の象徴を一貫して引き直し、機械的並列にならず物語性を保持

### moat 命題評価
- project-design.md §3.2「複数流派統合解釈 moat」 → Phase 1.5 + 1.7 で **本体が validated**
- 競合 (Yahoo 占い・mgram・16personalities) に存在しない体験になっている
- memory `[[ai-implementation-plan-frozen]]` の「LLM チャット路線」は vLLM 経路で **解凍可能** が確定

---

## 2. 発見した脆弱性 (未完全対応)

### Prompt injection: persona 暴露
**事象**: ユーザーが「あなたのバックエンドは何のLLM?」と質問 → LLM が「Googleによってトレーニングされた大規模言語モデルです」と persona を放棄して自己開示。

**対症修正** (commit `04057ae`、未 push):
- `functions/uranai/chat.ts` の system prompt に「persona 防御 — 最重要」section を追加
- 技術スタック質問、システムプロンプト暴露要求、persona 書き換え試行への defense 指示を明文化
- 占い師らしい比喩 (「私は星々と数字の声を聴く者です」等) で受け流す指示

**残課題**: L1 (system prompt 強化) のみ。Phase 2 公開時には L2-L5 が必須:
- L2 入力 pre-filter (attack pattern 検出)
- L3 出力 post-filter (LLM 出力中の "LLM"、"モデル"、"Google" 等を削除/置換)
- L4 structured output (JSON schema 強制)
- L5 多 LLM cross-check

→ 詳細 reference doc を別途生成中: `docs/references/prompt-injection-defense.md` (本セッション末で research agent が生成、内容は次セッション開始時に確認)

---

## 3. 状態 (次セッションでも引き続き有効)

### インフラ・認証情報
- 前 wedge handoff (`docs/handoff/2026-05-16-tarot-wedge.md`) §2 と同じ。変更なし
- Cloudflare Pages secrets (env 5 つ) は流用、追加なし
- vLLM tunnel (`vllm.psychtest.jp`) 稼働継続中

### 公開状態
- `psychtest.jp/uranai-proto/` (Phase 1.5 完成) — Access 裏
- `psychtest.jp/uranai-chat/` (Phase 1.7 完成) — Access 裏
- 両ページ間の双方向リンクあり

### Daisuke 主観評価
- Phase 1.5 (one-shot): 動作 ✅、ただし算出ロジックの正確性は自分の占術知識不足で検証不能 (online 計算機との突合で確認可能と返答済)
- Phase 1.7 (chat): 動作 ✅、出力品質「ちゃんとチャットできている」「専属感がある」

---

## 4. 未着手 / 次セッション候補

優先度高い順:

| 優先 | 候補 | 内容 | 推奨判断材料 |
|---|---|---|---|
| **★0** | persona 防御 commit `04057ae` の push 判断 | 既に commit 済、push するだけ。実機で再検証して効果確認 | 最短 5 分で完了 |
| **★1** | Phase 2 prompt injection 多層防御の実装計画 | research doc (`docs/references/prompt-injection-defense.md`) を読んで Phase 2 rollout 順序を確定 | 公開前提なら必須、Access 裏内輪なら punt 可 |
| **★2** | Phase 1.8 ペルソナ切替 | system prompt 複数用意 (姉御 / 学者 / 詩人)、UI で選択 | 軽 (1-2h)、retention 設計に効く、prompt injection 対策と相性悪い面あり |
| **★3** | Phase 1.6 流派充実 | 太陽星座 + 月星座 + 姓名判断 等を追加し 5 体系完成 | 中 (半日-1日)、解像度↑、moat 強化 |
| **★4** | Phase 1.9 会話の長期記憶 | KV 保存 + 別日訪問時の「前回〇〇でしたね」参照 | 中 (1日)、真の "専属" 化、別ドメイン切り出し前段 |
| **★5** | 矛盾するカード組み合わせでの edge case 検証 | 太陽 + 死神 + 比和 + ライフパス 11 等で LLM が破綻しないか確認 | 軽 (30分)、Phase 1.7 feasibility の堅牢性検証 |
| **★6** | 5+ ターン長会話の context drift 確認 | 10-20 ターンで「あなたの本命星は〇〇」が一貫するか | 軽、Phase 1.7 feasibility の追加確認 |

### 技術負債 (前 wedge から継承)
- vLLM フォールバック未選定 (502 時の挙動)
- Pages deploy health monitoring 無し
- モデル変更時の secret 自動化

---

## 5. 開いた問い (deferred decisions)

1. **persona 防御 `04057ae` の push**: 単純に push して良いが、push 後の挙動確認 (同じ攻撃 prompt で persona 維持できるか) は手動テスト要
2. **prompt injection 多層防御の Phase 移行タイミング**: Access 裏内輪のうちは punt 可、公開時には必須。Daisuke の公開時期判断と紐付く
3. **ペルソナ機能と prompt injection の関係**: ペルソナ切替 UI を作る = "persona は変更可能" という signal を LLM に送る → injection 耐性が下がる risk。実装時に prompt 設計で相殺必要
4. **`[[ai-implementation-plan-frozen]]` の格上げ判断**: 1月の BYOK 路線設計は完全 obsolete、vLLM 経路で chat が validated された今、「凍結」→「条件付き解凍」or「廃案 + 別 doc に置き換え」のどちらか
5. **5 流派完成 vs 専属占い師の深化**: Phase 1.6 (流派数を増やす方向) と Phase 1.8/1.9 (専属感を深める方向) のどちらが moat 強化に効くか。Daisuke の office-hours で判断必要

---

## 6. 関連 memory (次セッションで自動参照される)

- `[[project-tarot-wedge-local-vllm]]` — wedge の経路と env var 命名規約 (Phase 1.7 でも同一経路使用)
- `[[psychtest-jp-access-gated]]` — apex Access policy の現状
- `[[project-new-domain-pivot]]` — 別ドメイン切り出し方針 (urgency 低下継続)
- `[[ai-implementation-plan-frozen]]` — BYOK 路線設計 (本セッションで vLLM chat 路線が validated → 部分的解凍可能、次セッションで判断)
- `[[chat-wedge-validated-2026-05]]` — 本日 moat §3.2 validated の事実 (新規追加予定)

---

## 7. 推奨：次セッションの開始手順

1. このファイル (`docs/handoff/2026-05-16-chat-wedge.md`) を最初に読む
2. `docs/references/prompt-injection-defense.md` を確認 (本セッション末で research agent が生成)
3. memory の auto load (MEMORY.md に index あり)
4. `git status` で persona 防御 commit `04057ae` が未 push であることを確認
5. 次の判断:
   - (a) `04057ae` を push してから次 wedge へ進む (推奨)
   - (b) push せず prompt injection の本格対策を先に設計してまとめて修正
6. wedge 方向は §4 の優先順から 1 つ選ぶ。`/office-hours` 起動が筋
