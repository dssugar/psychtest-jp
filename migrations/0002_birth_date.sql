-- Phase 1.9: 生年月日を profile に永続化.
-- 現状 /uranai/draw で毎回入力させる UX を解消.
-- format: 'YYYY-MM-DD' (= <input type="date"> の value、SQLite ソート可能).
-- nullable: NULL = 未設定 → draw page 側で入力プロンプト fallback.
-- 月読 chat の context 統合は β で別途検討 (α では draw のみ参照).

ALTER TABLE profiles ADD COLUMN birth_date TEXT;
