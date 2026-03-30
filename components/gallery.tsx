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
          <div className="w-20 h-20 rounded-full border-2 border-violet-500/10 border-t-violet-500 animate-spin shadow-[0_0_24px_rgba(124,58,237,0.25)]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-violet-400 font-semibold text-base tabular-nums">
              {progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0}%
            </span>
          </div>
        </div>
        <div className="text-center">
          <p className="text-white/80 font-medium">Generating images...</p>
          <p className="text-white/25 text-sm mt-1">
            {progress.done} / {progress.total} completed
          </p>
        </div>
        {progress.total > 0 && (
          <div className="w-64 bg-white/[0.06] rounded-full h-1 overflow-hidden">
            <div
              className="bg-gradient-to-r from-violet-600 to-purple-500 h-1 rounded-full transition-all duration-500"
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
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 text-xl font-bold">!</div>
        <p className="text-red-400/80 font-medium text-center">Generation Failed</p>
        <p className="text-white/25 text-sm text-center max-w-sm">{error}</p>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-5 p-8 text-center">
        <div className="w-24 h-24 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center shadow-[0_0_50px_rgba(124,58,237,0.06)]">
          <LayoutGrid size={32} className="text-white/15" />
        </div>
        <div>
          <p className="text-white/45 font-medium">No images yet</p>
          <p className="text-white/20 text-sm mt-1">Configure your settings and click Generate</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer",
              filter === "all"
                ? "bg-white/[0.08] text-white"
                : "text-white/30 hover:text-white/60"
            )}
          >
            All ({images.length})
          </button>
          <button
            onClick={() => setFilter("favorites")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all duration-200 cursor-pointer",
              filter === "favorites"
                ? "bg-white/[0.08] text-white"
                : "text-white/30 hover:text-white/60"
            )}
          >
            <Heart size={11} fill={filter === "favorites" ? "currentColor" : "none"} />
            Favorites ({favCount})
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Grid toggle */}
          <div className="flex bg-white/[0.05] rounded-lg p-0.5 border border-white/[0.06]">
            <button
              onClick={() => setColumns(2)}
              className={cn(
                "p-1.5 rounded-md transition-all duration-200 cursor-pointer",
                columns === 2 ? "bg-white/[0.1] text-white" : "text-white/25 hover:text-white/50"
              )}
            >
              <Grid2X2 size={13} />
            </button>
            <button
              onClick={() => setColumns(3)}
              className={cn(
                "p-1.5 rounded-md transition-all duration-200 cursor-pointer",
                columns === 3 ? "bg-white/[0.1] text-white" : "text-white/25 hover:text-white/50"
              )}
            >
              <LayoutGrid size={13} />
            </button>
          </div>

          <button
            onClick={handleDownloadAll}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.05] hover:bg-white/[0.08] text-white/45 hover:text-white/80 rounded-lg text-xs font-medium transition-all duration-200 border border-white/[0.07] cursor-pointer"
          >
            <Download size={12} />
            Download All
          </button>
        </div>
      </div>

      {/* Progress bar (loading more) */}
      {loading && (
        <div className="h-px bg-white/[0.04]">
          <div
            className="h-px bg-gradient-to-r from-violet-600 to-purple-500 transition-all duration-500"
            style={{ width: `${progress.total > 0 ? (progress.done / progress.total) * 100 : 30}%` }}
          />
        </div>
      )}

      {/* Grid */}
      <div className={cn(
        "flex-1 overflow-y-auto p-4 grid gap-3 content-start",
        columns === 2 ? "grid-cols-2" : "grid-cols-3"
      )}>
        {displayed.map((image) => (
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
