export interface ApiModel {
  name: string;       // e.g. "models/gemini-2.5-flash-image"
  displayName: string; // e.g. "Nano Banana"
  supportedGenerationMethods: string[];
}

export interface FetchedModel {
  id: string;         // e.g. "gemini-2.5-flash-image"
  displayName: string;
  family: "gemini" | "imagen";
}

export async function fetchAvailableImageModels(apiKey: string): Promise<FetchedModel[]> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}&pageSize=100`
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch models: ${res.status}`);
  }

  const data: { models: ApiModel[] } = await res.json();

  return data.models
    .filter((m) => {
      const id = m.name.replace("models/", "");
      // Keep only image generation models
      return (
        id.includes("image") ||
        id.includes("imagen")
      );
    })
    .map((m) => {
      const id = m.name.replace("models/", "");
      return {
        id,
        displayName: m.displayName || id,
        family: id.startsWith("gemini") ? "gemini" : "imagen",
      };
    });
}
