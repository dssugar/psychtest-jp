"use client";

import { useState } from "react";
import { getProfile } from "@/lib/storage";
import {
  generateCustomInstructions,
  formatForChatGPT,
  formatForClaude,
  formatForMarkdown,
  type ExportOptions,
} from "@/lib/export/custom-instructions";

/**
 * カスタムインストラクションエクスポートボタン
 * ダッシュボードに配置し、心理テスト結果からLLM用のプロファイルを生成
 */
export function CustomInstructionsExportButton() {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState<ExportOptions>({
    format: "chatgpt",
    includeBigFive: true,
    includeMentalHealth: false, // デフォルトOFF（センシティブ情報）
    includeCommunicationStyle: true,
    language: "ja",
  });

  const handleExport = () => {
    const profile = getProfile();
    if (!profile) {
      alert("診断結果が見つかりません。まず診断を完了してください。");
      return;
    }

    // 完了済みテストが少なくとも1つあるか確認
    const hasAnyTest = Object.values(profile.tests).some(test => test !== null);
    if (!hasAnyTest) {
      alert("診断結果が見つかりません。まず診断を完了してください。");
      return;
    }

    setShowModal(true);
  };

  const handleCopy = () => {
    const profile = getProfile();
    if (!profile) return;

    let text = generateCustomInstructions(profile, options);

    // フォーマット別の最適化
    if (options.format === "chatgpt") {
      text = formatForChatGPT(text);
    } else if (options.format === "claude") {
      text = formatForClaude(text);
    } else {
      text = formatForMarkdown(text);
    }

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    const profile = getProfile();
    if (!profile) return;

    let text = generateCustomInstructions(profile, options);

    // フォーマット別の最適化
    if (options.format === "chatgpt") {
      text = formatForChatGPT(text);
    } else if (options.format === "claude") {
      text = formatForClaude(text);
    } else {
      text = formatForMarkdown(text);
    }

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `psychtest-profile-${options.format}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* トリガーボタン */}
      <button
        onClick={handleExport}
        className="w-full rounded-xl border-2 border-black bg-white p-4 text-left transition-all hover:bg-gray-50"
      >
        <div className="flex items-center gap-3">
          <div className="text-2xl">🤖</div>
          <div className="flex-1">
            <div className="font-bold text-black">AIアシスタントにインポート</div>
            <div className="text-sm text-gray-600">
              ChatGPT/Claude等のカスタムインストラクションを生成
            </div>
          </div>
          <div className="text-gray-400">→</div>
        </div>
      </button>

      {/* モーダル */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            {/* ヘッダー */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">カスタムインストラクション生成</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-2xl text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            {/* オプション選択 */}
            <div className="mb-6 space-y-4">
              {/* フォーマット選択 */}
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  フォーマット
                </label>
                <select
                  value={options.format}
                  onChange={(e) =>
                    setOptions({ ...options, format: e.target.value as ExportOptions["format"] })
                  }
                  className="w-full rounded-lg border border-gray-300 p-2"
                >
                  <option value="chatgpt">ChatGPT（1500文字制限対応）</option>
                  <option value="claude">Claude（詳細版）</option>
                  <option value="markdown">汎用Markdown（完全版）</option>
                </select>
              </div>

              {/* チェックボックス */}
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options.includeBigFive}
                    onChange={(e) =>
                      setOptions({ ...options, includeBigFive: e.target.checked })
                    }
                    className="h-4 w-4"
                  />
                  <span className="text-sm">Big Five特性を含める（推奨）</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options.includeCommunicationStyle}
                    onChange={(e) =>
                      setOptions({ ...options, includeCommunicationStyle: e.target.checked })
                    }
                    className="h-4 w-4"
                  />
                  <span className="text-sm">対話スタイル推奨を含める（推奨）</span>
                </label>

                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={options.includeMentalHealth}
                    onChange={(e) =>
                      setOptions({ ...options, includeMentalHealth: e.target.checked })
                    }
                    className="mt-1 h-4 w-4"
                  />
                  <div className="flex-1">
                    <span className="text-sm">メンタルヘルス情報を含める（PHQ-9, K6）</span>
                    <p className="mt-1 text-xs text-red-600">
                      ⚠️ センシティブな情報です。信頼できるプライベートなAI環境でのみ使用してください。
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options.language === "en"}
                    onChange={(e) =>
                      setOptions({ ...options, language: e.target.checked ? "en" : "ja" })
                    }
                    className="h-4 w-4"
                  />
                  <span className="text-sm">英語で生成</span>
                </label>
              </div>
            </div>

            {/* プレビュー */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-bold text-gray-700">プレビュー</label>
              <div className="h-64 overflow-y-auto rounded-lg border border-gray-300 bg-gray-50 p-4">
                <pre className="whitespace-pre-wrap text-xs font-mono">
                  {(() => {
                    const profile = getProfile();
                    if (!profile) return "プロファイルが見つかりません";

                    let text = generateCustomInstructions(profile, options);

                    if (options.format === "chatgpt") {
                      text = formatForChatGPT(text);
                    } else if (options.format === "claude") {
                      text = formatForClaude(text);
                    } else {
                      text = formatForMarkdown(text);
                    }

                    return text;
                  })()}
                </pre>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex gap-3">
              <button
                onClick={handleCopy}
                className="flex-1 rounded-lg bg-black px-6 py-3 font-bold text-white transition-all hover:bg-gray-800"
              >
                {copied ? "✓ コピーしました！" : "📋 クリップボードにコピー"}
              </button>
              <button
                onClick={handleDownload}
                className="rounded-lg border-2 border-black bg-white px-6 py-3 font-bold text-black transition-all hover:bg-gray-100"
              >
                💾 ダウンロード
              </button>
            </div>

            {/* 使い方のヒント */}
            <div className="mt-4 rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
              <p className="font-bold">💡 使い方:</p>
              <ol className="ml-4 mt-2 list-decimal space-y-1">
                <li>上記のテキストをコピーまたはダウンロード</li>
                <li>
                  <strong>ChatGPT</strong>: Settings → Personalization → Custom Instructions に貼り付け
                </li>
                <li>
                  <strong>Claude</strong>: Projects → Custom Instructions に貼り付け
                </li>
                <li>AIアシスタントがあなたの性格に合わせた対話をするようになります</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
