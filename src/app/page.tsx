"use client";
import { AppSidebar } from "./_components/AppSidebar";
import { Header } from "./header/Header";
import SwitchCards from "./_components/SwitchCards";
import { useState } from "react";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  const [step, setStep] = useState<number>(1);
  const [selectedArticleId, setSelectedArticleId] = useState<string>("");

  return (
    <div className="min-h-screen w-full bg-[#D9F7FA]">
      <Header />
      <SignedIn>
        <div className="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-[1600px]">
          <AppSidebar
            setStep={setStep}
            setSelectedArticleId={setSelectedArticleId}
            selectedArticleId={selectedArticleId}
          />
          <main className="flex min-w-0 flex-1 justify-center px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
            <SwitchCards
              step={step}
              setStep={setStep}
              selectedArticleId={selectedArticleId}
            />
          </main>
        </div>
      </SignedIn>
      <SignedOut>
        <div className="flex min-h-[calc(100vh-73px)] items-center justify-center px-4 py-10">
            <Card className="w-full max-w-sm border border-slate-200 bg-white text-center shadow-sm">
            <CardHeader className="gap-2">
              <CardTitle className="text-xl font-semibold">
              Нэвтрэх шаардлагатай 🔒
              </CardTitle>
              <CardDescription className="text-sm text-slate-500">
                Үргэлжлүүлэхийн тулд эхлээд нэвтэрнэ үү.
                <br />
                Нэвтэрсний дараа энэ боломжийг ашиглах боломжтой.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </SignedOut>
    </div>
  );
}
