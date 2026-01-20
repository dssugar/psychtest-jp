"use client";

import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

interface DraftResumeBannerProps {
  testName: string;
  progress: {
    current: number;
    total: number;
    percentage: number;
  };
  savedAt: string;
  onResume: () => void;
  onStartFresh: () => void;
}

/**
 * 下書き再開バナーコンポーネント
 *
 * ユーザーが途中で中断したテストを再開するか、最初から始めるかを選択できるバナーを表示します。
 * Google Docs/Formsのベストプラクティスに準拠した明示的な選択肢を提供します。
 */
export function DraftResumeBanner({
  testName,
  progress,
  savedAt,
  onResume,
  onStartFresh,
}: DraftResumeBannerProps) {
  // "3分前" のような相対時間表示
  const timeAgo = formatDistanceToNow(new Date(savedAt), {
    addSuffix: true,
    locale: ja,
  });

  return (
    <div className="card-brutal bg-viz-blue/10 border-viz-blue p-6 mb-6">
      <div className="flex items-start gap-4">
        <div className="text-3xl" aria-hidden="true">
          📝
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-2">
            前回の続きから再開しますか?
          </h3>
          <p className="text-sm text-brutal-gray-800 mb-3">
            <span className="font-medium">{testName}</span> の質問{" "}
            <span className="font-bold">
              {progress.current}/{progress.total}
            </span>{" "}
            ({progress.percentage}%) まで回答済み
            <br />
            <span className="text-brutal-gray-600">
              保存日時: {timeAgo}
            </span>
          </p>
          <div className="flex gap-3">
            <button
              onClick={onResume}
              className="btn-brutal bg-viz-blue text-white hover:bg-viz-blue/90 transition-colors"
              autoFocus
            >
              続きから回答する
            </button>
            <button
              onClick={onStartFresh}
              className="btn-brutal bg-brutal-gray-200 hover:bg-brutal-gray-300 transition-colors"
            >
              最初から始める
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
