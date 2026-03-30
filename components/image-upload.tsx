"use client";

import { useRef, useState } from "react";
import { UploadedImage } from "@/lib/types";
import { generateId } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Upload, X, ImagePlus } from "lucide-react";

interface Props {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
}

function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve({ base64, mimeType: file.type });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ImageUpload({ images, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  async function addFiles(files: FileList | File[]) {
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const converted = await Promise.all(
      arr.map(async (f) => {
        const { base64, mimeType } = await fileToBase64(f);
        return { id: generateId(), base64, mimeType, name: f.name } satisfies UploadedImage;
      })
    );
    onChange([...images, ...converted]);
  }

  function remove(id: string) {
    onChange(images.filter((img) => img.id !== id));
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }

  return (
    <div className="space-y-2">
      {/* Thumbnails */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((img) => (
            <div key={img.id} className="relative group">
              <img
                src={`data:${img.mimeType};base64,${img.base64}`}
                alt={img.name}
                className="w-16 h-16 object-cover rounded-xl border border-white/[0.1]"
              />
              <button
                type="button"
                onClick={() => remove(img.id)}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 hover:bg-red-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <X size={10} className="text-white" />
              </button>
              <div className="absolute inset-0 rounded-xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-[9px] text-white/80 text-center px-1 truncate">{img.name}</span>
              </div>
            </div>
          ))}

          {/* Add more button */}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-16 h-16 rounded-xl border border-dashed border-white/[0.1] hover:border-violet-500/50 flex items-center justify-center text-white/20 hover:text-violet-400/80 transition-all duration-200 cursor-pointer"
          >
            <ImagePlus size={17} />
          </button>
        </div>
      )}

      {/* Drop zone */}
      {images.length === 0 && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center gap-2 py-5 rounded-xl border border-dashed cursor-pointer transition-all duration-200",
            dragging
              ? "border-violet-500/60 bg-violet-500/[0.07] text-violet-300/80"
              : "border-white/[0.08] hover:border-violet-500/30 text-white/20 hover:text-white/40"
          )}
        >
          <Upload size={18} />
          <div className="text-center">
            <p className="text-xs font-medium">Drop images here or click to upload</p>
            <p className="text-[10px] text-white/20 mt-0.5">PNG, JPG, WEBP</p>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && addFiles(e.target.files)}
      />
    </div>
  );
}
