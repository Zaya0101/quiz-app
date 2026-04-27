import { NextRequest } from "next/server";
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

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { error: "GEMINI_API_KEY is missing in .env" },
        { status: 500 },
      );
    }

    const body = await request.json();
    const { content } = body;

    if (!content) {
      return Response.json({ error: "No message" }, { status: 400 });
    }

    const { text } = await generateTextWithFallback(`
Доорх нийтлэл дээр үндэслэн 5 олон сонголттой асуулт үүсгэ.

Дүрэм:
- Нийтлэл ямар хэл дээр байгааг дагаж асуулт, хариултын сонголтуудыг бич.
- Хэрэв оролт Монгол хэл дээр бол бүх асуулт, сонголтыг зөв бичгийн болон утга зүйн алдаагүй кирилл Монгол хэлээр бич.
- Асуултууд нь өгөгдсөн нийтлэлийн агуулга, үйлдэл, баримттай шууд холбоотой байх.
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
${content}
`, {
      config: {
        responseMimeType: "application/json",
        responseSchema: quizResponseSchema,
      },
    });

    const cleanedText = text
      .replace(/^\s*```json\s*/, "")
      .replace(/```\s*$/, "");
    console.log("Cleaned Text:", cleanedText);

    const parsed = JSON.parse(cleanedText);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return Response.json(
        { error: "AI returned empty or invalid quiz array" },
        { status: 500 },
      );
    }

    const normalizedQuizzes = parsed
      .map((item) => normalizeQuizItem(item as RawQuiz))
      .filter((item): item is NonNullable<typeof item> => item !== null);

    if (normalizedQuizzes.length === 0) {
      return Response.json(
        { error: "AI returned quiz data in unsupported format" },
        { status: 500 },
      );
    }

    return Response.json({ result: normalizedQuizzes });
  } catch (err: unknown) {
    const status = getAiStatusCode(err);
    const error = err instanceof Error ? err : new Error(String(err));

    console.error("GENERATE QUIZZES ERROR FULL:", err);

    return Response.json(
      {
        error: isAiOverloaded(err)
          ? "AI service tur achaalaltai baina. Quiz dahiad neg oroldooroi."
          : error.message || "Server aldaa garlaa",
        details: String(err),
      },
      { status }
    );
  }
}
