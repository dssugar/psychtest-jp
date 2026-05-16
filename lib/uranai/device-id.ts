/**
 * device-id (匿名永続化) ヘルパー. client side only.
 *
 * spec §"Narrowest Wedge" 5:
 *   UUID v4 を localStorage + cookie 両方で発行 (どちらか残ってれば復元).
 *   D1 の primary key、認証 UI なし.
 *   device 越え (PC ↔ スマホ) は α 内では非対応、β で LINE Login or QR.
 */

const LOCAL_STORAGE_KEY = "tsukuyomi_device_id";
const COOKIE_NAME = "tsukuyomi_device_id";
const COOKIE_MAX_AGE_DAYS = 400; // Chrome の cookie max-age 上限 ≒ 400日.

/**
 * 既存 device-id を取り出すか、なければ新規発行して localStorage + cookie に書く.
 * 復元 priority: localStorage → cookie → 新規発行 (= localStorage 優先).
 *
 * SSR 中に呼ばれた場合は空文字を返し、client mount 後に再呼出することを期待する.
 */
export function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") return "";

  const fromLS = readLocalStorage();
  if (fromLS) {
    ensureCookie(fromLS);
    return fromLS;
  }

  const fromCookie = readCookie();
  if (fromCookie) {
    writeLocalStorage(fromCookie);
    return fromCookie;
  }

  const fresh = randomUuidV4();
  writeLocalStorage(fresh);
  ensureCookie(fresh);
  return fresh;
}

/**
 * device-id を強制的に再発行する. settings 画面の「全データを消去」用.
 * D1 側の profile / conversations は別途 endpoint で消す.
 */
export function regenerateDeviceId(): string {
  if (typeof window === "undefined") return "";
  const fresh = randomUuidV4();
  writeLocalStorage(fresh);
  ensureCookie(fresh);
  return fresh;
}

/**
 * device-id を local からだけ消す (cookie は残してもよい)。settings の「ローカルだけ忘れる」用.
 * α では未使用、β で device 越え救済時に活用予定.
 */
export function clearDeviceIdLocal(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(LOCAL_STORAGE_KEY);
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

// ============================================================
// 内部 utility
// ============================================================

function readLocalStorage(): string | null {
  try {
    return window.localStorage.getItem(LOCAL_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeLocalStorage(id: string): void {
  try {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, id);
  } catch {
    // private mode 等の quota 例外は無視. cookie が hydrate を担保.
  }
}

function readCookie(): string | null {
  const all = document.cookie.split(";").map((s) => s.trim());
  for (const pair of all) {
    const [k, ...rest] = pair.split("=");
    if (k === COOKIE_NAME) return rest.join("=") || null;
  }
  return null;
}

function ensureCookie(id: string): void {
  const maxAge = COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
  // SameSite=Lax で十分 (cross-site POST から漏れない). Secure は production HTTPS 前提.
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE_NAME}=${id}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
}

function randomUuidV4(): string {
  // crypto.randomUUID は modern browser + Workers 全環境で使える
  // (Chrome 92+, Safari 15.4+, Firefox 95+, Cloudflare Workers).
  // 旧環境向け Math.random fallback は予測可能性を生むので意図的に除外.
  if (typeof crypto === "undefined" || typeof crypto.randomUUID !== "function") {
    throw new Error("crypto.randomUUID is not available in this environment");
  }
  return crypto.randomUUID();
}
