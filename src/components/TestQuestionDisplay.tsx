"use client";

import React from "react";
import {
  SpeakingQuestion,
  SpeakingPart,
  Part1Question,
  Part1_1Question,
  Part2Question,
  Part3Question,
} from "@/lib/types";
import { TestPhase } from "@/hooks/use-mock-test-logic";

interface TestQuestionDisplayProps {
  currentQ: SpeakingQuestion | undefined;
  currentPartName: SpeakingPart;
  currentQuestionIndex: number;
  currentSubQuestionIndex: number;
  currentPhase: TestPhase;
  countdown: number;
}

const TestQuestionDisplay: React.FC<TestQuestionDisplayProps> = ({
  currentQ,
  currentPartName,
  currentQuestionIndex,
  currentSubQuestionIndex,
  currentPhase,
  countdown,
}) => {
  if (!currentQ) {
    return (
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-orange-600 dark:text-orange-400">Ushbu bo'limda yoki keyingi bo'limlarda savollar tugadi.</h3>
        <p className="text-muted-foreground">Iltimos, mashq qilishni davom ettirish uchun ko'proq savollar qo'shing.</p>
      </div>
    );
  }

  switch (currentQ.type) {
    case "part1":
      const part1Q = currentQ as Part1Question;
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-muted-foreground">
            {currentPartName} - Savol {currentQuestionIndex + 1}
          </h3>
          <p className="text-5xl font-bold text-primary mb-4">{countdown}</p>
          <p className="text-2xl font-medium text-foreground min-h-[100px] flex items-center justify-center p-4 border rounded-md bg-secondary">
            {part1Q.text}
          </p>
        </div>
      );
    case "part1.1":
      const part1_1Q = currentQ as Part1_1Question;
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-muted-foreground">
            {currentPartName} - Rasm {currentQuestionIndex + 1}
          </h3>
          {part1_1Q.imageUrl && <img src={part1_1Q.imageUrl} alt="Question image" className="max-h-64 object-contain mx-auto mb-4 rounded-lg shadow-md" />}
          <p className="text-5xl font-bold text-primary mb-4">{countdown}</p>
          <div className="min-h-[100px] flex flex-col items-center justify-center p-4 border rounded-md bg-secondary text-foreground">
            <p className="text-xl font-medium mb-2">Savol {currentSubQuestionIndex + 1}:</p>
            <p className="text-2xl font-medium text-center">{part1_1Q.subQuestions[currentSubQuestionIndex]}</p>
          </div>
        </div>
      );
    case "part2":
      const part2Q = currentQ as Part2Question;
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-muted-foreground">
            {currentPartName} - Savol {currentQuestionIndex + 1}
          </h3>
          {part2Q.imageUrl && <img src={part2Q.imageUrl} alt="Question image" className="max-h-64 object-contain mx-auto mb-4 rounded-lg shadow-md" />}
          <p className="text-5xl font-bold text-primary mb-4">
            {currentPhase === "preparation" ? `Tayyorgarlik: ${countdown}` : `Javob: ${countdown}`}
          </p>
          <p className="text-2xl font-medium text-foreground min-h-[100px] flex items-center justify-center p-4 border rounded-md bg-secondary">
            {part2Q.question}
          </p>
        </div>
      );
    case "part3":
      const part3Q = currentQ as Part3Question;
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-muted-foreground">
            {currentPartName} - Savol {currentQuestionIndex + 1}
          </h3>
          <p className="text-5xl font-bold text-primary mb-4">
            {currentPhase === "preparation" ? `Tayyorgarlik: ${countdown}` : `Javob: ${countdown}`}
          </p>
          <p className="text-2xl font-medium text-foreground min-h-[100px] flex items-center justify-center p-4 border rounded-md bg-secondary mb-4">
            {part3Q.question}
          </p>
          {part3Q.imageUrl && <img src={part3Q.imageUrl} alt="Question image" className="max-h-64 object-contain mx-auto rounded-lg shadow-md" />}
        </div>
      );
    default:
      return <p className="text-muted-foreground">Noma'lum savol turi.</p>;
  }
};

export default TestQuestionDisplay;