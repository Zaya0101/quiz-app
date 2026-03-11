import { NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({});

type RawQuiz = {
  question?: unknown;
  options?: unknown;
  answer?: unknown;
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
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return Response.json({ error: "No message" }, { status: 400 });
    }
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
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
`,
    });
    const cleanedText = (response.text ?? "")
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
  } catch (err) {
    return Response.json(
      { error: "Server aldaa garlaa", details: String(err) },
      { status: 500 }
    );
  }
}
