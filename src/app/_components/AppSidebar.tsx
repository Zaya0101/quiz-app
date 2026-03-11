import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";
import { useEffect, useState } from "react";
import { PanelLeftIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Article = {
  title: string;
  id: string;
};

type AppSidebarProps = {
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setSelectedArticleId: React.Dispatch<React.SetStateAction<string>>;
  selectedArticleId: string;
};

export function AppSidebar({
  setStep,
  setSelectedArticleId,
  selectedArticleId,
}: AppSidebarProps) {
  const [articleData, setArticleData] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const widths = ["w-50", "w-44", "w-48"];

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const responseArticle = await axios.get("/api/articles");
        setArticleData(responseArticle.data.articles);
        setSelectedArticleId(responseArticle.data.articles[0]?.id || "");
        console.log("Articles fetched:", responseArticle.data);
      } catch (error) {
        console.error("Error articles fetch:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Sidebar
      className="border-r border-slate-200 bg-white"
      collapsible="offcanvas"
    >
      <SidebarHeader className="border-b border-slate-100 bg-white px-5 py-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold tracking-[-0.01em] text-slate-950">
              Түүх
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Өмнө үүсгэсэн нийтлэлүүд
            </p>
          </div>
          <SidebarTrigger
            variant="ghost"
            size="icon"
            className="hidden h-9 w-9 rounded-md border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 md:flex"
          >
            <PanelLeftIcon className="size-4" />
          </SidebarTrigger>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-white px-3 py-4">
        {loading ? (
          <div className="mt-1.5 flex flex-col gap-4 px-2">
            {Array.from({ length: 30 }).map((_, index) => (
              <Skeleton
                key={index}
                className={`h-4 rounded-full ${widths[index % widths.length]}`}
              />
            ))}
          </div>
        ) : articleData.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
            <p className="text-sm font-medium text-slate-600">
              Одоогоор түүх алга
            </p>
            <p className="text-xs text-slate-500">
              Хадгалсан нийтлэлүүд энд харагдана
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {articleData.map((article, index) => (
              <Button
                onClick={() => {
                  setSelectedArticleId(article.id);
                  setStep(5);
                }}
                variant="ghost"
                key={index}
                className={cn(
                  "h-auto w-full justify-start rounded-xl px-3 py-3 text-left text-sm font-medium leading-5 text-slate-700 shadow-none transition-colors hover:bg-slate-100 hover:text-slate-950",
                  article.id === selectedArticleId &&
                    "bg-slate-100 text-slate-950"
                )}
              >
                <span className="line-clamp-3 whitespace-normal break-words">
                  {article.title}
                </span>
              </Button>
            ))}
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
