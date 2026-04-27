import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../../lib/prisma";
import {
  generateTextWithFallback,
  getAiStatusCode,
  isAiOverloaded,
} from "@/lib/gemini";

type RawQuiz = {
  question?: unknown;
  options?: unknown;
  answer?: unknown;
};

const quizResponseSchema = {
  type: "array",
  items: {
    type: "object",
    properties: {
      question: { type: "string" },
      options: {
        type: "array",
        items: { type: "string" },
        minItems: 4,
        maxItems: 4,
      },
      answer: { type: "string" },
    },
    required: ["question", "options", "answer"],
  },
};

function normalizeQuizItem(item: RawQuiz) {
  const question = typeof item.question === "string" ? item.question.trim() : "";
  const options = Array.isArray(item.options)
    ? item.options.filter((opt): opt is string => typeof opt === "string")
    : [];

  if (!question || options.length !== 4) {
    return null;
  }

  let answerIndex = -1;

  if (typeof item.answer === "number") {
    answerIndex = item.answer;
  } else if (typeof item.answer === "string") {
    const trimmedAnswer = item.answer.trim();
    const numericAnswer = Number(trimmedAnswer);

    if (Number.isInteger(numericAnswer)) {
      answerIndex = numericAnswer;
    } else {
      answerIndex = options.findIndex((option) => option === trimmedAnswer);
    }
  }

  if (answerIndex < 0 || answerIndex > 3) {
    return null;
  }

  return {
    question,
    options,
    answer: String(answerIndex),
  };
}

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ articleId: string }> },
) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is missing in .env" },
        { status: 500 },
      );
    }

    const { articleId } = await context.params;
    console.log("articleId:", articleId);

    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });

    console.log("article found:", article);

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    if (!article.content || !article.content.trim()) {
      return NextResponse.json(
        { error: "Article content is empty" },
        { status: 400 },
      );
    }

    const existingQuizzes = await prisma.quiz.findMany({
      where: { articleId },
      orderBy: { createdAt: "asc" },
    });

    if (existingQuizzes.length > 0) {
      return NextResponse.json(
        {
          success: true,
          quizzes: existingQuizzes,
        },
        { status: 200 },
      );
    }

    console.log("article content length:", article.content.length);

    const prompt = `
Доорх нийтлэл дээр үндэслэн 5 олон сонголттой асуулт үүсгэ.

Дүрэм:
- Нийтлэл ямар хэл дээр байгааг дагаж асуулт, сонголтуудыг бич.
- Хэрэв оролт Монгол хэл дээр бол бүх асуулт, сонголтыг зөв бичгийн болон утга зүйн алдаагүй кирилл Монгол хэлээр бич.
- Асуултууд нь нийтлэлийн үйл явдал, утга санаа, гол баримттай шууд холбоотой байх.
- Сонголт бүр ойлгомжтой, хоорондоо давхцахгүй, нэг л зөв хариулттай байх.
- ЗӨВХӨН хүчинтэй JSON буцаа. Тайлбар, markdown, code fence бүү нэм.

Яг энэ форматыг дага:
[
  {
    "question": "Асуултын текст",
    "options": ["Сонголт 1", "Сонголт 2", "Сонголт 3", "Сонголт 4"],
    "answer": "0"
  }
]

"answer" нь зөв хариултын индекс (0-3) байна.

Нийтлэл:
${article.content}
`;

    const { text: rawText, model } = await generateTextWithFallback(prompt, {
      config: {
        responseMimeType: "application/json",
        responseSchema: quizResponseSchema,
      },
    });

    console.log("AI response received from model:", model);
    console.log("rawText:", rawText);

    const cleanedText = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    console.log("cleanedText:", cleanedText);

    let parsed: unknown;

    try {
      parsed = JSON.parse(cleanedText);
      console.log("parsed:", parsed);
    } catch (parseError: unknown) {
      console.error("Quiz JSON parse error:", parseError);
      console.error("Raw AI response:", rawText);

      return NextResponse.json(
        {
          error: "AI did not return valid JSON",
          raw: rawText,
        },
        { status: 500 },
      );
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return NextResponse.json(
        { error: "AI returned empty or invalid quiz array" },
        { status: 500 },
      );
    }

    const normalizedQuizzes = parsed
      .map((item) => normalizeQuizItem(item as RawQuiz))
      .filter((item): item is NonNullable<typeof item> => item !== null);

    if (normalizedQuizzes.length === 0) {
      return NextResponse.json(
        { error: "AI returned quiz data in unsupported format" },
        { status: 500 },
      );
    }

    await prisma.quiz.createMany({
      data: normalizedQuizzes.map((q) => ({
        articleId,
        question: q.question,
        options: q.options,
        answer: q.answer,
      })),
    });

    const quizzes = await prisma.quiz.findMany({
      where: { articleId },
    });

    console.log("saved quizzes:", quizzes);

    return NextResponse.json(
      {
        success: true,
        quizzes,
      },
      { status: 200 },
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    const status = getAiStatusCode(err);

    console.error("Generate quizzes error FULL:", err);
    console.error("Generate quizzes error MESSAGE:", error.message);
    console.error("Generate quizzes error STACK:", error.stack);

    return NextResponse.json(
      {
        error: isAiOverloaded(err)
          ? "AI service tur achaalaltai baina. Quiz dahiad neg oroldooroi."
          : error.message || "Failed to generate quizzes",
        stack: error.stack || null,
      },
      { status },
    );
  }
}
