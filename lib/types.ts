export type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
export type SafetyLevel =
  | "BLOCK_NONE"
  | "BLOCK_ONLY_HIGH"
  | "BLOCK_MEDIUM_AND_ABOVE"
  | "BLOCK_LOW_AND_ABOVE";
export type PersonGeneration = "ALLOW_ADULT" | "ALLOW_ALL" | "DONT_ALLOW";

// Model ID is a plain string — fetched dynamically from the API
export type ImageModel = string;

export type ModelFamily = "gemini" | "imagen";

export function getModelFamily(model: ImageModel): ModelFamily {
  return model.startsWith("gemini") ? "gemini" : "imagen";
}

export interface GenerationSettings {
  apiKey: string;
  model: ImageModel;
  prompt: string;
  negativePrompt: string;
  numberOfImages: number;
  aspectRatio: AspectRatio;
  safetyFilterLevel: SafetyLevel;
  personGeneration: PersonGeneration;
  seed: number | null;
  language: string;
}

export interface GeneratedImage {
  id: string;
  base64: string;
  mimeType: string;
  prompt: string;
  settings: GenerationSettings;
  timestamp: number;
  favorite: boolean;
}

export interface GenerationHistory {
  id: string;
  prompt: string;
  timestamp: number;
  settings: GenerationSettings;
  imageCount: number;
}
