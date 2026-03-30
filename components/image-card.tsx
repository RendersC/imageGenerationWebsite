"use client";

import { useState } from "react";
import { GeneratedImage } from "@/lib/types";
import { downloadBase64Image, copyImageToClipboard } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Download, Copy, Heart, RefreshCw, ZoomIn, Check } from "lucide-react";

interface Props {
  image: GeneratedImage;
  index: number;
  onFavorite: (id: string) => void;
  onRegenerate: (image: GeneratedImage) => void;
  onOpen: (image: GeneratedImage) => void;
  regenarting?: boolean;
}

export function ImageCard({ image, index, onFavorite, onRegenerate, onOpen, regenarting }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await copyImageToClipboard(image.base64, image.mimeType);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    downloadBase64Image(
      image.base64,
      image.mimeType,
      `imagen-${index + 1}-${Date.now()}.png`
    );
  }

  return (
    <div className="group relative rounded-2xl overflow-hidden bg-white/[0.04] border border-white/[0.08] hover:border-violet-500/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(124,58,237,0.15)]">
      {/* Image */}
      <div
        className="relative cursor-zoom-in"
        onClick={() => onOpen(image)}
      >
        <img
          src={`data:${image.mimeType};base64,${image.base64}`}
          alt={image.prompt}
          className={cn(
            "w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.02]",
            regenarting && "opacity-30"
          )}
        />

        {regenarting && (
          <div className="absolute inset-0 flex items-center justify-center">
            <RefreshCw size={28} className="text-violet-400 animate-spin" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

        {/* Zoom icon */}
        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <ZoomIn size={13} className="text-white/80" />
        </div>
      </div>

      {/* Actions */}
      <div className="absolute bottom-0 left-0 right-0 p-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex gap-1.5">
          <ActionBtn onClick={handleDownload} title="Download">
            <Download size={12} />
          </ActionBtn>
          <ActionBtn onClick={handleCopy} title={copied ? "Copied!" : "Copy"}>
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          </ActionBtn>
          <ActionBtn onClick={() => onRegenerate(image)} title="Regenerate">
            <RefreshCw size={12} />
          </ActionBtn>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onFavorite(image.id); }}
          className={cn(
            "p-1.5 rounded-lg backdrop-blur-md transition-all duration-200 cursor-pointer",
            image.favorite
              ? "bg-pink-600/70 text-white shadow-[0_0_10px_rgba(236,72,153,0.3)]"
              : "bg-black/50 text-white/50 hover:text-pink-400"
          )}
        >
          <Heart size={12} fill={image.favorite ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Image number badge */}
      <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-md rounded-lg px-1.5 py-0.5 text-[10px] text-white/55 font-medium">
        #{index + 1}
      </div>
    </div>
  );
}

function ActionBtn({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      title={title}
      className="p-1.5 bg-black/50 backdrop-blur-md rounded-lg text-white/50 hover:text-white hover:bg-black/70 transition-all duration-200 cursor-pointer"
    >
      {children}
    </button>
  );
}
