"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { phq9Questions, scaleLabels } from "@/data/phq9-questions";
import { calculatePhq9Score, validateAnswerPattern } from "@/lib/scoring/phq9";
import { saveTestResult } from "@/lib/storage";
import { DataBadge } from "@/components/viz/DataBadge";

export default function Phq9TestPage() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(9).fill(-1)); // -1 = 未回答
  const [showWarning, setShowWarning] = useState(false);

  const progress = ((currentQuestion + 1) / phq9Questions.length) * 100;

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);

    // 次の質問へ自動的に進む
    if (currentQuestion < phq9Questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
      }, 200);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    // すべて回答済みか確認
    if (answers.includes(-1)) {
      alert("すべての質問に回答してください");
      return;
    }

    // 回答パターンのバリデーション
    const validation = validateAnswerPattern(answers);
    if (!validation.valid && validation.message) {
      if (!confirm(validation.message + "\n\nこのまま結果を表示しますか？")) {
        return;
      }
    }

    // スコアを計算
    const result = calculatePhq9Score(answers);

    // 自殺リスクの警告
    if (result.suicideRisk) {
      alert(
        "⚠️ 自殺念慮に関する項目で高いスコアが検出されました。\n\n" +
        "結果ページで緊急連絡先をご確認ください。\n" +
        "深刻な場合は直ちに以下に連絡してください:\n" +
        "・いのちの電話: 0570-783-556（24時間対応）\n" +
        "・119番（救急）"
      );
    }

    // ローカルストレージに保存
    saveTestResult("phq9", result, answers);

    // 結果ページに遷移
    router.push("/results/phq9");
  };

  const currentQ = phq9Questions[currentQuestion];
  const isLastQuestion = currentQuestion === phq9Questions.length - 1;
  const currentAnswer = answers[currentQuestion];

  return (
    <main className="min-h-screen bg-brutal-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <DataBadge color="orange" size="sm">PHQ-9</DataBadge>
            <h1 className="text-3xl md:text-4xl text-brutal-black mt-4 mb-2" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 900 }}>
              うつ病スクリーニング
            </h1>
            <p className="text-sm text-brutal-gray-800 font-mono">
              過去2週間を振り返って回答してください
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-mono text-brutal-gray-800">
                質問 {currentQuestion + 1} / {phq9Questions.length}
              </span>
              <span className="text-sm font-mono text-brutal-gray-800">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-3 bg-brutal-gray-200 border-brutal border-brutal-black">
              <div
                className="h-full bg-viz-orange transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="card-brutal p-8 bg-brutal-white border-brutal-black mb-8">
            <div className="mb-6">
              <div className="text-sm font-bold uppercase tracking-wide text-brutal-gray-700 mb-3">
                {currentQuestion === 8 && "⚠️ 重要な質問"} 質問 {currentQ?.id}
              </div>
              <h2 className="text-xl md:text-2xl text-brutal-black leading-tight" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 700 }}>
                {currentQ?.text}
              </h2>
            </div>

            {/* Answer Options */}
            <div className="space-y-4">
              {scaleLabels.map((label, index) => {
                const isSelected = currentAnswer === index;

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    className={`
                      w-full text-left px-4 py-3 md:px-6 md:py-4 border-[3px] border-solid transition-all
                      ${
                        isSelected
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
                          isSelected
                            ? "border-white bg-[#ffffff]"
                            : "border-black bg-[#ffffff]"
                        }
                      `}
                      >
                        {isSelected && (
                          <div className="w-3 h-3 bg-black" />
                        )}
                      </div>

                      <div className="flex items-center justify-between flex-1">
                        <span className="font-semibold">{label}</span>
                        <span className="text-sm font-mono text-brutal-gray-700">
                          {index}点
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Suicide Risk Warning for Question 9 */}
            {currentQuestion === 8 && (
              <div className="mt-6 p-4 bg-viz-orange border-2 border-brutal-black">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">⚠️</div>
                  <div className="text-sm">
                    <div className="font-bold mb-1">この質問は自殺念慮のスクリーニング項目です</div>
                    <p className="text-xs leading-relaxed">
                      もし深刻な状態にある場合は、テストを中断し、直ちに専門家に相談してください。
                      <br />
                      緊急時: いのちの電話 0570-783-556（24時間対応）
                    </p>
                  </div>
                </div>
              </div>
            )}
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

            {isLastQuestion && currentAnswer !== -1 && (
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
