"use client";
import { Button } from "@/components/ui/button";

import { XIcon } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer?: string;
  answer?: string;
};

type HistoryQuickTestProps = {
  setStep: React.Dispatch<React.SetStateAction<number>>;
  historyQuiz: QuizQuestion[];
  setSelectedOptions: React.Dispatch<React.SetStateAction<number[]>>;
  setResult: React.Dispatch<
    React.SetStateAction<
      {
        question: string;
        selected: string;
        correct: number;
        isCorrect: boolean;
      }[]
    >
  >;
};

export default function HistoryQuickTest({
  setStep,
  historyQuiz,
  setSelectedOptions,
  setResult,
}: HistoryQuickTestProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const currentQuestion = historyQuiz[currentQuestionIndex];

  const handleAnswerClick = (optionIndex: number) => {
    const correctIndex = Number(currentQuestion.answer);
    setSelectedOptions((prev) => [...prev, optionIndex]);
    setResult((prev) => [
      ...prev,
      {
        question: currentQuestion.question,
        selected: currentQuestion.options[optionIndex],
        correct: correctIndex,
        isCorrect:
          currentQuestion.options[optionIndex] ===
          currentQuestion.options[correctIndex],
      },
    ]);

    if (currentQuestionIndex < historyQuiz.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setStep(7);
    }
  };

  return (
    <div className="w-full">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2.5">
                <div className="text-[24px] font-semibold tracking-[-0.02em] text-slate-950">
                  Шуурхай тест
                </div>
              </div>
              <div className="text-sm leading-6 text-slate-500">
                Уншсан агуулгынхаа ойлголтыг шуурхай шалгаарай.
              </div>
            </div>
            <Dialog>
              <form>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-10 w-10 cursor-pointer rounded-xl border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
                  >
                    <XIcon className="size-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="border-slate-200 p-6 sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="text-[24px] font-semibold tracking-[-0.02em] text-slate-950">
                      Та итгэлтэй байна уу?
                    </DialogTitle>
                    <DialogDescription className="text-sm leading-6 text-red-500">
                      Тестээс гарвал эхнээс нь дахин эхлэх болно.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="flex-col gap-3 sm:flex-row sm:justify-between">
                    <DialogClose asChild>
                      <Button
                        type="submit"
                        className="h-11 w-full rounded-xl bg-slate-700 text-white hover:bg-slate-800 sm:w-auto"
                      >
                        Буцах
                      </Button>
                    </DialogClose>
                    <Button
                      variant="outline"
                      className="h-11 w-full rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 sm:w-auto"
                      onClick={() => setStep(1)}
                    >
                      Тестээс гарах
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </form>
            </Dialog>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5 sm:p-6">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="text-lg font-medium leading-7 text-slate-950">
                  {currentQuestion.question}
                </div>
                <div className="text-base font-medium text-slate-900">
                  {currentQuestionIndex + 1}/
                  <span className="text-sm font-medium text-slate-500">
                    {historyQuiz.length}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {currentQuestion.options.map((option, optionIndex) => (
                  <Button
                    key={optionIndex}
                    variant="outline"
                    className="h-auto min-h-14 cursor-pointer justify-start rounded-2xl border-slate-200 bg-white px-4 py-3 text-left text-sm leading-6 text-slate-700 whitespace-normal transition-colors hover:bg-slate-100 hover:text-slate-950"
                    onClick={() => handleAnswerClick(optionIndex)}
                  >
                    {optionIndex + 1}. {option}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
