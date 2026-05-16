/**
 * Theme registry. γ wedge で 白虎 / 椿 / 千夜 / 賢者 を追加するときに、
 * ここに 1 行追加するだけで chat page から利用可能になる.
 */

import type { PersonaTheme } from "./types";
import { tsukuyomiTheme } from "./tsukuyomi";

export const themeRegistry = {
  tsukuyomi: tsukuyomiTheme,
  // γ で追加予定:
  // byakko:  byakkoTheme,    // 朱の社, 白虎 (= 力強い persona)
  // tsubaki: tsubakiTheme,   // 古い茶室, 椿 (= 静謐な女性 persona)
  // chiyo:   chiyoTheme,     // 星の図書館, 千夜 (= 知的女性 persona)
  // kenja:   kenjaTheme,     // 山の庵, 賢者 (= 老成男性 persona)
} as const satisfies Record<string, PersonaTheme>;

export type PersonaId = keyof typeof themeRegistry;

export function getTheme(id: PersonaId): PersonaTheme {
  return themeRegistry[id];
}
