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
    <div className="group relative rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700/50 hover:border-violet-500/50 transition-all">
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
            regenarting && "opacity-40"
          )}
        />

        {regenarting && (
          <div className="absolute inset-0 flex items-center justify-center">
            <RefreshCw size={32} className="text-violet-400 animate-spin" />
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Zoom icon */}
        <div className="absolute top-2 right-2 bg-black/60 rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn size={14} className="text-white" />
        </div>
      </div>

      {/* Actions */}
      <div className="absolute bottom-0 left-0 right-0 p-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex gap-1.5">
          <ActionBtn onClick={handleDownload} title="Download">
            <Download size={13} />
          </ActionBtn>
          <ActionBtn onClick={handleCopy} title={copied ? "Copied!" : "Copy"}>
            {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
          </ActionBtn>
          <ActionBtn onClick={() => onRegenerate(image)} title="Regenerate">
            <RefreshCw size={13} />
          </ActionBtn>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onFavorite(image.id); }}
          className={cn(
            "p-1.5 rounded-lg backdrop-blur-sm transition-colors",
            image.favorite
              ? "bg-pink-600/80 text-white"
              : "bg-black/60 text-zinc-300 hover:text-pink-400"
          )}
        >
          <Heart size={13} fill={image.favorite ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Image number badge */}
      <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm rounded-md px-1.5 py-0.5 text-xs text-zinc-300">
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
      className="p-1.5 bg-black/60 backdrop-blur-sm rounded-lg text-zinc-300 hover:text-white hover:bg-black/80 transition-colors"
    >
      {children}
    </button>
  );
}
