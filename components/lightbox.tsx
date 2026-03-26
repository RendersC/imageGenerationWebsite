"use client";

import { useEffect } from "react";
import { GeneratedImage } from "@/lib/types";
import { downloadBase64Image, copyImageToClipboard } from "@/lib/utils";
import { X, Download, Copy, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  image: GeneratedImage;
  images: GeneratedImage[];
  onClose: () => void;
  onNavigate: (image: GeneratedImage) => void;
  onFavorite: (id: string) => void;
}

export function Lightbox({ image, images, onClose, onNavigate, onFavorite }: Props) {
  const currentIndex = images.findIndex((img) => img.id === image.id);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && currentIndex > 0) onNavigate(images[currentIndex - 1]);
      if (e.key === "ArrowRight" && currentIndex < images.length - 1) onNavigate(images[currentIndex + 1]);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentIndex, images, onClose, onNavigate]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      {/* Content */}
      <div
        className="relative max-w-5xl max-h-[90vh] mx-4 flex flex-col gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div className="relative flex items-center justify-center">
          {/* Prev */}
          {currentIndex > 0 && (
            <button
              onClick={() => onNavigate(images[currentIndex - 1])}
              className="absolute left-2 z-10 p-2 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          <img
            src={`data:${image.mimeType};base64,${image.base64}`}
            alt={image.prompt}
            className="max-w-full max-h-[75vh] object-contain rounded-xl"
          />

          {/* Next */}
          {currentIndex < images.length - 1 && (
            <button
              onClick={() => onNavigate(images[currentIndex + 1])}
              className="absolute right-2 z-10 p-2 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between bg-zinc-900/80 backdrop-blur-sm rounded-xl px-4 py-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-zinc-300 truncate">{image.prompt}</p>
            <p className="text-xs text-zinc-600 mt-0.5">
              {image.settings.aspectRatio} · {image.settings.model.replace("imagen-3.0-", "").replace("-001", "")} · #{currentIndex + 1} of {images.length}
            </p>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => onFavorite(image.id)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                image.favorite ? "bg-pink-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-pink-400"
              )}
            >
              <Heart size={16} fill={image.favorite ? "currentColor" : "none"} />
            </button>
            <button
              onClick={() => copyImageToClipboard(image.base64, image.mimeType)}
              className="p-2 bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors"
            >
              <Copy size={16} />
            </button>
            <button
              onClick={() => downloadBase64Image(image.base64, image.mimeType, `imagen-${currentIndex + 1}.png`)}
              className="p-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors"
            >
              <Download size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors"
      >
        <X size={20} />
      </button>
    </div>
  );
}
