# Uranai α: ComfyUI asset 生成 prompt メモ

α wedge の月読 (つくよみ) 立ち絵 + 背景を ComfyUI で生成するための prompt 例。

実装側 (`app/uranai/chat/tsukuyomi/page.tsx`) は以下のパスを参照:

- `/uranai/themes/tsukuyomi/character.svg` (立ち絵)
- `/uranai/themes/tsukuyomi/background.svg` (背景)

これらは現状 **placeholder SVG**。Daisuke が ComfyUI で PNG/WebP を生成したら同名 (拡張子だけ変更可) で差し替え、page.tsx の `src` 文字列を 1 行更新。

---

## 立ち絵 (月読・つくよみ) — `default.png`

### 仕様

- **portrait orientation** (480×720 〜 1080×1620、4:3 → 9:13 程度)
- **背景は透過 (PNG with alpha)** — 背景画像と重ねるため
- **構図**: 半身〜全身、画面下端切り取り OK
- **persona**: 静謐な男性、月夜の塔の住人、占い師
- **服装**: 西洋占星術師風 (ローブ / マント) と和の意匠 (襟元・帯) の融合
- **配色**: deep indigo / silver / ivory / 月光を反射する pale gold
- **表情**: 穏やかで内向的、わずかに微笑
- **小道具**: タロットカード or 西洋占星術の星図を片手に

### ComfyUI prompt 例

```
A serene male oracle, "Tsukuyomi", inhabitant of a moonlit tower.
Half-body portrait, transparent background.
Wearing a long indigo robe blended with japanese kimono elements (high collar, silver embroidery).
Hair: long, silver-black, loose.
Skin: pale, faintly luminous as if reflecting moonlight.
Expression: calm, contemplative, faint warm smile, eyes half-closed.
Holding tarot cards or an astrology chart loosely.
Color palette: deep indigo, midnight blue, ivory, pale gold accents.
Lighting: soft moonlight from above-left, gentle rim light.
Style: anime-realistic, painterly, high quality digital illustration.
Negative: harsh shadows, busy background, modern clothing, sci-fi elements, weapons,
multiple figures, extra hands.
```

### 表情差分 (β scope, α では default 1 枚のみで punt)

α が validate されたら β で 2-3 種を追加:
- `serene.png` — default 静謐
- `gentle-smile.png` — 占い結果を語る時の微笑
- `solemn.png` — 重い相談を受けとめる時の真剣

切り替え logic は β で rule-based (= 占い言及検知 → gentle-smile、メンタル重 → solemn、default → serene)。

---

## 背景 (月夜の塔) — `night-tower.png`

### 仕様

- **portrait orientation** (1080×1920 推奨、9:16)
- **不透明 PNG** または WebP
- **constellation / 月 / 塔** の三要素
- **配色**: 同 palette (deep indigo / silver / pale gold)

### ComfyUI prompt 例

```
A mystical moonlit night scene. A tall slender stone tower silhouetted against
a deep indigo sky. A full luminous moon hanging above the tower, soft halo of light.
Scattered stars across the sky, faint constellations. Warm orange glow from a
single window in the tower (the oracle's chamber).
Distant mountains barely visible at the bottom horizon, soft mist.
Color palette: deep indigo, midnight blue, ivory moon, pale gold star/window glow.
Style: anime-realistic, painterly, peaceful, contemplative atmosphere.
Aspect ratio: 9:16 portrait, mobile wallpaper composition.
Negative: people, harsh contrast, modern buildings, vehicles, text, banners.
```

---

## 差し替え手順

1. ComfyUI で生成 → 上記 spec を満たすことを目視確認
2. PNG / WebP として `public/uranai/themes/tsukuyomi/character.png` / `public/uranai/themes/tsukuyomi/background.png` に保存
3. `app/uranai/chat/tsukuyomi/page.tsx` 内の `default.svg` → `default.png`、`night-tower.svg` → `night-tower.png` に rewrite (2 か所)
4. `npm run dev` で表示確認 → mobile portrait / landscape / PC の 3 形態で破綻しないか確認
5. commit (`chore: replace placeholder uranai assets with ComfyUI renders`)

---

## 容量目安

- 立ち絵: 200-500 KB (透過 PNG)、最大 1 MB
- 背景: 300-700 KB (WebP 推奨)、最大 1.5 MB

これ以上重い場合は Cloudflare Images CDN 経由を検討 (β 以降)。
