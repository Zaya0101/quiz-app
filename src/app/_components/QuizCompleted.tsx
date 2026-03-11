import { Button } from "@/components/ui/button";
import WrongIcon from "../icons/WrongIcon";
import CorrectIcon from "../icons/CorrectIcon";
import ReloadIcon from "../icons/ReloadIcon";
import BookMarkIcon from "../icons/BookMarkIcon";

type QuickTestProps = {
  setStep: React.Dispatch<React.SetStateAction<number>>;
  result: {
    question: string;
    selected: string;
    correct: number;
    isCorrect: boolean;
  }[];
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

export default function QuizCompleted({
  setStep,
  result,
  setSelectedOptions,
  setResult,
}: QuickTestProps) {
  const score = result.filter((r) => r.isCorrect).length;
  const total = result.length;

  const handleSaveAndLeave = async () => {
    setStep(1);
  };
  const handleRestartQuiz = () => {
    setResult([]);
    setSelectedOptions([]);
    setStep(3);
  };

  return (
    <div className="w-full">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
            <div className="text-[24px] font-semibold tracking-[-0.02em] text-slate-950">
              Тест дууслаа
            </div>
          </div>
          <div className="text-sm leading-6 text-slate-500">
            Үр дүнгээ харцгаая
          </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <div className="text-lg font-medium text-slate-950">
                Таны оноо:
              </div>
              <div className="text-lg font-medium text-slate-950">
                {score}/
                <span className="text-sm font-medium text-slate-500">
                  {total}
                </span>
              </div>
            </div>
          </div>

          <div className="max-h-[420px] space-y-3 overflow-y-auto">
            {result.map((r, index) => (
              <div
                key={index}
                className="flex gap-3 rounded-2xl border border-slate-100 bg-white p-4"
              >
                <div className="pt-0.5">
                  {r.isCorrect ? <CorrectIcon /> : <WrongIcon />}
                </div>
                <div className="flex max-w-[520px] flex-col gap-1">
                  <div className="text-xs font-medium uppercase tracking-[0.08em] text-slate-400">
                    Асуулт {index + 1}
                  </div>
                  <div className="text-sm font-medium leading-6 text-slate-900">
                    {r.question}
                  </div>
                  <div className="text-sm leading-6 text-slate-600">
                    Таны хариулт: {r.selected}
                  </div>
                  {!r.isCorrect && (
                    <div className="text-sm leading-6 text-emerald-600">
                      Зөв хариулт: {r.correct}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Button
              variant="outline"
              className="h-11 w-full cursor-pointer rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 sm:w-auto"
              onClick={handleRestartQuiz}
            >
              <ReloadIcon />
              Тестийг дахин эхлүүлэх
            </Button>
            <Button
              onClick={handleSaveAndLeave}
              className="h-11 w-full cursor-pointer rounded-xl bg-slate-700 text-white hover:bg-slate-800 sm:w-auto"
            >
              <BookMarkIcon />
              Хадгалаад гарах
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
