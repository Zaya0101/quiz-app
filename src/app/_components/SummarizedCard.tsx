"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import BookIcon from "../icons/BookIcon";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import axios from "axios";

type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer?: string;
  answer?: string;
};

type SummarizedCardProps = {
  quiz: QuizQuestion[];
  setQuiz: React.Dispatch<React.SetStateAction<QuizQuestion[]>>;
  summary: string;
  setSummary: React.Dispatch<React.SetStateAction<string>>;
  title: string;
  content: string;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  articleId: string;
};

export default function SummarizedCard({
  setQuiz,
  summary,
  title,
  content,
  setStep,
  articleId,
}: SummarizedCardProps) {
  const [loading, setLoading] = useState<boolean>(false);

  const handleTakeQuiz = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (loading) return;
    if (!articleId) {
      console.error("articleId is missing");
      return;
    }

    setLoading(true);

    try {
      const quizRes = await axios.post(`/api/article/${articleId}/quizzes`);

      console.log("quiz saved:", quizRes.data);

      const quizzes = quizRes.data.quizzes;

      if (!Array.isArray(quizzes) || quizzes.length === 0) {
        console.error("No quizzes returned:", quizzes);
        return;
      }

      setQuiz(quizzes);
      setStep(3);
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { error?: string; message?: string } };
        message?: string;
      };

      console.error(
        "HANDLE TAKE QUIZ ERROR:",
        axiosError?.response?.data || axiosError?.message,
      );
      alert(
        axiosError?.response?.data?.error ||
          axiosError?.response?.data?.message ||
          axiosError?.message ||
          "Тест үүсгэх үед алдаа гарлаа",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full rounded-3xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <CardHeader className="space-y-3 px-6 pb-0 pt-6 sm:px-8 sm:pt-8">
        <div className="flex items-center gap-2.5">
          <CardTitle className="text-[24px] font-semibold tracking-[-0.02em] text-slate-950">
            ✨Тест үүсгэх ухаалаг систем
          </CardTitle>
        </div>
        <CardDescription className="text-sm text-slate-500">
          Сэдвийн хураангуй бэлэн боллоо. Шалгаж хараад тестээ үүсгээрэй.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 px-6 py-6 sm:px-8">
        <CardDescription className="flex items-center gap-2 text-sm text-slate-500">
          <BookIcon /> Хураангуй агуулга
        </CardDescription>

        <div className="text-[26px] font-semibold leading-8 tracking-[-0.02em] text-slate-950">
          {title}
        </div>

        <div className="max-h-[360px] overflow-y-auto rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-sm leading-6 text-slate-700">
          {summary}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 px-6 pb-6 pt-0 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:pb-8">
        <Dialog>
          <form>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full cursor-pointer rounded-xl border-slate-200 bg-white text-sm text-slate-700 transition-colors hover:bg-slate-50 sm:w-auto"
              >
                Эх нийтлэл харах
              </Button>
            </DialogTrigger>

            <DialogContent className="border-slate-200 p-6 sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle className="text-[24px] font-semibold tracking-[-0.02em] text-slate-950">
                  {title}
                </DialogTitle>
                <div className="max-h-[60vh] overflow-y-auto pt-2 text-sm leading-6 text-slate-700">
                  {content}
                </div>
              </DialogHeader>
            </DialogContent>
          </form>
        </Dialog>

        <Button
          type="button"
          className="h-11 w-full cursor-pointer rounded-xl bg-slate-700 px-5 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:bg-slate-300 sm:w-auto"
          disabled={loading || !articleId}
          onClick={handleTakeQuiz}
        >
          {loading ? "Тест бэлдэж байна..." : "Тест эхлүүлэх"}
        </Button>
      </CardFooter>
    </Card>
  );
}
