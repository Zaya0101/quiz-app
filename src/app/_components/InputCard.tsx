"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FileIcon from "../icons/FileIcon";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import axios from "axios";

type InputCardProps = {
  summary: string;
  setSummary: React.Dispatch<React.SetStateAction<string>>;
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  content: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setArticleId: React.Dispatch<React.SetStateAction<string>>;
};

export default function InputCard({
  setSummary,
  title,
  setTitle,
  content,
  setContent,
  setStep,
  setArticleId,
}: InputCardProps) {
  const [loading, setLoading] = useState<boolean>(false);

  const handleGenerate = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!title || !content) return;

    setLoading(true);
    try {
      console.log("generate payload:", { title, content });
      const generateRes = await axios.post("/api/generate", {
        content,
      });

      const generatedSummary = generateRes.data.result;

      const articleRes = await axios.post("/api/articles", {
        title,
        content,
        summary: generatedSummary,
      });

      const newArticleId = articleRes.data?.article?.id;

      if (!newArticleId) {
        throw new Error("Article ID not returned from /api/articles");
      }

      setSummary(generatedSummary);
      setArticleId(newArticleId);

      console.log("article saved", articleRes.data);
      console.log("newArticleId", newArticleId);

      setStep(2);
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { error?: string; message?: string } };
        message?: string;
      };

      console.error("HANDLE GENERATE ERROR FULL:", err);
      console.error("HANDLE GENERATE ERROR RESPONSE:", axiosError?.response);
      console.error("HANDLE GENERATE ERROR DATA:", axiosError?.response?.data);
      console.error("HANDLE GENERATE ERROR MESSAGE:", axiosError?.message);

      alert(
        axiosError?.response?.data?.error ||
          axiosError?.response?.data?.message ||
          axiosError?.message ||
          "Хураангуй үүсгэх үед алдаа гарлаа",
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
        <CardDescription className="max-w-2xl text-sm leading-6 text-slate-500">
          Оруулсан сэдвийнхээ хураангуй мэдээлэл болон тест үүсгээрэй. Зүүн талд
          бүх сэдэв хадгалагдана.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-6 py-6 sm:px-8">
        <form>
          <div className="flex flex-col gap-7">
            <div className="grid gap-2.5">
              <div className="flex items-center gap-1.5">
                <FileIcon />
                <Label
                  htmlFor="title"
                  className="text-sm font-medium text-slate-700"
                >
                  Сэдвийн гарчиг
                </Label>
              </div>
              <Input
                id="title"
                type="text"
                placeholder="Сэдвийн гарчгаа оруулна уу..."
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-12 rounded-xl border-slate-200 bg-white px-4 text-sm shadow-none placeholder:text-slate-400 focus-visible:border-[#7DCBD4] focus-visible:ring-2 focus-visible:ring-[#D9F7FA]"
              />
            </div>

            <div className="grid gap-2.5">
              <div className="flex items-center gap-1.5">
                <FileIcon />
                <Label
                  htmlFor="content"
                  className="text-sm font-medium text-slate-700"
                >
                  Сэдвийн агуулга
                </Label>
              </div>
              <Textarea
                id="content"
                required
                placeholder="Сэдвийн агуулгаа энд оруулна уу..."
                value={content}
                className="min-h-[260px] rounded-2xl border-slate-200 bg-white px-4 py-3 text-sm leading-6 shadow-none placeholder:text-slate-400 focus-visible:border-[#7DCBD4] focus-visible:ring-2 focus-visible:ring-[#D9F7FA]"
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          </div>
        </form>
      </CardContent>

      <CardFooter className="justify-end px-6 pb-6 pt-0 sm:px-8 sm:pb-8">
        <Button
          type="button"
          className="h-11 cursor-pointer rounded-xl bg-[#7DCBD4] px-5 text-sm font-medium text-white shadow-none transition-colors hover:bg-[#1F6066] disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={!title || !content || loading}
          onClick={handleGenerate}
        >
          {loading ? "Хураангуй үүсгэж байна..." : "Хураангуй үүсгэх"}
        </Button>
      </CardFooter>
    </Card>
  );
}
