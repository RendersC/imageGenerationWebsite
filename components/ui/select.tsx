"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
}

export function Select({ value, onChange, options, placeholder }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-all",
          "bg-zinc-800/80 border text-left",
          open
            ? "border-violet-500 ring-1 ring-violet-500/30 text-white"
            : "border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white"
        )}
      >
        <span className={cn(!selected && "text-zinc-500")}>
          {selected?.label ?? placeholder ?? "Select..."}
        </span>
        <ChevronDown
          size={14}
          className={cn(
            "text-zinc-500 flex-shrink-0 transition-transform duration-200",
            open && "rotate-180 text-violet-400"
          )}
        />
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1.5 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl shadow-black/60 overflow-hidden">
          <div className="p-1 space-y-0.5 max-h-56 overflow-y-auto">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className={cn(
                    "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors",
                    isSelected
                      ? "bg-violet-600 text-white"
                      : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                  )}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check size={13} className="flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
