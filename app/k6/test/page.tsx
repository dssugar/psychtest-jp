"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { questions, scaleLabels, instructionText } from "@/data/k6-questions";
import { getK6Result } from "@/lib/scoring/k6";
import { saveTestResult } from "@/lib/storage";
import { DataBadge } from "@/components/viz/DataBadge";

export default function K6TestPage() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(6).fill(-1)); // -1 = 未回答

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);

    // 次の質問へ自動的に進む
    if (currentQuestion < questions.length - 1) {
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

    // スコアを計算
    const result = getK6Result(answers);

    // 重度の心理的苦痛の警告
    if (result.requiresUrgentCare) {
      alert(
        "⚠️ あなたのスコアは13点以上です。\n\n" +
        "精神疾患の可能性が高い状態です（特異度96%）。\n" +
        "結果ページで詳細を確認し、専門家への受診を強く推奨します。\n\n" +
        "緊急時の連絡先:\n" +
        "・いのちの電話: 0570-783-556（24時間対応）\n" +
        "・こころの健康相談統一ダイヤル: 0570-064-556"
      );
    }

    // ローカルストレージに保存
    saveTestResult("k6", result, answers);

    // 結果ページに遷移
    router.push("/results/k6");
  };

  const currentQ = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;
  const currentAnswer = answers[currentQuestion];

  return (
    <main className="min-h-screen bg-brutal-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <DataBadge color="cyan" size="sm">K6</DataBadge>
            <h1 className="text-3xl md:text-4xl text-brutal-black mt-4 mb-2" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 900 }}>
              心理的苦痛スクリーニング
            </h1>
            <p className="text-sm text-brutal-gray-800 font-mono">
              {instructionText}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-mono text-brutal-gray-800">
                質問 {currentQuestion + 1} / {questions.length}
              </span>
              <span className="text-sm font-mono text-brutal-gray-800">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-3 bg-brutal-gray-200 border-brutal border-brutal-black">
              <div
                className="h-full bg-viz-cyan transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="card-brutal p-8 bg-brutal-white border-brutal-black mb-8">
            <div className="mb-6">
              <div className="text-sm font-bold uppercase tracking-wide text-brutal-gray-700 mb-3">
                質問 {currentQ?.id}
              </div>
              <h2 className="text-xl md:text-2xl text-brutal-black leading-tight" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 700 }}>
                {currentQ?.text}
              </h2>
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              {scaleLabels.map((label, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className={`btn-brutal w-full text-left px-6 py-4 transition-all ${
                    currentAnswer === index
                      ? "bg-viz-cyan text-brutal-white border-4"
                      : "bg-brutal-white text-brutal-black hover:bg-brutal-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{label}</span>
                    <span className="text-sm font-mono text-brutal-gray-700">
                      {index}点
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={handleBack}
              disabled={currentQuestion === 0}
              className="btn-brutal px-6 py-3 bg-brutal-gray-200 text-brutal-black disabled:opacity-30"
            >
              ← 戻る
            </button>

            {/* Progress Dots */}
            <div className="flex gap-2">
              {questions.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full border border-brutal-black ${
                    index === currentQuestion
                      ? "bg-viz-cyan"
                      : answers[index] !== -1
                      ? "bg-brutal-black"
                      : "bg-brutal-gray-200"
                  }`}
                />
              ))}
            </div>

            {isLastQuestion ? (
              <button
                onClick={handleSubmit}
                className="btn-brutal px-8 py-3 bg-viz-cyan text-brutal-white hover-lift"
              >
                結果を見る
              </button>
            ) : (
              <div className="w-24" /> // Spacer for alignment
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
