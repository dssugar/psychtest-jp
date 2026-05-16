"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { DataBadge } from "@/components/viz/DataBadge";
import { getOrCreateDeviceId, regenerateDeviceId } from "@/lib/uranai/device-id";
import { getProfile as getLocalProfile } from "@/lib/storage";
import type { ProfilePayload } from "@/lib/uranai/types";

export default function UranaiSettingsPage() {
  const [deviceId, setDeviceId] = useState<string>("");
  const [profile, setProfile] = useState<ProfilePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [nicknameDraft, setNicknameDraft] = useState<string>("");
  const [optinDraft, setOptinDraft] = useState<boolean>(false);

  useEffect(() => {
    const id = getOrCreateDeviceId();
    if (!id) return;
    setDeviceId(id);
    void loadProfile(id);
  }, []);

  async function loadProfile(id: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/uranai/profile?deviceId=${encodeURIComponent(id)}`);
      if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 200)}`);
      const p = (await res.json()) as ProfilePayload;
      setProfile(p);
      setNicknameDraft(p.nickname ?? "");
      setOptinDraft(p.phq9K6Optin);
    } catch (e) {
      setError(e instanceof Error ? e.message : "未知のエラー");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!deviceId) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const local = getLocalProfile();
      const res = await fetch("/uranai/profile", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          deviceId,
          nickname: nicknameDraft.trim() || null,
          phq9K6Optin: optinDraft,
          testResults: local?.tests ?? null,
        }),
      });
      if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 200)}`);
      const p = (await res.json()) as ProfilePayload;
      setProfile(p);
      setNotice("保存しました。");
      setTimeout(() => setNotice(null), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "未知のエラー");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAll() {
    if (!deviceId) return;
    if (!window.confirm("月読 + 占い結果のサーバー保存データをすべて消去します。よろしいですか?")) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/uranai/profile?deviceId=${encodeURIComponent(deviceId)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 200)}`);

      // device-id 自体は維持 (新 chat session を始めればまた使える).
      // ローカルの session pointer + snapshot だけ消す.
      window.localStorage.removeItem("tsukuyomi_active_session");
      Object.keys(window.localStorage)
        .filter((k) => k.startsWith("tsukuyomi_snapshot:"))
        .forEach((k) => window.localStorage.removeItem(k));

      setNotice("サーバー側のデータを消去しました。");
      await loadProfile(deviceId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "未知のエラー");
    } finally {
      setSaving(false);
    }
  }

  function handleRegenerateDeviceId() {
    if (
      !window.confirm(
        "device-id を再発行します (= 別人として扱われる)。サーバー上の旧データは残りますが、この端末からは参照できなくなります。よろしいですか?",
      )
    )
      return;
    const fresh = regenerateDeviceId();
    setDeviceId(fresh);
    window.localStorage.removeItem("tsukuyomi_active_session");
    Object.keys(window.localStorage)
      .filter((k) => k.startsWith("tsukuyomi_snapshot:"))
      .forEach((k) => window.localStorage.removeItem(k));
    void loadProfile(fresh);
    setNotice("device-id を再発行しました。");
  }

  const completedLocal = (() => {
    const local = getLocalProfile();
    if (!local) return [];
    return Object.keys(local.tests ?? {}).filter(
      (k) => (local.tests as Record<string, unknown>)[k] !== undefined,
    );
  })();

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-[760px] mx-auto">
          <div className="text-center mb-10">
            <DataBadge color="black" size="lg">URANAI / SETTINGS</DataBadge>
            <h1
              className="text-3xl md:text-5xl text-brutal-black mt-6 mb-2"
              style={{ fontFamily: "var(--font-display-ja)", fontWeight: 900 }}
            >
              月読の設定
            </h1>
          </div>

          {loading && (
            <Card variant="white" padding="lg">
              <p className="text-center font-mono text-brutal-gray-800">読み込み中…</p>
            </Card>
          )}

          {!loading && (
            <div className="space-y-6">
              <Card variant="white" padding="md">
                <DataBadge color="black" size="sm">DEVICE ID</DataBadge>
                <p className="mt-3 font-mono text-xs break-all text-brutal-gray-800">
                  {deviceId || "(未発行)"}
                </p>
                <p className="mt-2 text-xs text-brutal-gray-700 leading-relaxed">
                  この匿名 ID で月読とのやり取りが紐付いています。認証なし・暗号化なし (α scope)。
                  PC ↔ スマホ間の引き継ぎは α では未対応 (β で LINE Login 等を予定)。
                </p>
                <button
                  type="button"
                  onClick={handleRegenerateDeviceId}
                  disabled={saving}
                  className="mt-4 btn-brutal bg-brutal-white text-brutal-black px-4 py-2 text-xs disabled:opacity-50"
                >
                  device-id を再発行 (別人として始める)
                </button>
              </Card>

              <Card variant="white" padding="md">
                <DataBadge color="black" size="sm">NICKNAME</DataBadge>
                <p className="mt-2 text-xs text-brutal-gray-700">
                  月読の呼びかけに使われます (空欄なら「あなた」)。
                </p>
                <input
                  type="text"
                  value={nicknameDraft}
                  onChange={(e) => setNicknameDraft(e.target.value)}
                  maxLength={32}
                  placeholder="未設定"
                  className="mt-3 w-full border-4 border-brutal-black bg-brutal-white px-4 py-3 text-base font-mono focus:outline-none focus:ring-4 focus:ring-viz-yellow"
                />
              </Card>

              <Card variant="white" padding="md">
                <DataBadge color={optinDraft ? "green" : "black"} size="sm">
                  メンタルヘルス指標の共有
                </DataBadge>
                <p className="mt-3 text-xs text-brutal-gray-800 leading-relaxed">
                  PHQ-9 / K6 (メンタルヘルススクリーニング) の結果を月読に共有するかどうか。
                  共有時も月読は数値・検査名に直接言及せず、抽象的な表現で受けとめます。
                  自殺念慮等の検知時は専門家リソースを必ず案内します。
                </p>
                <label className="mt-4 inline-flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={optinDraft}
                    onChange={(e) => setOptinDraft(e.target.checked)}
                    className="w-5 h-5"
                  />
                  <span className="text-sm font-mono">
                    {optinDraft ? "ON: 月読に共有する" : "OFF: 月読には共有しない"}
                  </span>
                </label>
              </Card>

              <Card variant="white" padding="md">
                <DataBadge color="black" size="sm">LOCAL TEST RESULTS</DataBadge>
                <p className="mt-3 text-xs text-brutal-gray-700">
                  この端末の localStorage に保存されている診断結果 (保存ボタンで月読に同期):
                </p>
                <ul className="mt-2 text-xs font-mono text-brutal-gray-800 list-disc list-inside">
                  {completedLocal.length === 0 ? (
                    <li>(なし — トップから診断を実施してください)</li>
                  ) : (
                    completedLocal.map((k) => <li key={k}>{k}</li>)
                  )}
                </ul>
              </Card>

              {error && (
                <Card variant="pink" padding="sm">
                  <p className="text-sm font-mono text-brutal-black break-all">{error}</p>
                </Card>
              )}
              {notice && (
                <Card variant="green" padding="sm">
                  <p className="text-sm font-mono text-brutal-white break-all">{notice}</p>
                </Card>
              )}

              <div className="flex flex-wrap gap-3 justify-end">
                <button
                  type="button"
                  onClick={handleDeleteAll}
                  disabled={saving}
                  className="btn-brutal bg-viz-pink text-brutal-white px-5 py-3 text-sm disabled:opacity-50"
                >
                  サーバーの全データを消去
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-brutal bg-brutal-black text-brutal-white px-6 py-3 text-sm disabled:opacity-50"
                >
                  {saving ? "保存中…" : "保存"}
                </button>
              </div>
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              href="/uranai/chat/tsukuyomi"
              className="inline-flex items-center gap-2 text-brutal-gray-800 hover:text-brutal-black font-semibold uppercase tracking-wide text-sm"
            >
              <span>←</span>
              <span>月読に戻る</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
