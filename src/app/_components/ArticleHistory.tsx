"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
// import GeminiIcon from "../icons/GeminiIcon";
import FileIcon from "../icons/FileIcon";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import axios from "axios";
// import BookIcon from "../icons/BookIcon";
import { Skeleton } from "@/components/ui/skeleton";

type ArticleHistoryProps = {
  setStep: React.Dispatch<React.SetStateAction<number>>;
  selectedArticleId: string;
  setHistoryQuiz: React.Dispatch<React.SetStateAction<QuizQuestion[]>>;
};
type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer?: string;
  answer?: string;
};

export default function ArticleHistory({
  setStep,
  selectedArticleId,
  setHistoryQuiz,
}: ArticleHistoryProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [contentData, setContentData] = useState<string>("");
  const [summaryData, setSummaryData] = useState<string>("");
  const [titleData, setTitleData] = useState<string>("");
  console.log("Fetching article with ID:", selectedArticleId);
  useEffect(() => {
    const fetchArticle = async () => {
      const articleId = selectedArticleId;
      if (!articleId) {
        console.error("articleId is missing");
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`/api/article/${articleId}`);
        const article = response.data?.article;
        console.log("Fetched article data:", article);

        if (article) {
          setContentData(article.content);
          setSummaryData(article.summary);
          setTitleData(article.title);
        } else {
          console.warn("No article found");
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching article data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [selectedArticleId]);

  const handleTakeQuiz = async () => {
    const content = contentData;
    if (loading) return;
    setLoading(true);
    try {
      const response = await axios.post("/api/generate/quizzes", {
        content,
      });
      const parsedQuiz: QuizQuestion[] = Array.isArray(response.data.result)
        ? response.data.result
        : JSON.parse(response.data.result as string);
      setHistoryQuiz(parsedQuiz);
      setStep(6);
      console.log("response from histoty", parsedQuiz);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const ArticleSkeleton = () => {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-10/12" />
        <div className="flex gap-2 items-center mt-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    );
  };

  return (
    <Card className="w-full rounded-3xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <CardHeader className="space-y-3 px-6 pb-0 pt-6 sm:px-8 sm:pt-8">
        <div className="flex items-center gap-2.5">
          {/* <GeminiIcon /> */}
          <CardTitle className="text-[24px] font-semibold tracking-[-0.02em] text-slate-950">
            ✨Тест үүсгэх ухаалаг систем
          </CardTitle>
        </div>
        <CardDescription className="flex items-center gap-2 text-sm text-slate-500">
          📝Хураангуй агуулга
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 py-6 sm:px-8">
        {loading ? (
          <ArticleSkeleton />
        ) : (
          <div className="flex flex-col gap-4">
            <div className="w-full text-[26px] font-semibold leading-8 tracking-[-0.02em] text-slate-950">
              {titleData}
            </div>
            <div className="w-full rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-sm leading-6 text-slate-700">
              {summaryData}
            </div>
            <div className="flex w-full items-center gap-1.5">
              <FileIcon />
              <Label
                htmlFor="article-content"
                className="text-sm font-medium text-slate-700"
              >
                Сэдвийн агуулга
              </Label>
            </div>
            <div
              id="article-content"
              className="w-full rounded-2xl border border-slate-100 bg-white p-4 text-sm leading-6 text-slate-600"
            >
              <div className="line-clamp-5">{contentData}</div>
            </div>

            <Dialog>
              <form>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-11 cursor-pointer rounded-xl border-slate-200 bg-white text-sm text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Дэлгэрэнгүй үзэх
                  </Button>
                </DialogTrigger>
                <DialogContent className="border-slate-200 p-6 sm:max-w-3xl">
                  <DialogHeader>
                    <DialogTitle className="text-[24px] font-semibold tracking-[-0.02em] text-slate-950">
                      {titleData}
                    </DialogTitle>
                    <div className="max-h-[60vh] overflow-y-auto pt-2 text-sm leading-6 text-slate-700">
                      {contentData}
                    </div>
                  </DialogHeader>
                </DialogContent>
              </form>
            </Dialog>
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-end px-6 pb-6 pt-0 sm:px-8 sm:pb-8">
        <Button
          type="submit"
          className="h-11 cursor-pointer rounded-xl bg-slate-700 px-5 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:bg-slate-300"
          onClick={handleTakeQuiz}
          disabled={loading}
        >
          Тест эхлүүлэх
        </Button>
      </CardFooter>
    </Card>
  );
}
