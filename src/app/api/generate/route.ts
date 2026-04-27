import { NextRequest, NextResponse } from "next/server";
import {
  generateTextWithFallback,
  getAiStatusCode,
  isAiOverloaded,
} from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is missing in .env" },
        { status: 500 },
      );
    }

    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "No message" }, { status: 400 });
    }

    const { text, model } = await generateTextWithFallback(`
Та нийтлэлийг товч бөгөөд ойлгомжтой хураангуйл.

Дүрэм:
- Нийтлэл ямар хэл дээр байгааг дагаж хариул.
- Хэрэв оролт Монгол хэл дээр бол хариултыг зөв бичгийн болон утга зүйн алдаагүй кирилл Монгол хэлээр өг.
- Хураангуй нь эх агуулгатайгаа уялдсан, үйл явдлын дараалал болон гол санааг гажуудуулахгүй байх.
- Зөвхөн хураангуй текст буцаа. Markdown, тайлбар, нэмэлт гарчиг бүү оруул.

Нийтлэл:
${content}
`);

    return NextResponse.json({ result: text, model });
  } catch (err: unknown) {
    const error =
      err instanceof Error
        ? err
        : new Error(typeof err === "string" ? err : JSON.stringify(err));
    const maybeStatus = getAiStatusCode(err);
    const isHighDemandError = isAiOverloaded(err);

    console.error("GENERATE ERROR FULL:", err);
    console.error("GENERATE ERROR MESSAGE:", error.message);
    console.error("GENERATE ERROR STATUS:", maybeStatus);
    console.error("GENERATE ERROR STACK:", error.stack);
    console.error("GENERATE ERROR RAW:", JSON.stringify(err, null, 2));

    return NextResponse.json(
      {
        error: isHighDemandError
          ? "AI service tur achaalaltai baina. Dahiad neg oroldooroi."
          : error.message || "Failed to generate summary",
        status: maybeStatus,
      },
      { status: maybeStatus },
    );
  }
}
