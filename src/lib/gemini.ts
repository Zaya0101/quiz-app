import { GoogleGenAI } from "@google/genai";

const MODEL_CANDIDATES = ["gemini-2.5-flash", "gemini-2.5-flash-lite"] as const;
const MAX_RETRIES_PER_MODEL = 2;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getAiStatusCode(err: unknown) {
  const candidate =
    (err as { status?: number; code?: number })?.status ??
    (err as { status?: number; code?: number })?.code;

  if (
    typeof candidate === "number" &&
    Number.isInteger(candidate) &&
    candidate >= 200 &&
    candidate <= 599
  ) {
    return candidate;
  }

  return 500;
}

export function isAiOverloaded(err: unknown) {
  const status = getAiStatusCode(err);
  const message =
    err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();

  return (
    status === 429 ||
    status === 500 ||
    status === 503 ||
    message.includes("high demand") ||
    message.includes("overloaded") ||
    message.includes("unavailable")
  );
}

type GenerateTextOptions = {
  config?: Record<string, unknown>;
};

export async function generateTextWithFallback(
  prompt: string,
  options: GenerateTextOptions = {},
) {
  let lastError: unknown;

  for (const model of MODEL_CANDIDATES) {
    for (let attempt = 1; attempt <= MAX_RETRIES_PER_MODEL; attempt += 1) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          ...(options.config ? { config: options.config } : {}),
        });

        const text = response.text?.trim();

        if (!text) {
          throw new Error(`Empty response from model ${model}`);
        }

        return { text, model };
      } catch (err: unknown) {
        lastError = err;

        const shouldRetryCurrentModel =
          isAiOverloaded(err) && attempt < MAX_RETRIES_PER_MODEL;

        console.error(
          `AI generation failed on ${model}, attempt ${attempt}:`,
          err,
        );

        if (shouldRetryCurrentModel) {
          await sleep(attempt * 1000);
          continue;
        }

        if (!isAiOverloaded(err)) {
          throw err;
        }
      }
    }
  }

  throw lastError ?? new Error("AI generation failed");
}
