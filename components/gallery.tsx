"use client";

import { useState } from "react";
import { GeneratedImage } from "@/lib/types";
import { ImageCard } from "./image-card";
import { Lightbox } from "./lightbox";
import { Download, Heart, Grid2X2, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import JSZip from "jszip";
import { downloadBase64Image } from "@/lib/utils";

interface Props {
  images: GeneratedImage[];
  loading: boolean;
  progress: { done: number; total: number };
  error: string | null;
  onFavorite: (id: string) => void;
  onRegenerate: (image: GeneratedImage) => void;
}

export function Gallery({ images, loading, progress, error, onFavorite, onRegenerate }: Props) {
  const [lightboxImage, setLightboxImage] = useState<GeneratedImage | null>(null);
  const [filter, setFilter] = useState<"all" | "favorites">("all");
  const [columns, setColumns] = useState<2 | 3>(3);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  const displayed = filter === "favorites" ? images.filter((img) => img.favorite) : images;
  const favCount = images.filter((img) => img.favorite).length;

  async function handleDownloadAll() {
    const zip = new JSZip();
    images.forEach((img, i) => {
      zip.file(`image-${i + 1}.png`, img.base64, { base64: true });
    });
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `imagen-batch-${Date.now()}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleRegenerate(image: GeneratedImage) {
    setRegeneratingId(image.id);
    await onRegenerate(image);
    setRegeneratingId(null);
  }

  if (loading && images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-violet-400 font-bold text-lg">
              {progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0}%
            </span>
          </div>
        </div>
        <div className="text-center">
          <p className="text-white font-medium">Generating images...</p>
          <p className="text-zinc-500 text-sm mt-1">
            {progress.done} / {progress.total} completed
          </p>
        </div>
        {/* Progress bar */}
        {progress.total > 0 && (
          <div className="w-64 bg-zinc-800 rounded-full h-2">
            <div
              className="bg-violet-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(progress.done / progress.total) * 100}%` }}
            />
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 p-8">
        <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 text-2xl">!</div>
        <p className="text-red-400 font-medium text-center">Generation Failed</p>
        <p className="text-zinc-500 text-sm text-center max-w-sm">{error}</p>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
        <div className="w-24 h-24 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center">
          <LayoutGrid size={36} className="text-zinc-600" />
        </div>
        <div>
          <p className="text-zinc-400 font-medium">No images yet</p>
          <p className="text-zinc-600 text-sm mt-1">Configure settings and click Generate</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              filter === "all" ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            All ({images.length})
          </button>
          <button
            onClick={() => setFilter("favorites")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors",
              filter === "favorites" ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <Heart size={11} fill={filter === "favorites" ? "currentColor" : "none"} />
            Favorites ({favCount})
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Grid toggle */}
          <div className="flex bg-zinc-800 rounded-lg p-0.5">
            <button
              onClick={() => setColumns(2)}
              className={cn("p-1.5 rounded-md transition-colors", columns === 2 ? "bg-zinc-600 text-white" : "text-zinc-500")}
            >
              <Grid2X2 size={14} />
            </button>
            <button
              onClick={() => setColumns(3)}
              className={cn("p-1.5 rounded-md transition-colors", columns === 3 ? "bg-zinc-600 text-white" : "text-zinc-500")}
            >
              <LayoutGrid size={14} />
            </button>
          </div>

          <button
            onClick={handleDownloadAll}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-medium transition-colors"
          >
            <Download size={13} />
            Download All ZIP
          </button>
        </div>
      </div>

      {/* Progress bar (loading more) */}
      {loading && (
        <div className="h-0.5 bg-zinc-800">
          <div
            className="h-0.5 bg-violet-500 transition-all duration-500"
            style={{ width: `${progress.total > 0 ? (progress.done / progress.total) * 100 : 30}%` }}
          />
        </div>
      )}

      {/* Grid */}
      <div className={cn(
        "flex-1 overflow-y-auto p-5 grid gap-3 content-start",
        columns === 2 ? "grid-cols-2" : "grid-cols-3"
      )}>
        {displayed.map((image, i) => (
          <ImageCard
            key={image.id}
            image={image}
            index={images.indexOf(image)}
            onFavorite={onFavorite}
            onRegenerate={handleRegenerate}
            onOpen={setLightboxImage}
            regenarting={regeneratingId === image.id}
          />
        ))}
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <Lightbox
          image={lightboxImage}
          images={displayed}
          onClose={() => setLightboxImage(null)}
          onNavigate={setLightboxImage}
          onFavorite={onFavorite}
        />
      )}
    </div>
  );
}
