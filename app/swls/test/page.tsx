"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { swlsQuestions, scaleLabels } from "@/data/swls-questions";
import { calculateSwlsScore, validateAnswerPattern } from "@/lib/scoring/swls";
import { saveTestResult } from "@/lib/storage";
import { DataBadge } from "@/components/viz/DataBadge";

export default function SwlsTestPage() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(5).fill(-1));
  const [showWarning, setShowWarning] = useState(false);

  const progress = ((currentQuestion + 1) / swlsQuestions.length) * 100;

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);

    // 次の質問へ自動的に進む
    if (currentQuestion < swlsQuestions.length - 1) {
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
    if (!validation.valid) {
      if (!confirm(validation.message + "\n\nこのまま結果を表示しますか？")) {
        return;
      }
    }

    // スコア計算
    const result = calculateSwlsScore(answers);

    // 結果を保存（新API使用）
    saveTestResult("swls", result, answers);

    // 結果ページへ遷移
    router.push("/results/swls");
  };

  const question = swlsQuestions[currentQuestion];
  const isLastQuestion = currentQuestion === swlsQuestions.length - 1;
  const allAnswered = !answers.includes(-1);

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          {/* Progress Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <DataBadge color="blue">SWLS</DataBadge>
              <div className="flex items-center gap-4">
                <div className="font-mono font-bold text-sm text-brutal-gray-800">
                  質問 {currentQuestion + 1} / {swlsQuestions.length}
                </div>
                <div className="font-mono font-bold text-sm text-brutal-gray-800">
                  {Math.round(progress)}%
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 border-brutal border-brutal-black bg-brutal-gray-100 relative overflow-hidden">
              <div
                className="h-full bg-viz-blue transition-all duration-300"
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
              {scaleLabels.map((label, index) => {
                const value = index + 1; // 1-7
                const isSelected = answers[currentQuestion] === value;

                return (
                  <button
                    key={value}
                    onClick={() => handleAnswer(value)}
                    className={`
                      w-full text-left px-4 py-3 md:px-6 md:py-4 border-[3px] border-solid transition-all
                      ${
                        isSelected
                          ? "border-black bg-viz-blue text-black shadow-[4px_4px_0px_#000]"
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
                            ? "border-black bg-[#ffffff]"
                            : "border-black bg-[#ffffff]"
                        }
                      `}
                      >
                        {isSelected && (
                          <div className="w-3 h-3 bg-black" />
                        )}
                      </div>

                      <span className="font-semibold">{label}</span>
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
