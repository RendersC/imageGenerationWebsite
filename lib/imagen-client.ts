import { GenerationSettings, GeneratedImage, getModelFamily } from "./types";
import { generateId } from "./utils";

// ── Gemini generateContent API ──────────────────────────────────────────────

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<
        | { text: string }
        | { inlineData: { mimeType: string; data: string } }
      >;
    };
  }>;
}

async function generateWithGemini(
  settings: GenerationSettings,
  onProgress?: (done: number, total: number) => void
): Promise<GeneratedImage[]> {
  const { apiKey, model, prompt, numberOfImages } = settings;
  const results: GeneratedImage[] = [];

  for (let i = 0; i < numberOfImages; i++) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ["image", "text"],
      },
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        (err as { error?: { message?: string } })?.error?.message ||
          `API error: ${res.status}`
      );
    }

    const data: GeminiResponse = await res.json();

    const imagePart = data.candidates?.[0]?.content?.parts?.find(
      (p): p is { inlineData: { mimeType: string; data: string } } =>
        "inlineData" in p
    );

    if (!imagePart) {
      throw new Error(
        "No image returned from API. The prompt may have been blocked by safety filters."
      );
    }

    results.push({
      id: generateId(),
      base64: imagePart.inlineData.data,
      mimeType: imagePart.inlineData.mimeType,
      prompt,
      settings,
      timestamp: Date.now(),
      favorite: false,
    });

    onProgress?.(i + 1, numberOfImages);
  }

  return results;
}

// ── Imagen predict API ───────────────────────────────────────────────────────

interface ImagenResponse {
  predictions: Array<{
    bytesBase64Encoded: string;
    mimeType: string;
  }>;
}

async function generateWithImagen(
  settings: GenerationSettings,
  onProgress?: (done: number, total: number) => void
): Promise<GeneratedImage[]> {
  const {
    numberOfImages,
    apiKey,
    model,
    prompt,
    negativePrompt,
    aspectRatio,
    safetyFilterLevel,
    personGeneration,
    seed,
    language,
  } = settings;

  const BATCH_SIZE = 4;
  const batches: number[] = [];
  let remaining = numberOfImages;
  while (remaining > 0) {
    batches.push(Math.min(remaining, BATCH_SIZE));
    remaining -= BATCH_SIZE;
  }

  const allImages: GeneratedImage[] = [];

  for (const batchCount of batches) {
    const body = {
      instances: [
        {
          prompt,
          ...(negativePrompt ? { negativePrompt } : {}),
        },
      ],
      parameters: {
        sampleCount: batchCount,
        aspectRatio,
        safetyFilterLevel,
        personGeneration,
        ...(seed !== null ? { seed } : {}),
        ...(language !== "auto" ? { language } : {}),
      },
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${apiKey}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        (err as { error?: { message?: string } })?.error?.message ||
          `API error: ${res.status}`
      );
    }

    const data: ImagenResponse = await res.json();

    if (!data.predictions?.length) {
      throw new Error(
        "No images returned from API. The prompt may have been blocked by safety filters."
      );
    }

    for (const pred of data.predictions) {
      allImages.push({
        id: generateId(),
        base64: pred.bytesBase64Encoded,
        mimeType: pred.mimeType || "image/png",
        prompt,
        settings,
        timestamp: Date.now(),
        favorite: false,
      });
    }

    onProgress?.(allImages.length, numberOfImages);
  }

  return allImages;
}

// ── Public entry point ───────────────────────────────────────────────────────

export async function generateImages(
  settings: GenerationSettings,
  onProgress?: (done: number, total: number) => void
): Promise<GeneratedImage[]> {
  const family = getModelFamily(settings.model);
  if (family === "gemini") {
    return generateWithGemini(settings, onProgress);
  }
  return generateWithImagen(settings, onProgress);
}
