"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getTestConfig } from "@/lib/tests/test-registry";
import { saveTestResult, getDraft, saveDraft, clearDraft } from "@/lib/storage";
import { DataBadge } from "@/components/viz/DataBadge";
import { DraftResumeBanner } from "@/components/test/DraftResumeBanner";
import type { TestType, DraftTestState } from "@/lib/storage";
import type { ScaleOption } from "@/lib/tests/types";

/**
 * 動的テストページ（全テスト統合）
 *
 * このページは7つのテスト（BigFive, Industriousness, PHQ-9, K6, SWLS, Rosenberg, SelfConcept）
 * すべてに対応する汎用的なテストインターフェースです。
 *
 * ルート: /test/[testType] (例: /test/phq9, /test/bigfive)
 */
export default function DynamicTestPage() {
  const router = useRouter();
  const params = useParams();
  const testType = params.testType as string;

  // Registry から設定取得（実装済みテストのみ）
  const config = getTestConfig(testType as any);
  const {
    questions,
    scaleOptions: defaultScaleOptions,
    calculateScore,
    validateAnswers,
    testVersion,
    headerInstruction,
    selectedButtonColor = "black", // デフォルト: 黒
    color,
  } = config;

  // State管理 (全テスト共通)
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(
    new Array(questions.length).fill(-1)
  );

  // 下書き自動保存関連の状態
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [showResumeBanner, setShowResumeBanner] = useState(false);
  const [draftData, setDraftData] = useState<DraftTestState | null>(null);
  const [saveStatus, setSaveStatus] = useState<"saved" | "idle">("idle");
  const [draftStartTime] = useState(new Date().toISOString());

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const question = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;
  const allAnswered = !answers.includes(-1);

  // 質問固有の選択肢 or デフォルト選択肢（ハイブリッド対応）
  const scaleOptions = question.scaleOptions ?? defaultScaleOptions;

  // マウント時に下書きを読み込み
  useEffect(() => {
    const draft = getDraft(testType as TestType);

    if (draft) {
      // 下書きの有効性を検証（質問数とバージョンをチェック）
      const isValid =
        draft.answers.length === questions.length &&
        (!testVersion || !draft.testVersion || draft.testVersion === testVersion);

      if (isValid) {
        setDraftData(draft);
        setShowResumeBanner(true);
      } else {
        // 無効な下書きは削除
        clearDraft(testType as TestType);
      }
    }

    setDraftLoaded(true);
  }, [testType, questions.length, testVersion]);

  // Navigation handlers (全テスト共通)
  const handleAnswer = (value: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);

    // 🔥 自動保存
    saveDraft(testType as TestType, {
      answers: newAnswers,
      currentQuestion: currentQuestion + 1,
      startedAt: draftData?.startedAt || draftStartTime,
      lastSavedAt: new Date().toISOString(),
      testVersion,
    });

    // 保存インジケーター表示
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2000);

    // 自動進行（最終質問以外）
    if (currentQuestion < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
      }, 200);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      // 🔥 戻る時も下書き保存（現在の質問番号を記録）
      saveDraft(testType as TestType, {
        answers,
        currentQuestion: currentQuestion - 1,
        startedAt: draftData?.startedAt || draftStartTime,
        lastSavedAt: new Date().toISOString(),
        testVersion,
      });

      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    // 未回答チェック
    if (answers.includes(-1)) {
      alert("すべての質問に回答してください");
      return;
    }

    // 回答パターン検証（オプショナル）
    if (validateAnswers) {
      const validation = validateAnswers(answers);
      if (!validation.valid) {
        // warning または message プロパティを使用（両対応）
        const message = validation.warning || validation.message ||
                       "回答パターンに問題があります";
        if (!confirm(message + "\n\nこのまま結果を表示しますか？")) {
          return;
        }
      }
    }

    // スコア計算
    const result = calculateScore(answers);

    // 結果保存（testVersion はオプショナル）
    saveTestResult(testType as TestType, result, answers, testVersion);

    // 🔥 下書きをクリア
    clearDraft(testType as TestType);

    // 結果ページへ遷移
    router.push(`/results/${testType}`);
  };

  // 再開ハンドラー
  const handleResumeDraft = () => {
    if (!draftData) return;
    setAnswers(draftData.answers);
    setCurrentQuestion(draftData.currentQuestion);
    setShowResumeBanner(false);
  };

  const handleStartFresh = () => {
    clearDraft(testType as TestType);
    setDraftData(null);
    setShowResumeBanner(false);
  };

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          {/* 再開バナー */}
          {showResumeBanner && draftData && (
            <DraftResumeBanner
              testName={config.scaleInfo.nameJa}
              progress={{
                current: draftData.currentQuestion,
                total: questions.length,
                percentage: Math.round(
                  (draftData.currentQuestion / questions.length) * 100
                ),
              }}
              savedAt={draftData.lastSavedAt}
              onResume={handleResumeDraft}
              onStartFresh={handleStartFresh}
            />
          )}

          {/* Progress Header */}
          <div className="mb-8">
            {/* ヘッダー指示文（K6など） */}
            {headerInstruction && (
              <p className="text-sm text-brutal-gray-800 mb-4">
                {headerInstruction}
              </p>
            )}

            <div className="flex items-center justify-between mb-4">
              <DataBadge color={color}>
                {config.scaleInfo.abbreviation}
              </DataBadge>
              <div className="flex items-center gap-4">
                <div className="font-mono font-bold text-sm text-brutal-gray-800">
                  質問 {currentQuestion + 1} / {questions.length}
                  {/* 保存ステータス */}
                  {saveStatus === "saved" && (
                    <span className="text-viz-green ml-2 text-xs">
                      ✓ 保存済み
                    </span>
                  )}
                </div>
                <div className="font-mono font-bold text-sm text-brutal-gray-800">
                  {Math.round(progress)}%
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 border-brutal border-brutal-black bg-brutal-gray-100 relative overflow-hidden">
              <div
                className={`h-full bg-viz-${color} transition-all duration-300`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="card-brutal p-8 md:p-12 bg-brutal-white mb-8 animate-slide-in-up">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-brutal-black mb-8 md:mb-10 leading-relaxed">
              {question.text}
            </h2>

            {/* Answer Options */}
            <div className="space-y-4">
              {scaleOptions.map((option: ScaleOption) => {
                const isSelected = answers[currentQuestion] === option.value;

                return (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(option.value)}
                    className={`
                      w-full text-left px-4 py-3 md:px-6 md:py-4 border-[3px] border-solid transition-all
                      ${
                        selectedButtonColor === "blue" && isSelected
                          ? "border-viz-blue bg-viz-blue text-black shadow-[4px_4px_0px_#000]"
                          : isSelected
                          ? "border-black bg-black text-white shadow-[4px_4px_0px_#000]"
                          : "border-black bg-[#ffffff] text-black hover:shadow-[4px_4px_0px_#000]"
                      }
                    `}
                  >
                    <div className="flex items-center gap-4">
                      {/* Radio Indicator */}
                      <div
                        className={`
                        w-6 h-6 border-[3px] border-solid flex items-center justify-center
                        ${
                          selectedButtonColor === "blue" && isSelected
                            ? "border-black bg-[#ffffff]"
                            : isSelected
                            ? "border-white bg-[#ffffff]"
                            : "border-black bg-[#ffffff]"
                        }
                      `}
                      >
                        {isSelected && (
                          <div
                            className={`w-3 h-3 ${
                              selectedButtonColor === "blue" ? "bg-viz-blue" : "bg-black"
                            }`}
                          />
                        )}
                      </div>

                      <span className="font-semibold">{option.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={handleBack}
              disabled={currentQuestion === 0}
              className="px-6 py-3 font-bold uppercase tracking-wide text-sm text-brutal-gray-800 hover:text-brutal-black disabled:opacity-30 disabled:cursor-not-allowed transition-opacity min-h-[44px]"
            >
              ← 前の質問
            </button>

            {isLastQuestion && allAnswered && (
              <button
                onClick={handleSubmit}
                className="btn-brutal bg-brutal-black text-brutal-white px-6 py-3 md:px-10 md:py-4 text-sm min-h-[44px]"
              >
                結果を見る
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
